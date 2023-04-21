'use strict';

const BaseController = require('../base-controller');

/**
* @controller 设备台账 equipment-accounts
*/

class EquipmentAccountsController extends BaseController {
  /**
  * @apikey
  * @summary 设备台账列表
  * @description 获取所有设备台账
  * @request query number pageSize
  * @request query number pageNumber
  * @router get equipment-accounts
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.equipmentAccountsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.equipmentAccounts.findAll(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 设备台账
  * @description 获取某个 设备台账
  * @router get equipment-accounts/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.equipmentAccountsId, ctx.params);
    const res = await service.equipmentAccounts.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 设备台账
  * @description 创建 设备台账
  * @router post equipment-accounts
  * @request body equipmentAccountsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.equipmentAccountsBodyReq, ctx.request.body);
    await ctx.service.equipmentAccounts.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备台账
  * @description 更新 设备台账
  * @router put equipment-accounts/:id
  * @request path string *id eg:1
  * @request body equipmentAccountsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.equipmentAccountsPutBodyReq, params);
    const res = await service.equipmentAccounts.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备台账
  * @description 删除 设备台账
  * @router delete equipment-accounts/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.equipmentAccountsId, params);
    const res = await service.equipmentAccounts.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 台账操作记录
  * @description 台账操作记录
  * @request query number pageSize
  * @request query number pageNumber
  * @router get equipment-accounts/:id/operation-records
  * @request path string *id eg:1
  */
  async operationRecords() {
    const { ctx, service } = this;
    const params = { ...ctx.query, ...ctx.params };
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.equipmentAccountsId,
      queryOrigin: params,
    });
    ctx.validate(allRule, query);
    const res = await service.equipmentAccounts.operationRecords(query, queryOrigin);
    this.SUCCESS(res);
  }
}

module.exports = EquipmentAccountsController;
