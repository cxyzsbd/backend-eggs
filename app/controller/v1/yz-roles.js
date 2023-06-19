'use strict';

const BaseController = require('../base-controller');

/**
* @controller 数字孪生角色管理 yz-roles
*/

class YzRolesController extends BaseController {
  /**
  * @apikey
  * @summary 数字孪生角色管理列表
  * @description 获取所有数字孪生角色
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get yz-roles
  */
  async findAll () {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.yzRolesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.yzRoles.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 用户数字孪生角色列表
  * @description 获取用户所有数字孪生角色
  * @request query number pageSize
  * @request query number pageNumber
  * @router get users/:user_id/yz-roles
  */
  async findUserYzRoles () {
    const { ctx, service } = this;
    const params = ctx.params;
    const rule = {
      user_id: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, params);
    const res = await service.yzRoles.findUserYzRoles(params);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 分配数字孪生角色
  * @description 分配数字孪生角色
  * @router post users/:id/yz-roles
  * @request body saveUserYzRolesBodyReq
  */
  async save () {
    const { ctx, app } = this;
    const params = {
      ...ctx.params,
      ...ctx.request.body,
    };
    ctx.validate(ctx.rule.saveUserYzRolesBodyReq, params);
    await ctx.service.yzRoles.save(params);
    app.utils.tools.youzhi_async_users();
    this.CREATED();
  }
}

module.exports = YzRolesController;
