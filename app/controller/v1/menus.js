'use strict';
const BaseController = require('../base-controller');

/**
 * @controller 菜单 menus
 */

class MenusController extends BaseController {
  /**
   * @apikey
   * @summary 获取 菜单
   * @description 获取 菜单
   * @request query string name 菜单名
   * @request query string title 菜单标题
   * @request query number pageSize
   * @request query number pageNumber
   * @router get menus
   */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.menuPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.menus.findAll(query);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 获取某个 菜单
   * @description 获取某个 菜单
   * @router get menus/:id
   * @request path number *id eg:1 menuID
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.menuId, ctx.params);
    const res = await service.menus.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 创建 菜单
   * @description 创建 菜单
   * @router post menus
   * @request body menuBodyReq
   */
  async create() {
    const ctx = this.ctx;
    ctx.validate(ctx.rule.menuBodyReq, ctx.request.body);
    await ctx.service.menus.create(ctx.request.body);
    this.CREATED();
  }

  /**
   * @apikey
   * @summary 更新 菜单
   * @description 更新 菜单
   * @router put menus/:id
   * @request path number *id eg:1 menuID
   * @request body menuPutBodyReq
   */
  async update() {
    const { ctx, service } = this;
    const params = { ...ctx.params, ...ctx.request.body };
    // console.log('params',params)
    ctx.validate(ctx.rule.menuPutBodyReq, params);
    const res = await service.menus.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 删除 菜单
   * @description 删除 菜单
   * @router delete menus/:id
   * @request path number *id eg:1 menuID
   */
  async destroy() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.menuDelBodyReq, ctx.params);
    const res = await service.menus.destroy(ctx.params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 获取 用户菜单
   * @description 获取 用户菜单
   * @router get users/:id/menus
   */
  async userMenus() {
    const { ctx, service } = this;
    const res = await service.menus.userMenus();
    this.SUCCESS(res);
  }
}

module.exports = MenusController;
