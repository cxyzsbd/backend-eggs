'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

/**
* @controller 设备 devices
*/

class devicesController extends BaseController {
  /**
  * @apikey
  * @summary 设备列表
  * @description 获取所有设备
  * @request query *number station_id
  * @request query number pageSize
  * @request query number pageNumber
  * @router get devices
  */
  async findAll() {
    const { ctx, service } = this;
    const rule = {
      station_id: {
        required: true,
        type: 'number',
      },
    };
    ctx.validate(rule, ctx.query);
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.devicesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.devices.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 设备
  * @description 获取某个 设备
  * @router get devices/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.devicesId, ctx.params);
    const res = await service.devices.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 设备
  * @description 创建 设备
  * @router post devices
  * @request body devicesBodyReq
  */
  async create() {
    const { ctx, app } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.devicesBodyReq, params);
    await ctx.service.devices.create(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备
  * @description 更新 设备
  * @router put devices/:id
  * @request path number *id eg:1
  * @request body devicesPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.devicesPutBodyReq, params);
    // 忽略大小写查询
    const device = await service.devices.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), station_id: params.station_id, id: { [Op.not]: params.id } });
    if (device) {
      this.BAD_REQUEST({ message: '设备名已存在' });
      return false;
    }
    const res = await service.devices.update(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备
  * @description 删除 设备
  * @router delete devices/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service, app } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.devicesId, params);
    const res = await service.devices.destroy(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 模型生成设备
  * @description 通过模型生成设备
  * @router post model-to-device
  * @request body modelToDeviceBodyReq
  */
  async modelToDevice() {
    const { ctx, service, app } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.modelToDeviceBodyReq, params);
    const model = await service.deviceModels.findOne({ id: params.model_id });
    if (!model) {
      this.BAD_REQUEST({ message: '模型不存在' });
      return false;
    }
    // 忽略大小写查询
    const device = await service.devices.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), station_id: params.station_id });
    if (device) {
      this.BAD_REQUEST({ message: '该站点下已存在同名设备，不能重复添加' });
      return false;
    }
    let data = await service.devices.modelToDevice(params);
    if (data) {
      delete data.create_at;
      delete data.update_at;
    }
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    const stations = JSON.parse(await app.utils.tools.getStationsCache());
    data = {
      station_info: null,
      ...data,
    };
    if (stations && stations.length) {
      data.station_info = (stations.filter(item => Number(item.id) === Number(params.station_id)))[0];
    }
    this.CREATED({ data, message: '成功' });
  }
}

module.exports = devicesController;
