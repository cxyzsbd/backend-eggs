'use strict';

const BaseController = require('../base-controller');

/**
* @controller 报警 alarms
*/

class alarmsController extends BaseController {

  /**
  * @apikey
  * @summary 创建 对象
  * @description 创建 对象
  * @router post alarms
  */
  async create() {
    const { ctx, app } = this;
    // console.log('request================', ctx.request);
    const params = { ...ctx.query, ...ctx.request.body };
    // console.log('报警', params);
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
    // const { tn, boxCode } = params;
    // const redisAttr = app.redis.clients.get('attrs');
    // const allAttrs = redisAttr.get('attr_tags');
    // const allStations = redisAttr.get('stations');
    // const allDevices = redisAttr.get('devices');
    // // 按照点位找到属性列表
    // const attrs = allAttrs.filter(item => item.boxcode === boxCode && item.tagname === tn);
    // console.log('属性列表=================', attrs);
    // // 按照属性列表找到设备列表
    // let device_ids = attrs.map(item => item.device_id);
    // device_ids = new Set(device_ids);
    // device_ids = Array.from(device_ids);
    // console.log('设备id=====', device_ids);
    // // 按照设备列表找到站点列表
    // const devices = allDevices.filter(item => device_ids.includes(item.id));
    // let station_ids = devices.map(item => item.station_id);
    // station_ids = new Set(station_ids);
    // station_ids = Array.from(station_ids);
    // console.log('站点id=========================', station_ids);
    // // 按照站点找到部门列表
    // const stations = allStations.filter(item => station_ids.includes(item.id));
    // 按照部门找到所有相关的上级部门
    // 往所有部门推送报警
    this.SUCCESS();
  }
}

module.exports = alarmsController;
