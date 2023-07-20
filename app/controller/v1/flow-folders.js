'use strict';

const BaseController = require('../base-controller');

/**
* @controller 流程图文件夹 flow-folders
*/

class flowFoldersController extends BaseController {
  /**
  * @apikey
  * @summary 流程图文件夹列表
  * @description 获取所有流程图文件夹
  * @request query string name
  * @request query number component
  * @request query number pageSize
  * @request query number pageNumber
  * @router get flow-folders
  */
  async findAll () {
    const { ctx, service } = this;
    let params = ctx.query;
    if (!params.component) {
      params.component = 0;
    }
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.flowFoldersPutBodyReq,
      queryOrigin: params,
    });
    ctx.validate(allRule, query);
    const res = await service.flowFolders.findAll(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 流程图文件夹
  * @description 获取某个 流程图文件夹
  * @router get flow-folders/:id
  * @request path number *id eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.flowFoldersId, ctx.params);
    const res = await service.flowFolders.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 根据目录获取组件
  * @description 根据目录获取组件
  * @router get flow-folders/:id/components
  * @request path number *id eg:1
  */
  async findAllComponents () {
    const { ctx, service } = this;
    const { company_id } = ctx.request.header;
    ctx.validate(ctx.rule.flowFoldersId, ctx.params);
    const { id } = ctx.params;
    const floder = await ctx.model.FlowFolders.findOne({
      where: {
        id,
        company_id,
        component: 1,
      },
    });
    if (!floder) {
      this.NOT_FOUND({ message: '目录不存在' });
      return false;
    }
    const res = await service.flowFolders.findAllComponents(id);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 流程图文件夹
  * @description 创建 流程图文件夹
  * @router post flow-folders
  * @request body flowFoldersBodyReq
  */
  async create () {
    const { ctx } = this;
    ctx.validate(ctx.rule.flowFoldersBodyReq, ctx.request.body);
    let res = await ctx.service.flowFolders.create(ctx.request.body);
    this.CREATED(res);
  }

  /**
  * @apikey
  * @summary 更新 流程图文件夹
  * @description 更新 流程图文件夹
  * @router put flow-folders/:id
  * @request path number *id eg:1
  * @request body flowFoldersPutBodyReq
  */
  async update () {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.flowFoldersPutBodyReq, params);
    const res = await service.flowFolders.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 流程图文件夹
  * @description 删除 流程图文件夹
  * @router delete flow-folders/:id
  * @request path number *id eg:1
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.flowFoldersId, params);
    const res = await service.flowFolders.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 绑定 流程图
  * @description 绑定流程图
  * @router post flow-folders/:id/bind-flows
  * @request path number *id eg:1
  * @request body bindOrUnbindFlowsReq
  */
  async bind () {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.bindOrUnbindFlowsReq, params);
    const res = await service.flowFolders.bind(params);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 解绑 流程图
  * @description 解绑流程图
  * @router post flow-folders/:id/unbind-flows
  * @request path number *id eg:1
  * @request body bindOrUnbindFlowsReq
  */
  async unbind () {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.bindOrUnbindFlowsReq, params);
    await service.flowFolders.unbind(params);
    this.SUCCESS();
  }
  /**
  * @apikey
  * @summary 设置首页流程图
  * @description 设置首页流程图
  * @router post flow-folders/:id/default-flow
  * @request path number *id eg:1
  * @request body flowFoldersSetDefaultFlowBodyReq
  */
  async setDefaultFlow () {
    const { ctx, service } = this;
    let params = { ...ctx.request.body, ...ctx.params };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.flowFoldersSetDefaultFlowBodyReq, params);
    const res = await service.flowFolders.setDefaultFlow(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = flowFoldersController;
