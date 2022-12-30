'use strict';

const BaseController = require('../base-controller');

/**
* @controller 巡检任务 inspection-tasks
*/

class InspectionTasksController extends BaseController {
  /**
  * @apikey
  * @summary 巡检任务列表
  * @description 获取所有巡检任务
  * @request query number pageSize
  * @request query number pageNumber
  * @router get inspection-tasks
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.inspectionTasksPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.inspectionTasks.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 巡检任务
  * @description 获取某个 巡检任务
  * @router get inspection-tasks/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.inspectionTasksId, ctx.params);
    const res = await service.inspectionTasks.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 巡检任务
  * @description 删除 巡检任务
  * @router delete inspection-tasks/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.inspectionTasksId, params);
    const res = await service.inspectionTasks.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = InspectionTasksController;
