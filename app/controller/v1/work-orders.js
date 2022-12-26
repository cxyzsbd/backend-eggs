'use strict';

const BaseController = require('../base-controller')

/**
* @controller 工单 work-orders
*/

class WorkOrdersController extends BaseController {
  /**
  * @apikey
  * @summary 工单列表
  * @description 获取所有工单
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get work-orders
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.workOrdersPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.workOrders.findAll(query);
    this.SUCCESS(res)
  }

  /**
  * @apikey
  * @summary 获取某个 工单
  * @description 获取某个 工单
  * @router get work-orders/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.workOrdersId, ctx.params);
    const res = await service.workOrders.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 工单
  * @description 创建 工单
  * @router post work-orders
  * @request body workOrdersBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.workOrdersBodyReq, ctx.request.body);
    await ctx.service.workOrders.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 工单
  * @description 更新 工单
  * @router put work-orders/:sn
  * @request path string *sn eg:1
  * @request body workOrdersPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = {...ctx.params, ...ctx.request.body}
    ctx.validate(ctx.rule.workOrdersPutBodyReq, params);
    const res = await service.workOrders.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 工单
  * @description 删除 工单
  * @router delete work-orders/:sn
  * @request path string *sn eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.workOrdersId, params);
    const res = await service.workOrders.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 审核工单
  * @description 审核工单
  * @router  patch work-orders/:sn/approval
  * @request path string *sn eg:1
  * @request body workOrdersApprovalBodyReq
  */
  async approval() {
    const {ctx, service} = this
    const params = { ...ctx.params, ...ctx.request.body }
    ctx.validate({
      ...ctx.rule.workOrdersId,
      ...ctx.rule.workOrdersApprovalBodyReq
    }, params)
    if(params.approval_result==1 && !params.handler) {
      this.BAD_REQUEST({message: "处理人不能为空"})
      return false;
    }
    if(params.approval_result==0 && !params.not_pass_reason) {
      this.BAD_REQUEST({message: "审核不通过原因不能为空"})
      return false;
    }
    const res = await service.workOrders.approval(params)
    res? this.SUCCESS() : this.NOT_FOUND();
  }
  
  /**
  * @apikey
  * @summary 确认工单
  * @description 确认接收工单
  * @router patch work-orders/:sn/confirm
  * @request path string *sn eg:1
  */
  async confirm() {
    const {ctx, service} = this
    const params = ctx.params
    ctx.validate(ctx.rule.workOrdersId, params)
    const res = await service.workOrders.confirm(payload)
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
  
  /**
  * @apikey
  * @summary 工单完成提交
  * @description 工单完成提交
  * @router patch work-orders/:sn/complete
  * @request path string *sn eg:1
  * @request body workOrdersCompleteBodyReq
  */
  async complete() {
    const {ctx, service} = this
    const params = {...ctx.params, ...ctx.request.body};
    const rule = {...ctx.rule.workOrdersId, ...ctx.rule.workOrdersCompleteBodyReq}
    ctx.validate(rule, params)
    const res = await ctx.model.workOrders.complete(params)
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = WorkOrdersController;