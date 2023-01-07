'use strict';

const BaseController = require('../base-controller');

/**
* @controller 设备模型 deviceModels
*/

class DeviceModelsController extends BaseController {
  /**
  * @apikey
  * @summary 设备模型列表
  * @description 获取所有设备模型
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-models
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.deviceModelsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceModels.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 设备模型
  * @description 获取某个 设备模型
  * @router get device-models/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.deviceModelsId, ctx.params);
    const res = await service.deviceModels.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 设备模型
  * @description 创建 设备模型
  * @router post device-models
  * @request body deviceModelsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.deviceModelsBodyReq, ctx.request.body);
    await ctx.service.deviceModels.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备模型
  * @description 更新 设备模型
  * @router put device-models/:id
  * @request path number *id eg:1
  * @request body deviceModelsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelsPutBodyReq, params);
    const res = await service.deviceModels.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备模型
  * @description 删除 设备模型
  * @router delete device-models/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelsDelBodyReq, params);
    const res = await service.deviceModels.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = DeviceModelsController;
