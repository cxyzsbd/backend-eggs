'use strict';

const BaseController = require('../base-controller');

/**
* @controller 模型绑定点位 device-model-tags
*/

class DeviceModelTagsController extends BaseController {
  /**
  * @apikey
  * @summary 模型绑定点位列表
  * @description 获取所有模型绑定点位
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-model-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.deviceModelTagsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceModelTags.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 模型绑定点位
  * @description 创建 模型绑定点位
  * @router post device-model-tags
  * @request body deviceModelTagsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.deviceModelTagsBodyReq, ctx.request.body);
    await ctx.service.deviceModelTags.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 模型绑定点位
  * @description 更新 模型绑定点位
  * @router put device-model-tags/:id
  * @request path number *id eg:1
  * @request body deviceModelTagsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelTagsPutBodyReq, params);
    const res = await service.deviceModelTags.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 模型绑定点位
  * @description 删除 模型绑定点位
  * @router delete device-model-tags/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelTagsDelBodyReq, params);
    const res = await service.deviceModelTags.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = DeviceModelTagsController;
