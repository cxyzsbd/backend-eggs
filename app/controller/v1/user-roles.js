'use strict';

const BaseController = require('../base-controller');

/**
 * @controller 用户-角色关系 user-roles
 */

class UserRolesController extends BaseController {
  /**
   * @apikey
   * @summary 获取 用户-角色关系
   * @description 获取 用户-角色关系
   * @request path number *user_id 用户ID
   * @router get user/:user_id/roles
   */
  async findAll() {
    const { ctx, service } = this;
    const rule = {
      user_id: {
        type: 'number',
        required: true,
      },
    };
    ctx.validate(rule, ctx.params);
    const res = await service.userRoles.getUserRoles(ctx.params);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 批量操作 用户-角色关系
   * @description 批量操作 用户-角色关系
   * @router post user/:user_id/roles
   * @request path number *user_id ex:1 userID
   * @request body string *type ex:'delete' 操作类型
   * @request body array *role_ids ex:[1,2,3] 角色数组
   */
  async bulkRoles() {
    const { ctx, service, app } = this;
    const rule = {
      user_id: {
        type: 'number',
        required: true,
      },
      role_ids: {
        type: 'array',
        itemType: 'number',
        rule: {
          min: 1,
        },
        min: 1,
      },
      type: {
        type: 'enum',
        required: true,
        values: [ 'delete', 'create' ],
      },
    };
    const params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(rule, params);
    switch (params.type) {
      case 'create':
        await ctx.service.userRoles.bulkCreateRoles(params);
        await app.utils.tools.redisCacheUserinfo(params.user_id);
        this.CREATED();
        break;
      case 'delete':
        await ctx.service.userRoles.bulkDeleteRoles(params);
        await app.utils.tools.redisCacheUserinfo(params.user_id);
        this.NO_CONTENT();
        break;
    }
  }
}

module.exports = UserRolesController;
