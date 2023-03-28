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
    const { ctx, app } = this;
    ctx.validate(ctx.rule.visualSharesBodyReq, ctx.request.body);
    const res = await ctx.service.visualShares.create(ctx.request.body);
    app.utils.tools.setVisualSharesCache();
    this.CREATED({ message: '创建成功', data: res.id });
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
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.visualSharesPutBodyReq, params);
    const res = await service.visualShares.update(params);
    app.utils.tools.setVisualSharesCache();
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
    const { ctx, service, app } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.visualSharesId, params);
    const res = await service.visualShares.destroy(params);
    app.utils.tools.setVisualSharesCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 获取分享可视化工程配置文件
  * @description 获取分享可视化工程配置文件
  * @router get visual-shares/:id/configs
  * @request header string sharePass '123456'
  */
  async getConfigs() {
    const { ctx } = this;
    // 校验可视化工程存不存在
  }

  /**
  * @apikey
  * @summary 分享可视化工程实时数据接口
  * @description 分享可视化工程实时数据接口
  * @router get visual-shares/:id/data
  * @request body boxDataBodyReq
  */
  async data() {

  }

  /**
  * @apikey
  * @summary 分享可视化工程数据下置
  * @description 分享可视化工程数据下置
  * @router get visual-shares/:id/down-data
  * @request body boxDataBodyReq
  */
  async downData() {

  }
}

module.exports = VisualSharesController;
