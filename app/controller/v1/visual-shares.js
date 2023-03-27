'use strict';

const BaseController = require('../base-controller');

/**
* @controller 可视化分享 visual-shares
*/

class VisualSharesController extends BaseController {
  /**
  * @apikey
  * @summary 可视化分享列表
  * @description 获取所有可视化分享
  * @request query number pageSize
  * @request query number pageNumber
  * @router get visual-shares
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.visualSharesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.visualShares.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 可视化分享
  * @description 获取某个 可视化分享
  * @router get visual-shares/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.visualSharesId, ctx.params);
    const res = await service.visualShares.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 可视化分享
  * @description 创建 可视化分享
  * @router post visual-shares
  * @request body visualSharesBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.visualSharesBodyReq, ctx.request.body);
    await ctx.service.visualShares.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 可视化分享
  * @description 更新 可视化分享
  * @router put visual-shares/:id
  * @request path number *id eg:1
  * @request body visualSharesPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.visualSharesPutBodyReq, params);
    const res = await service.visualShares.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 可视化分享
  * @description 删除 可视化分享
  * @router delete visual-shares/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.visualSharesId, params);
    const res = await service.visualShares.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 获取分享可视化工程配置文件
  * @description 获取分享可视化工程配置文件
  * @router get visual-shares/:id/configs
  */
  // async getConfigs() {

  // }
}

module.exports = VisualSharesController;
