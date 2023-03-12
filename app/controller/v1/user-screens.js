'use strict';

const BaseController = require('../base-controller');

/**
* @controller 用户默认大屏 user-screens
*/

class userScreensController extends BaseController {

  /**
  * @apikey
  * @summary 获取某个 用户默认大屏
  * @description 获取某个 用户默认大屏
  * @router get user-screens
  */
  async findOne() {
    const { ctx, service } = this;
    const res = await service.userScreens.findOne();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 用户默认大屏
  * @description 创建 用户默认大屏
  * @router post user-screens
  * @request body userScreensBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.userScreensBodyReq, ctx.request.body);
    await ctx.service.userScreens.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 删除 用户默认大屏
  * @description 删除 用户默认大屏
  * @router delete user-screens/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.userScreensId, params);
    const res = await service.userScreens.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = userScreensController;
