'use strict';

const BaseController = require('../base-controller');

/**
* @controller 保养任务 maintenance-tasks
*/

class MaintenanceTasksController extends BaseController {
  /**
  * @apikey
  * @summary 保养任务列表
  * @description 获取所有保养任务
  * @request query number pageSize
  * @request query number pageNumber
  * @router get maintenance-tasks
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
    let rule = ctx.rule.maintenanceTasksPutBodyReq;
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
    const res = await service.maintenanceTasks.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 保养任务
  * @description 获取某个 保养任务
  * @router get maintenance-tasks/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.maintenanceTasksId, ctx.params);
    const res = await service.maintenanceTasks.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 保养任务
  * @description 删除 保养任务
  * @router delete maintenance-tasks/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.maintenanceTasksId, params);
    const res = await service.maintenanceTasks.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = MaintenanceTasksController;
