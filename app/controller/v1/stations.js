'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点 stations
*/

class StationsController extends BaseController {
  /**
  * @apikey
  * @summary 站点列表
  * @description 获取所有站点
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get stations
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.stationsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.stations.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 站点
  * @description 获取某个 站点
  * @router get stations/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.stationsId, ctx.params);
    const res = await service.stations.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 站点
  * @description 创建 站点
  * @router post stations
  * @request body stationsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.stationsBodyReq, ctx.request.body);
    await ctx.service.stations.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 站点
  * @description 更新 站点
  * @router put stations/:id
  * @request path number *id eg:1
  * @request body stationsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationsPutBodyReq, params);
    const res = await service.stations.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 站点
  * @description 删除 站点
  * @router delete stations/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationsId, params);
    const res = await service.stations.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = StationsController;
