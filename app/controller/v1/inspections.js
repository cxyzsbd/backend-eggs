'use strict';

const BaseController = require('../base-controller')

/**
* @controller 巡检 inspections
*/

class InspectionsController extends BaseController {
  /**
  * @apikey
  * @summary 巡检列表
  * @description 获取所有巡检
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get inspections
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.inspectionsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.inspections.findAll(query);
    this.SUCCESS(res)
  }

  /**
  * @apikey
  * @summary 获取某个 巡检
  * @description 获取某个 巡检
  * @router get inspections/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.inspectionsId, ctx.params);
    const res = await service.inspections.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 巡检
  * @description 创建 巡检
  * @router post inspections
  * @request body inspectionsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.inspectionsBodyReq, ctx.request.body);
    await ctx.service.inspections.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 巡检
  * @description 更新 巡检
  * @router put inspections/:id
  * @request path number *id eg:1
  * @request body inspectionsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = {...ctx.params, ...ctx.request.body}
    params.id = Number(params.id)
    ctx.validate(ctx.rule.inspectionsPutBodyReq, params);
    const res = await service.inspections.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 巡检
  * @description 删除 巡检
  * @router delete inspections/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.inspectionsDelBodyReq, params);
    const res = await service.inspections.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = InspectionsController;