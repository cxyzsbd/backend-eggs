'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点关注点位 stationTags
*/

class StationTagsController extends BaseController {
  /**
  * @apikey
  * @summary 站点关注点位列表
  * @description 获取所有站点关注点位
  * @request query number *station_id
  * @request query number pageSize
  * @request query number pageNumber
  * @router get station-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const rule = {
      station_id: {
        type: 'number',
        required: true,
        description: '站点id',
      },
    };
    ctx.validate(rule, ctx.query);
    const res = await service.stationTags.findAll(ctx.query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 站点关注点位
  * @description 获取某个 站点关注点位
  * @router get station-tags/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.stationTagsId, ctx.params);
    const res = await service.stationTags.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 站点关注点位
  * @description 创建 站点关注点位
  * @router post station-tags
  * @request body stationTagsBodyReq
  */
  async create() {
    const { ctx } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.stationTagsBodyReq, params);
    const data = await ctx.service.stationTags.findAll({ station_id: params.station_id });
    if (data.length >= 10) {
      this.BAD_REQUEST({ message: '当前站点关注点位已达上限' });
      return false;
    }
    await ctx.service.stationTags.create(params);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 站点关注点位
  * @description 更新 站点关注点位
  * @router put station-tags/:id
  * @request path number *id eg:1
  * @request body stationTagsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationTagsPutBodyReq, params);
    const res = await service.stationTags.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 站点关注点位
  * @description 删除 站点关注点位
  * @router delete station-tags/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationTagsId, params);
    const res = await service.stationTags.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = StationTagsController;
