'use strict';

const BaseController = require('../base-controller');

/**
* @controller 用户报警点位 user-alarm-tags
*/

class UserAlarmTagsController extends BaseController {
  /**
  * @apikey
  * @summary 关注点位列表
  * @description 获取所有关注点位
  * @router get user-alarm-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.userAlarmTagsQueryReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.userAlarmTags.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 关注或取消关注点位
  * @description 关注或取消关注点位
  * @router post user-alarm-tags
  * @request body userAlarmTagsBodyReq
  */
  async bulkOperation() {
    const { ctx, service } = this;
    const { type } = ctx.request.body;
    ctx.validate(ctx.rule.userAlarmTagsBodyReq, ctx.request.body);
    if (type === 1) {
      await service.userAlarmTags.bulkCreate(ctx.request.body);
    } else {
      await service.userAlarmTags.destroy(ctx.request.body);
    }
    this.SUCCESS();
  }
}

module.exports = UserAlarmTagsController;
