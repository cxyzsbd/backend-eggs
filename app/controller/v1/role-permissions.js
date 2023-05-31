'use strict';

const BaseController = require('../base-controller');

/**
 * @controller 角色-资源关系 role-permissions
 */

class RolePermissionsController extends BaseController {
  /**
   * @apikey
   * @summary 获取 角色-资源关系
   * @description 获取 角色-资源关系
   * @request query string role_id 角色ID
   * @request query string permission_id 资源ID
   * @request query number pageSize
   * @request query number pageNumber
   * @router get role-permissions
   */
  async findAll() {
    const { ctx, service } = this;
    const params = ctx.query;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.role_permissionPutBodyReq,
      queryOrigin: params,
    });
    ctx.validate(allRule, query);
    const { role_id, pageSize } = params;
    if (!role_id && pageSize <= 0) {
      this.BAD_REQUEST({ message: '分页参数错误' });
      return false;
    }
    const res = await service.rolePermissions.findAll(query);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 获取某个 角色-资源关系
   * @description 获取某个 角色-资源关系
   * @router get role-permissions/:id
   * @request path number *id eg:1 role_permissionID
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.role_permissionId, ctx.params);
    const res = await service.rolePermissions.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 创建 角色-资源关系
   * @description 创建 角色-资源关系
   * @router post role-permissions
   * @request body role_permissionBodyReq
   */
  async create() {
    const { ctx, service, app } = this;
    // console.log(123123);
    ctx.validate(ctx.rule.role_permissionBodyReq, ctx.request.body);
    await service.rolePermissions.create(ctx.request.body);
    // 将所有权限数据缓存到redis
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    this.CREATED();
  }

  /**
   * @apikey
   * @summary 更新 角色-资源关系
   * @description 更新 角色-资源关系
   * @router put role-permissions/:id
   * @request path *id ex:1
   * @request body role_permissionPutBodyReq
   */
  async update() {
    const { ctx, service, app } = this;
    // const {department_id} = ctx.request.header
    const params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.role_permissionPutBodyReq, params);
    // const role = await ctx.model.Roles.findOne({where:{id:params.id}, raw: true})
    // if(role && role.department_id==0 && department_id!=0) {
    //   this.INVALID_REQUEST({message: "无权限修改该角色"})
    //   return false
    // }
    const res = await service.rolePermissions.update(params);
    if (res && res._wrong_code) {
      this[res._wrong_code]();
      return false;
    }
    // 将所有权限数据缓存到redis
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 批量删除 角色-资源关系表
   * @description 批量删除 角色-资源关系表
   * @router delete /api/v1/role_permissions
   * @request body role_permissionDelBodyReq
   */
  async destroy() {
    const { ctx, service, app } = this;
    ctx.validate(ctx.rule.role_permissionDelBodyReq, ctx.request.body);
    const res = await service.rolePermissions.destroy(ctx.request.body);
    // 将所有权限数据缓存到redis
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 批量操作 单角色-多资源关系
   * @description 批量操作 单角色-多资源关系
   * @router post role/:role_id/permissions
   * @request path number *role_id ex:1 roleID
   * @request body role_permissionBodyReq
   * @request body string *type ex:"delete" 操作类型
   */
  async bulkPremissions() {
    const { ctx, app } = this;
    const rule = {
      role_id: ctx.rule.role_permissionBodyReq.role_id,
      permission_ids: {
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
        await ctx.service.rolePermissions.bulkCreatePremissions(params);
        // 将所有权限数据缓存到redis
        await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
        this.CREATED();
        break;
      case 'delete':
        await ctx.service.rolePermissions.bulkDeletePermissions(params);
        // 将所有权限数据缓存到redis
        await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
        this.NO_CONTENT();
        break;
    }
  }
}

module.exports = RolePermissionsController;
