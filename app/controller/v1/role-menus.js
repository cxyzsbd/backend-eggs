'use strict';

const BaseController = require('../base-controller');

/**
 * @controller 角色-菜单关系 role-menus
 */

class RoleMenusController extends BaseController {
  /**
   * @apikey
   * @summary 获取 角色-菜单关系
   * @description 获取 角色-菜单关系
   * @request query number role_id 角色ID
   * @request query number menu_id 菜单ID
   * @request query number pageSize
   * @request query number pageNumber
   * @router get role-menus
   */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.role_menuPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.roleMenus.findAll(query);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 获取某个 角色-菜单关系表
   * @description 获取某个 角色-菜单关系表
   * @router get role-menus/:id
   * @request query number *id eg:1 role_menuID
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.role_menuId, ctx.params);
    const res = await service.roleMenus.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 创建 角色-菜单关系表
   * @description 创建 角色-菜单关系表
   * @router post role-menus
   * @request body role_menuBodyReq
   */
  async create() {
    const { ctx, app } = this;
    ctx.validate(ctx.rule.role_menuBodyReq, ctx.request.body);
    const res = await ctx.service.roleMenus.create(ctx.request.body);
    // 1.将部门列表平铺数据缓存到redis
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    res ? this.CREATED() : this.BAD_REQUEST();
  }

  /**
   * @apikey
   * @summary 更新 角色-菜单关系表
   * @description 更新 角色-菜单关系表
   * @router put role-menus/:id
   * @request path number *id ex:1
   * @request body role_menuPutBodyReq
   */
  async update() {
    const { ctx, service, app } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(ctx.rule.role_menuPutBodyReq, params);
    const res = await service.roleMenus.update(params);
    if (res && res._wrong_code) {
      this.BAD_REQUEST();
      return false;
    }
    // 1.将部门列表平铺数据缓存到redis
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 删除 角色-菜单关系表
   * @description 删除 角色-菜单关系表
   * @router delete role-menus/:id
   * @request body role_menuId
   */
  async destroy() {
    const { ctx, service, app } = this;
    ctx.validate(ctx.rule.role_menuId, ctx.params);
    const res = await service.roleMenus.destroy(ctx.params);
    // 1.将部门列表平铺数据缓存到redis
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 批量操作 单角色-多菜单关系
   * @description 批量操作 单角色-多菜单关系
   * @router post role/:id/menus
   * @request path number *role_id ex:1 role_id
   * @request body string *type ex:"delete" 操作类型
   * @request body array *menu_ids ex:[1,2] menu_ids
   */
  async bulkMenus() {
    const { ctx, app } = this;
    const rule = {
      role_id: ctx.rule.role_menuPutBodyReq.role_id,
      menu_ids: {
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
        await ctx.service.roleMenus.bulkCreateMenus(params);
        // 1.将部门列表平铺数据缓存到redis
        await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
        this.CREATED();
        break;
      case 'delete':
        await ctx.service.roleMenus.bulkDeleteMenus(params);
        // 1.将部门列表平铺数据缓存到redis
        await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
        this.NO_CONTENT();
        break;
    }
  }
}

module.exports = RoleMenusController;
