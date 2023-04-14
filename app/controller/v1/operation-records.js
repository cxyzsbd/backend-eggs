'use strict';

const BaseController = require('../base-controller');

/**
* @controller 操作记录 operation-records
*/

class OperationRecordsController extends BaseController {
  /**
  * @apikey
  * @summary 操作记录列表
  * @description 获取所有操作记录
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get operation-records
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.operationRecordsBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.operationRecords.findAll(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 删除 操作记录
  * @description 删除 操作记录
  * @router delete operation-records/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.operationRecordsId, params);
    const res = await service.operationRecords.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = OperationRecordsController;
