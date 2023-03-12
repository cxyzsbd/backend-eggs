'use strict';

const BaseController = require('../base-controller');

/**
* @controller 角色-大屏 role-screens
*/

class RoleScreensController extends BaseController {
  /**
  * @apikey
  * @summary 角色大屏列表
  * @description 角色大屏列表
  * @request query string role_id
  * @router get role-screens
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.roleScreensBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.roleScreens.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 绑定大屏或取消绑定大屏
  * @description 绑定大屏或取消绑定大屏
  * @router post role-screens
  * @request body roleScreensBodyReq
  */
  async bulkOperation() {
    const { ctx, service } = this;
    const { action_type } = ctx.request.body;
    ctx.validate(ctx.rule.roleScreensBodyReq, ctx.request.body);
    if (action_type === 1) {
      await service.roleScreens.bulkCreate(ctx.request.body);
    } else {
      await service.roleScreens.destroy(ctx.request.body);
    }
    this.SUCCESS();
  }
}

module.exports = RoleScreensController;
