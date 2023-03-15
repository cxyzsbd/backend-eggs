'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点资料 station-files
*/

class StationFilesController extends BaseController {
  /**
  * @apikey
  * @summary 站点资料列表
  * @description 获取所有站点资料
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get station-files
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.stationFilesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.stationFiles.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 站点资料
  * @description 获取某个 站点资料
  * @router get station-files/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.stationFilesId, ctx.params);
    const res = await service.stationFiles.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 站点资料
  * @description 创建 站点资料
  * @router post station-files
  * @request body stationFilesBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.stationFilesBodyReq, ctx.request.body);
    await ctx.service.stationFiles.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 站点资料
  * @description 更新 站点资料
  * @router put station-files/:id
  * @request path number *id eg:1
  * @request body stationFilesPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationFilesPutBodyReq, params);
    const res = await service.stationFiles.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 站点资料
  * @description 删除 站点资料
  * @router delete station-files/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationFilesId, params);
    const res = await service.stationFiles.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = StationFilesController;
