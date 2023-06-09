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
      device_id: {
        type: 'number',
        required: true,
      },
    };
    const params = { ...ctx.query, ...ctx.request.body };
    ctx.validate(rule, params);
    const { device_id } = params;
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
}

module.exports = alarmsController;
