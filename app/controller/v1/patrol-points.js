'use strict';

const BaseController = require('../base-controller');

/**
* @--controller 巡点 patrol-points
*/

class PatrolPointsController extends BaseController {
  /**
  * @apikey
  * @summary 巡点列表
  * @description 获取所有巡点
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get patrol-points
  */
  async findAll () {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.patrolPointsPutBodyReq,
      queryOrigin: ctx.query,
    });
    console.log('allRule', allRule);
    ctx.validate(allRule, query);
    const res = await service.patrolPoints.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 巡点
  * @description 获取某个 巡点
  * @router get patrol-points/:sn
  * @request path string *sn eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.patrolPointsId, ctx.params);
    const res = await service.patrolPoints.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 巡点
  * @description 创建 巡点
  * @router post patrol-points
  * @request body patrolPointsBodyReq
  */
  async create () {
    const { ctx } = this;
    ctx.validate(ctx.rule.patrolPointsBodyReq, ctx.request.body);
    await ctx.service.patrolPoints.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 巡点
  * @description 更新 巡点
  * @router put patrol-points/:sn
  * @request path string *sn eg:1
  * @request body patrolPointsPutBodyReq
  */
  async update () {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.patrolPointsPutBodyReq, params);
    const res = await service.patrolPoints.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 巡点
  * @description 删除 巡点
  * @router delete patrol-points/:sn
  * @request path string *sn eg:1
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.patrolPointsId, params);
    const res = await service.patrolPoints.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = PatrolPointsController;
