'use strict';

const BaseController = require('../base-controller');
const { Op } = require('sequelize');

/**
* @--controller 报警 alarms
*/

class alarmsController extends BaseController {

  /**
  * @apikey
  * @summary 创建 对象
  * @description 创建 对象
  * @router post alarms
  */
  async create () {
    const { ctx, app, service } = this;
    const { array_uniq } = app.utils.tools;
    const nsp = app.io.of('/');
    const {
      socketDepartmentRoomNamePrefix,
      socketCompanyAdminPrefix,
      ALARM_PUSH_EVENT_NAME,
    } = app.config;
    const rule = {
      boxCode: {
        type: 'string',
        required: true,
      },
      tn: {
        type: 'string',
        required: true,
      },
    };
    console.log('request================', ctx.request);
    const params = { ...ctx.query, ...ctx.request.body };
    console.log('params========================', params);
    ctx.validate(rule, params);
    // let newParams = app.utils.tools.lodash.cloneDeep(params);
    // delete newParams.sign;
    // const sign = await app.utils.tools.getSign(newParams);
    // console.log('sign', sign);
    // if (sign !== params.sign) {
    //   console.log('签名错误', params.sign);
    //   this.BAD_REQUEST({ message: '签名错误' });
    //   return false;
    // }
    // 推送逻辑
    let { tn, boxCode } = params;
    tn = `${tn}.PV`;
    const allAttrs = JSON.parse(await app.utils.tools.getAttrsCache());
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const allDevices = JSON.parse(await app.utils.tools.getDevicesCache());
    // 按照点位找到属性列表
    const attrs = allAttrs.filter(item => item.boxcode === boxCode && item.tagname === tn);
    console.log('属性列表=================', attrs);
    if (!attrs.length) {
      this.SUCCESS();
      return false;
    }
    // 按照属性列表找到设备列表
    let device_ids = attrs.map(item => item.device_id);
    device_ids = await array_uniq(device_ids);
    console.log('设备id=====', device_ids);
    // 按照设备列表找到站点列表
    const devices = allDevices.filter(item => device_ids.includes(item.id));
    if (!devices.length) {
      this.SUCCESS();
      return false;
    }
    let station_ids = devices.map(item => item.station_id);
    station_ids = await array_uniq(station_ids);
    console.log('站点id=========================', station_ids);
    // 按照站点找到部门列表
    const stations = allStations.filter(item => station_ids.includes(item.id));
    if (!stations.length) {
      this.SUCCESS();
      return false;
    }
    // 按照部门找到所有相关的上级部门
    const tempDepartmentIds = stations.map(item => item.department_id);
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    const tempDepartments = departments.filter(item => tempDepartmentIds.includes(item.id));
    const allDepartments = await service.departments.recursionFatherDepartments(tempDepartments);
    if (!allDepartments.length) {
      this.SUCCESS();
      return false;
    }
    console.log('所有部门===================', allDepartments);
    let companyIds = allDepartments.map(item => item.company_id);
    companyIds = await array_uniq(companyIds);
    console.log('公司id', companyIds);
    // 往所有部门推送报警
    allDepartments.forEach(item => {
      nsp.to(`${socketDepartmentRoomNamePrefix}${item.id}`).emit(ALARM_PUSH_EVENT_NAME, params);
    });
    // 往所有公司的管理员room推送
    companyIds.forEach(company_id => {
      nsp.to(`${socketCompanyAdminPrefix}${company_id}`).emit(ALARM_PUSH_EVENT_NAME, params);
    });
    this.SUCCESS();
  }

  // 模板消息推送
  async templatePush (stations, devices, attrs, { at, ac }) {
    const { ctx, app } = this;
    devices = devices.map(item => {
      let station = (stations.filter(s => s.id === item.station_id))[0] || null;
      return {
        ...item,
        station,
      };
    });
    attrs = attrs.map(item => {
      let device = (devices.filter(d => d.id === item.device_id))[0] || null;
      return {
        ...item,
        device,
      };
    });
    const attr_ids = attrs.map(item => item.id);
    const userSubAlarmAttrs = JSON.parse(await app.utils.tools.getUserSubAlarmAttrs());
    console.log('userSubAlarmAttrs=================', userSubAlarmAttrs);
    const pushAttrs = userSubAlarmAttrs.filter(item => attr_ids.includes(item.attr_id));
    console.log('pushAttrs=============================', pushAttrs);
    const userIds = pushAttrs.map(item => item.user_id);
    const wxUserInfos = await ctx.model.UserWechatInfo.findAll({
      where: {
        user_id: {
          [Op.in]: userIds,
        },
      },
      raw: true,
    });
    // 推送
    pushAttrs.forEach(async item => {
      const { user_id, attr_id } = item;
      let attr = (attrs.filter(a => a.id === attr_id))[0] || null;
      let user = (wxUserInfos.filter(w => w.user_id === user_id))[0] || null;
      if (attr && user) {
        const data = {
          starttime: at,
          content: ac,
          gh_openid: user.gh_openid,
          attr: attr.name,
          device: attr?.device?.name || '',
          station: attr?.device?.station?.name || '',
        };
        console.log('报警模板消息推送内容=================', data);
        app.utils.wx.systermAlarmMessage(data);
      }
    });
  }

  /**
  * @apikey
  * @summary 事件推送
  * @description 事件推送
  * @router post report-events
  */
  async reportEvents () {
    const { ctx, app, service } = this;
    const { array_uniq } = app.utils.tools;
    const nsp = app.io.of('/');
    const {
      socketDepartmentRoomNamePrefix,
      socketCompanyAdminPrefix,
      ATTR_EVENT_PUSH_NAME,
    } = app.config;
    const rule = {
      deviceId: {
        type: 'number',
        required: true,
      },
    };
    const params = { ...ctx.query, ...ctx.request.body };
    ctx.validate(rule, params);
    const { deviceId } = params;
    const device_id = deviceId;
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const allDevices = JSON.parse(await app.utils.tools.getDevicesCache());
    // 按照设备列表找到站点列表
    const devices = allDevices.filter(item => item.id === device_id);
    if (!devices.length) {
      this.SUCCESS();
      return false;
    }
    let station_ids = devices.map(item => item.station_id);
    station_ids = await array_uniq(station_ids);
    console.log('站点id=========================', station_ids);
    // 按照站点找到部门列表
    const stations = allStations.filter(item => station_ids.includes(item.id));
    if (!stations.length) {
      this.SUCCESS();
      return false;
    }
    // 按照部门找到所有相关的上级部门
    const tempDepartmentIds = stations.map(item => item.department_id);
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    const tempDepartments = departments.filter(item => tempDepartmentIds.includes(item.id));
    const allDepartments = await service.departments.recursionFatherDepartments(tempDepartments);
    if (!allDepartments.length) {
      this.SUCCESS();
      return false;
    }
    console.log('所有部门===================', allDepartments);
    let companyIds = allDepartments.map(item => item.company_id);
    companyIds = await array_uniq(companyIds);
    console.log('公司id', companyIds);
    // 往所有部门推送事件
    allDepartments.forEach(item => {
      nsp.to(`${socketDepartmentRoomNamePrefix}${item.id}`).emit(ATTR_EVENT_PUSH_NAME, params);
    });
    // 往所有公司的管理员room推送
    companyIds.forEach(company_id => {
      nsp.to(`${socketCompanyAdminPrefix}${company_id}`).emit(ATTR_EVENT_PUSH_NAME, params);
    });
    this.SUCCESS();
  }

  /**
  * @apikey
  * @summary 实时报警
  * @description 实时报警列表
  * @router get realtime-alarms
  * @request query string station_id '站点id'
  * @request query string device_id '设备id'
  * @request query string attr_id '属性id'
  * @request query string getinfo 'getinfo,0为只获取报警条数，1为获取全部详细信息'
  */
  async getAlarms () {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { station_id = null, device_id = null, attr_id = null, getinfo = 1 } = ctx.query;
    const allAttrs = JSON.parse(await app.utils.tools.getAttrsCache());
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const allDevices = JSON.parse(await app.utils.tools.getDevicesCache());
    // 获取部门、站点、设备、属性
    // 获取用户下面的部门
    const departments = await ctx.service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    console.log('departmentIds==========', departmentIds);
    // 获取站点
    const stations = station_id !== null ? allStations.filter(item => departmentIds.includes(item.department_id) && `${item.id}` === `${station_id}`) : allStations.filter(item => departmentIds.includes(item.department_id));
    if (!stations || !stations.length) {
      this.NOT_FOUND({
        message: '无站点或无权限',
      });
      return false;
    }
    const station_ids = stations.map(item => `${item.id}`);
    // 获取设备
    const devices = device_id !== null ? allDevices.filter(item => station_ids.includes(`${item.station_id}`) && `${item.id}` === `${device_id}`) : allDevices.filter(item => station_ids.includes(`${item.station_id}`));
    if (!devices || !devices.length) {
      this.NOT_FOUND({
        message: '无设备或无权限',
      });
      return false;
    }
    const device_ids = devices.map(item => `${item.id}`);
    // 获取属性
    const attrs = attr_id !== null ? allAttrs.filter(item => device_ids.includes(`${item.device_id}`) && `${item.id}` === `${attr_id}`) : allAttrs.filter(item => device_ids.includes(`${item.device_id}`));
    if (!attrs || !attrs.length) {
      this.NOT_FOUND({
        message: '属性不存在或无权限',
      });
      return false;
    }
    let alarmAttrs = attrs.filter(item => item.boxcode?.length && item.tagname?.length);
    const res = await ctx.curl(`${requestBaseUrl}box-data/alarm?getinfo=${getinfo}`, {
      method: 'POST',
      rejectUnauthorized: false,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      dataType: 'json',
      data: alarmAttrs,
    }).catch(err => {
      ctx.logger.error('实时报警请求返回错误==============', err);
      return false;
    });
    if (!res) {
      this.SERVER_ERROR();
      return false;
    }
    this.SUCCESS(res.data || []);
  }

  /**
  * @apikey
  * @summary 历史报警
  * @description 历史报警列表
  * @router get his-alarms
  * @request query string station_id '站点id'
  * @request query string device_id '设备id'
  * @request query string attr_id '属性id'
  * @request query string *st '开始时间'
  * @request query string *et '结束时间'
  * @request query string max '条数,不传默认500'
  */
  async getHisAlarms () {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const rule = {
      st: {
        type: 'string',
        required: true,
      },
      et: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, ctx.query);
    const { station_id = null, device_id = null, attr_id = null, st = null, et = null, max = 500 } = ctx.query;
    const allAttrs = JSON.parse(await app.utils.tools.getAttrsCache());
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const allDevices = JSON.parse(await app.utils.tools.getDevicesCache());
    // 获取部门、站点、设备、属性
    // 获取用户下面的部门
    const departments = await ctx.service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    // 获取站点
    const stations = station_id !== null ? allStations.filter(item => departmentIds.includes(item.department_id) && `${item.id}` === `${station_id}`) : allStations.filter(item => departmentIds.includes(item.department_id));
    if (!stations || !stations.length) {
      this.NOT_FOUND({
        message: '无站点或无权限',
      });
      return false;
    }
    const station_ids = stations.map(item => `${item.id}`);
    // 获取设备
    const devices = device_id !== null ? allDevices.filter(item => station_ids.includes(`${item.station_id}`) && `${item.id}` === `${device_id}`) : allDevices.filter(item => station_ids.includes(`${item.station_id}`));
    if (!devices || !devices.length) {
      this.NOT_FOUND({
        message: '无设备或无权限',
      });
      return false;
    }
    const device_ids = devices.map(item => `${item.id}`);
    // 获取属性
    const attrs = attr_id !== null ? allAttrs.filter(item => device_ids.includes(`${item.device_id}`) && `${item.id}` === `${attr_id}`) : allAttrs.filter(item => device_ids.includes(`${item.device_id}`));
    if (!attrs || !attrs.length) {
      this.NOT_FOUND({
        message: '属性不存在或无权限',
      });
      return false;
    }
    let alarmAttrs = attrs.filter(item => item.boxcode?.length && item.tagname?.length);
    const res = await ctx.curl(`${requestBaseUrl}box-data/his-alarm?st=${st}&et=${et}&max=${max}`, {
      method: 'POST',
      rejectUnauthorized: false,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      dataType: 'json',
      data: alarmAttrs,
    }).catch(err => {
      ctx.logger.error('历史报警请求返回错误==============', err);
      return false;
    });
    if (!res) {
      this.SERVER_ERROR();
      return false;
    }
    this.SUCCESS(res.data || []);
  }
}

module.exports = alarmsController;
