'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

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
    const { ctx, service, app } = this;
    const { company_id } = ctx.request.header;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.stationsBodyReq, params);
    // 忽略大小写查询
    const station = await service.stations.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), company_id }, false);
    if (station) {
      this.BAD_REQUEST({ message: '已存在同名站点，不能重复添加' });
      return false;
    }
    await service.stations.create(params);
    await app.utils.tools.setStationsCache();
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
    const { ctx, service, app } = this;
    const { company_id } = ctx.request.header;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationsPutBodyReq, params);
    // 忽略大小写查询
    const station = await service.stations.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), company_id, id: { [Op.not]: params.id } }, false);
    if (station) {
      this.BAD_REQUEST({ message: '站点名已存在' });
      return false;
    }
    const res = await service.stations.update(params);
    if (res && res[0] !== 0) {
      await app.utils.tools.setStationsCache();
    }
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
    const { ctx, service, app } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationsId, params);
    const res = await service.stations.destroy(params);
    await app.utils.tools.setStationsCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = StationsController;
