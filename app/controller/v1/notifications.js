'use strict';

const BaseController = require('../base-controller');

/**
* @controller 消息 notifications
*/

class notificationsController extends BaseController {
  /**
  * @apikey
  * @summary 消息列表
  * @description 获取所有消息
  * @request query number pageSize
  * @request query number pageNumber
  * @router get notifications
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.notificationsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.notifications.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 消息
  * @description 获取某个 消息
  * @router get notifications/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.notificationsId, ctx.params);
    const res = await service.notifications.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 消息
  * @description 删除 消息
  * @router delete notifications/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.notificationsDelBodyReq, params);
    const res = await service.notifications.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = notificationsController;
