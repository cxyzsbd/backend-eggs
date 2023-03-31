'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点关注属性 station-attrs
*/

class stationAttrsController extends BaseController {
  /**
  * @apikey
  * @summary 站点关注属性列表
  * @description 获取所有站点关注属性
  * @router get station-attrs
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
    const res = await service.stationAttrs.findAll(ctx.query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 站点关注属性
  * @description 获取某个 站点关注属性
  * @router get station-attrs/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.stationAttrsId, ctx.params);
    const res = await service.stationAttrs.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 站点关注属性
  * @description 创建 站点关注属性
  * @router post station-attrs
  * @request body stationAttrsBodyReq
  */
  async create() {
    const { ctx } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.stationAttrsBodyReq, params);
    const data = await ctx.service.stationAttrs.findAll({ station_id: params.station_id });
    if (data.length >= 10) {
      this.BAD_REQUEST({ message: '当前站点订阅属性已达上限' });
      return false;
    }
    await ctx.service.stationAttrs.create(params);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 站点关注属性
  * @description 更新 站点关注属性
  * @router put station-attrs/:id
  * @request path number *id eg:1
  * @request body stationAttrsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationAttrsPutBodyReq, params);
    const res = await service.stationAttrs.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 站点关注属性
  * @description 删除 站点关注属性
  * @router delete station-attrs/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.stationAttrsId, params);
    const res = await service.stationAttrs.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = stationAttrsController;
