'use strict';

const BaseController = require('../base-controller');

/**
 * @controller 资源 permissions
 */

class PermissionsController extends BaseController {
  /**
   * @apikey
   * @summary 获取 资源
   * @description 获取 资源
   * @request query string keyword 资源名/标识码/标识码名/路径/动作
   * @request query string name permission名
   * @request query string mark 标识码
   * @request query string mark_name 标识码名
   * @request query string url 路径
   * @request query string action 动作
   * @request query number pageSize
   * @request query number pageNumber
   * @router get permissions
   */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.permissionPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.permissions.findAll(query);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 获取某个 资源
   * @description 获取某个 资源
   * @router get permissions/:id
   * @request path number *id eg:1 permissionID
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.permissionId, ctx.params);
    const res = await service.permissions.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 创建 资源
   * @description 创建 资源
   * @router post permissions
   * @request body permissionBodyReq
   */
  async create() {
    const { ctx, app } = this;
    ctx.validate(ctx.rule.permissionBodyReq, ctx.request.body);
    const res = await ctx.service.permissions.create(ctx.request.body);
    if (res && res.message) {
      this.BAD_REQUEST(res);
      return false;
    }
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    this.CREATED();
  }

  /**
   * @apikey
   * @summary 更新 资源
   * @description 更新 资源
   * @router put permissions
   * @request path number *id ex:1 permissionsID
   * @request body permissionPutBodyReq
   */
  async update() {
    const { ctx, service, app } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(ctx.rule.permissionPutBodyReq, params);
    const res = await service.permissions.update(params);
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 删除 资源
   * @description 删除 资源
   * @router delete permissions
   * @request path number *id ex:1 permissionsID
   */
  async destroy() {
    const { ctx, service, app } = this;
    ctx.validate(ctx.rule.permissionDelBodyReq, ctx.params);
    const res = await service.permissions.destroy(ctx.params);
    await app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = PermissionsController;
