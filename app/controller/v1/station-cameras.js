'use strict';

const BaseController = require('../base-controller');
const { Op } = require('sequelize');

/**
* @controller 萤石云摄像设备绑定 station-cameras
*/

class StationCamerasController extends BaseController {

  /**
  * @apikey
  * @summary 根据station_id获取下面所有设备
  * @description 根据station_id获取下面所有设备
  * @router get station-cameras/list
  * @request query string *station_id eg:qwe123 盒子station_id
  */
  async findAll() {
    const { ctx, service } = this;
    const { station_id } = ctx.query;
    if (!station_id) {
      this.INVALID_REQUEST({ message: 'station_id不能为空' });
      return false;
    }
    const data = await service.stationCameras.findAll(station_id);
    data ? this.SUCCESS({ data }) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 盒子绑定设备
  * @description 盒子绑定设备
  * @router post station-cameras
  * @request body stationCameraBodyReq
  */
  async create() {
    const { ctx, service, app } = this;
    const redisPub = app.redis.clients.get('camera_photos');
    const params = ctx.request.body;
    ctx.validate(ctx.rule.stationCameraBodyReq, params);
    if (params.photo_interval && params.photo_interval < 60) {
      this.INVALID_REQUEST({ message: '抓拍周期不能低于60秒' });
      return false;
    }
    // 重复判断
    const count = await ctx.model.StationCameras.count({
      where: {
        // station_id: params.station_id,
        deviceSerial: params.deviceSerial,
      },
    });
    if (count) {
      this.INVALID_REQUEST({ message: '该设备已被绑定' });
      return false;
    }
    const res = await service.stationCameras.create(params);
    if (res && res.photo_interval) {
      // 判断是否需要定时抓拍任务
      let key = `CAMERA_PHOTOS__${res.deviceSerial}__${res.station_id}`;
      redisPub.set(key, 1);
      redisPub.expire(key, Number(res.photo_interval));
    }
    this.SUCCESS();
  }

  /**
  * @apikey
  * @summary 修改设备信息
  * @description 修改设备信息
  * @router put station-cameras/:id
  * @request path number *id 设备id
  * @request body updateStationCameraBodyReq
  */
  async update() {
    // 判断是否修改抓拍任务时间，同步到redis
    const { ctx, service, app } = this;
    const redisPub = app.redis.clients.get('camera_photos');
    // console.log('1111111',ctx.params);
    const params = { ...ctx.request.body, id: Number(ctx.params.id) };
    ctx.validate(ctx.rule.updateStationCameraBodyReq, params);
    if (params.photo_interval && params.photo_interval < 60) {
      this.INVALID_REQUEST({ message: '抓拍周期不能低于60秒' });
      return false;
    }
    const device = await service.stationCameras.findOne(params);
    if (!device) {
      this.NOT_FOUND({ message: '该设备未绑定到平台' });
      return false;
    }
    if (params.station_id || params.deviceSerial) {
      const station_id = params.station_id || device.station_id;
      const serial = params.deviceSerial || device.deviceSerial;
      // 重复判断
      const count = await ctx.model.StationCameras.count({
        where: {
          // station_id,
          deviceSerial: serial,
          id: {
            [Op.not]: params.id,
          },
        },
      });
      if (count) {
        this.INVALID_REQUEST({ message: '该设备已被绑定' });
        return false;
      }
    }
    const res = await service.stationCameras.update(params);
    // console.log('更新===================',res);
    if (this.isParam(params.photo_interval)) {
      if (res && res[0] !== 0 && device.photo_interval != params.photo_interval) {
        const deviceNew = await service.stationCameras.findOne({ id: params.id });
        // 修改了抓拍周期
        let key = `CAMERA_PHOTOS__${deviceNew.deviceSerial}__${deviceNew.station_id}`;
        if (deviceNew.photo_interval == 0) {
          // 删除抓拍任务
          redisPub.del(key);
        } else {
          // 重新设置周期时长
          redisPub.set(key, 1);
          redisPub.expire(key, Number(deviceNew.photo_interval));
        }
      }
    }
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 盒子绑定设备
  * @description 盒子绑定设备
  * @router delete station-cameras/:id
  * @request path number *id eg:1 设备id
  */
  async destroy() {
    // 删除相关定时任务
    const { ctx, service, app } = this;
    const redisPub = app.redis.clients.get('camera_photos');
    const id = Number(ctx.params.id);
    ctx.validate(ctx.rule.stationCameraId, { id });
    const device = await service.stationCameras.findOne({ id });
    if (!device) {
      this.NOT_FOUND({ message: '未找到该设备' });
      return false;
    }
    const res = await service.stationCameras.destroy({ id });
    if (res) {
      // 删除定时任务
      let key = `CAMERA_PHOTOS__${device.deviceSerial}__${device.station_id}`;
      redisPub.del(key);
    }
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
  /**
  * @apikey
  * @summary 查询设备直播地址
  * @description 查询设备直播地址
  * @router get station-cameras/play-url
  * @request query string *deviceSerial
  */
  async getCameraPlayAddress() {
    const { ctx, app } = this;
    const params = ctx.query;
    if (!params.deviceSerial) {
      this.INVALID_REQUEST({ message: '设备序列号不能为空' });
      return false;
    }
    const accessToken = await app.utils.ysCamera.getAccessToken();
    if (!accessToken) {
      this.SERVER_ERROR({ message: '调用失败，请稍后重试' });
      return false;
    }
    const url = await app.utils.ysCamera.getCameraPlayAddress(accessToken, params.deviceSerial);
    this.SUCCESS({ data: { url: url || null } });
  }
}

module.exports = StationCamerasController;
