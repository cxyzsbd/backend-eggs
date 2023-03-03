'use strict';

const BaseController = require('../base-controller');

/**
* @controller 网关 box-info
*/

class BoxInfoController extends BaseController {
  /**
  * @apikey
  * @summary 网关列表
  * @description 获取所有网关
  * @request query number pageSize
  * @request query number pageNumber
  * @router get box-info
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.boxInfoPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.boxInfo.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 网关
  * @description 获取某个 网关
  * @router get box-info/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.boxInfoId, ctx.params);
    const res = await service.boxInfo.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }
}

module.exports = BoxInfoController;
