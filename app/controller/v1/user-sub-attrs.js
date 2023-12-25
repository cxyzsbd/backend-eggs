'use strict';

const BaseController = require('../base-controller');

/**
* @controller 用户订阅点位 user-sub-attrs
*/

class UserSubAttrsController extends BaseController {
  /**
  * @apikey
  * @summary 订阅点位列表
  * @description 获取所有订阅点位
  * @router get user-sub-attrs
  */
  async findAll () {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.userSubAttrsBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    if (ctx.query.station_id && !query.where.attr_id) {
      const arr = await service.stations.getTag({ where: {}, station_id: ctx.query.station_id });
      query.where.attr_id = [];
      if (arr && arr.data) {
        query.where.attr_id = arr.data.map(v => v.id);
      }
      delete query.where.station_id;
    }
    const res = await service.userSubAttrs.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 关注或取消订阅点位
  * @description 关注或取消订阅点位
  * @router post user-sub-attrs
  * @request body userSubAttrsBodyReq
  */

  async bulkOperation () {
    const { ctx, service, app } = this;
    const { action_type } = ctx.request.body;
    ctx.validate(ctx.rule.userSubAttrsBodyReq, ctx.request.body);
    if (action_type === 1) {
      await service.userSubAttrs.bulkCreate(ctx.request.body);
    } else {
      await service.userSubAttrs.destroy(ctx.request.body);
    }
    this.SUCCESS();
  }
}

module.exports = UserSubAttrsController;
