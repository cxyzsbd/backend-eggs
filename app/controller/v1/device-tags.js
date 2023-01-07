'use strict';

const BaseController = require('../base-controller');

/**
* @controller 设备绑定点位 device-tags
*/

class DeviceTagsController extends BaseController {
  /**
  * @apikey
  * @summary 设备绑定点位列表
  * @description 获取所有设备绑定点位
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.deviceTagsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceTags.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 设备绑定点位
  * @description 创建 设备绑定点位
  * @router post device-tags
  * @request body deviceTagsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.deviceTagsBodyReq, ctx.request.body);
    await ctx.service.deviceTags.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备绑定点位
  * @description 更新 设备绑定点位
  * @router put device-tags/:id
  * @request path number *id eg:1
  * @request body deviceTagsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceTagsPutBodyReq, params);
    const res = await service.deviceTags.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备绑定点位
  * @description 删除 设备绑定点位
  * @router delete device-tags/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceTagsDelBodyReq, params);
    const res = await service.deviceTags.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = DeviceTagsController;
