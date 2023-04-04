'use strict';

const BaseController = require('../base-controller');

/**
* @controller 大屏文件夹 screen-folders
*/

class screenFoldersController extends BaseController {
  /**
  * @apikey
  * @summary 大屏文件夹列表
  * @description 获取所有大屏文件夹
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get screen-folders
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.screenFoldersPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.screenFolders.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 大屏文件夹
  * @description 获取某个 大屏文件夹
  * @router get screen-folders/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.screenFoldersId, ctx.params);
    const res = await service.screenFolders.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 大屏文件夹
  * @description 创建 大屏文件夹
  * @router post screen-folders
  * @request body screenFoldersBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.screenFoldersBodyReq, ctx.request.body);
    let res = await ctx.service.screenFolders.create(ctx.request.body);
    this.CREATED(res);
  }

  /**
  * @apikey
  * @summary 更新 大屏文件夹
  * @description 更新 大屏文件夹
  * @router put screen-folders/:id
  * @request path number *id eg:1
  * @request body screenFoldersPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.screenFoldersPutBodyReq, params);
    const res = await service.screenFolders.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 大屏文件夹
  * @description 删除 大屏文件夹
  * @router delete screen-folders/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.screenFoldersId, params);
    const res = await service.screenFolders.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 绑定 大屏
  * @description 绑定大屏
  * @router post screen-folders/:id/bind-screens
  * @request path number *id eg:1
  * @request body bindOrUnbindScreensReq
  */
  async bind() {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.bindOrUnbindScreensReq, params);
    const res = await service.screenFolders.bind(params);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 解绑 大屏
  * @description 解绑大屏
  * @router post screen-folders/:id/unbind-screens
  * @request path number *id eg:1
  * @request body bindOrUnbindScreensReq
  */
  async unbind() {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.bindOrUnbindScreensReq, params);
    await service.screenFolders.unbind(params);
    this.SUCCESS();
  }
  /**
  * @apikey
  * @summary 设置首页大屏
  * @description 设置首页大屏
  * @router post screen-folders/:id/default-screen
  * @request path number *id eg:1
  * @request body screenFoldersSetDefaultScreenBodyReq
  */
  async setDefaultScreen() {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.screenFoldersSetDefaultScreenBodyReq, params);
    const res = await service.screenFolders.setDefaultScreen(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = screenFoldersController;
