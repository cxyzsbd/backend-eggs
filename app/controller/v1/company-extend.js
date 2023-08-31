'use strict';

const BaseController = require('../base-controller');

/**
* @controller 超管管理公司三方账号 company/extend
*/

class CompanyExtendController extends BaseController {
  /**
  * @apikey
  * @summary 列表
  * @description 获取所有
  * @request query number pageSize
  * @request query number pageNumber
  * @router get company/extend
  */
  async findAll () {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.companyExtendPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.companyExtend.findAll(query);
    this.SUCCESS(res);
  }


  /**
  * @apikey
  * @summary 获取某个
  * @description 获取某个
  * @router get company/extend/:id
  * @request path number *id eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.companyExtendId, ctx.params);
    const res = await service.companyExtend.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建
  * @description 创建
  * @router post company/extend
  * @request body companyExtendBodyReq
  */
  async create () {
    const { ctx } = this;
    ctx.validate(ctx.rule.companyExtendBodyReq, ctx.request.body);
    await ctx.service.companyExtend.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新
  * @description 更新
  * @router put company/extend/:id
  * @request path number *id eg:1
  * @request body companyExtendPutBodyReq
  */
  async update () {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.companyExtendPutBodyReq, params);
    const res = await service.companyExtend.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除
  * @description 删除
  * @router delete company/extend/:id
  * @request path string *id eg:1
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.companyExtendId, params);
    const res = await service.companyExtend.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

}

module.exports = CompanyExtendController;
