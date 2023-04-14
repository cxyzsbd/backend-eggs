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
    let params = ctx.query;
    if (params.status) {
      params = {
        ...params,
        status: Number(params.status),
      };
    }
    let rule = ctx.rule.inspectionTasksPutBodyReq;
    rule = {
      ...rule,
      status: {
        type: 'number',
        required: false,
        enum: [ 1, 2, 3, 4 ],
      },
    };
    const { allRule, query } = this.findAllParamsDeal({
      rule,
      queryOrigin: params,
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
  * @request path string *id eg:1
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
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.inspectionTasksId, params);
    const res = await service.inspectionTasks.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = InspectionTasksController;
