'use strict';

const BaseController = require('../base-controller');

/**
* @controller 流程图 flows
*/

class flowsController extends BaseController {
  /**
  * @apikey
  * @summary 流程图列表
  * @description 获取所有流程图
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get flows
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.flowsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.flows.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 流程图
  * @description 获取某个 流程图
  * @router get flows/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.flowsId, ctx.params);
    const res = await service.flows.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 流程图
  * @description 创建 流程图
  * @router post flows
  * @request body flowsBodyReq
  */
  async create() {
    const { ctx } = this;
    const rule = {
      ...ctx.rule.flowsBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, ctx.request.body);
    await ctx.service.flows.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 流程图
  * @description 更新 流程图
  * @router put flows/:id
  * @request path string *id eg:1
  * @request body flowsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.rule.flowsBodyReq.name.required = false;
    const rule = {
      ...ctx.rule.flowsBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, params);
    const res = await service.flows.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 流程图
  * @description 删除 流程图
  * @router delete flows/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 流程图回收站列表
  * @description 流程图回收站列表
  * @router get recovery-flows
  */
  async recoveryFlowsList() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.flowsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.flows.recoveryFlowsList(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 强力删除回收站流程图
  * @description 强力删除回收站流程图
  * @router delete recovery-flows/:id
  * @request path string *id eg:1
  */
  async forceDelete() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.forceDelete(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 恢复回收站的流程图
  * @description 恢复回收站的流程图
  * @router patch recovery-flows/:id
  * @request path string *id eg:1
  */
  async recoveryFlows() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.recoveryFlows(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = flowsController;
