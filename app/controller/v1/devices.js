'use strict';

const BaseController = require('../base-controller');

/**
* @controller 设备 devices
*/

class devicesController extends BaseController {
  /**
  * @apikey
  * @summary 设备列表
  * @description 获取所有设备
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get devices
  */
  async findAll() {
    const { ctx, service } = this;
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
    const { ctx } = this;
    ctx.validate(ctx.rule.devicesBodyReq, ctx.request.body);
    await ctx.service.devices.create(ctx.request.body);
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
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.devicesPutBodyReq, params);
    const res = await service.devices.update(params);
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
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.devicesId, params);
    const res = await service.devices.destroy(params);
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
    const { ctx, service } = this;
    ctx.validate(ctx.rule.modelToDeviceBodyReq, ctx.request.body);
    const model = await service.deviceModels.findOne({ id: ctx.request.body.model_id });
    if (!model) {
      this.BAD_REQUEST({ message: '模型不存在' });
      return false;
    }
    await service.devices.modelToDevice(ctx.request.body);
    this.CREATED();
  }
}

module.exports = devicesController;
