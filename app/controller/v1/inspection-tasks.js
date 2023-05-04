'use strict';

const BaseController = require('../base-controller');
const { Op } = require('sequelize');

/**
* @controller 巡检任务 inspection-tasks
*/

class InspectionTasksController extends BaseController {
  /**
  * @apikey
  * @summary 巡检任务列表
  * @description 获取所有巡检任务
  * @request query number list_type '列表类型：1:处理人查询待处理列表'
  * @request query number pageSize
  * @request query number pageNumber
  * @router get inspection-tasks
  */
  async findAll() {
    const { ctx, service } = this;
    let params = ctx.query;
    let { list_type = 0 } = params;
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
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule,
      queryOrigin: params,
    });
    ctx.validate(allRule, query);
    let res = null;
    if (Number(list_type) === 1) {
      res = await service.inspectionTasks.handlerFindAll(query, queryOrigin);
    } else {
      res = await service.inspectionTasks.findAll(query, queryOrigin);
    }
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
  * @summary 接受巡检任务
  * @description 接受巡检任务
  * @router post inspection-tasks/:id/confirm
  * @request path string *id eg:1
  */
  async confirm() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    ctx.validate(ctx.rule.inspectionTasksId, ctx.params);
    const res = await service.inspectionTasks.update({ id, status: 2 });
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 提交巡检结果
  * @description 提交巡检结果
  * @router post inspection-tasks/:id/results
  * @request path string *id eg:1
  * @request body inspectionsubReslutsBodyReq
  */
  async subResult() {
    const { ctx, service, app } = this;
    const { request_user } = ctx.request.header;
    const params = { ...ctx.params, ...ctx.request.body };
    const { id, equipment_account_id, results } = params;
    ctx.validate(ctx.rule.inspectionsubReslutsBodyReq, params);
    const inspectionTask = await ctx.model.InspectionTasks.findOne({
      where: { id },
      raw: true,
    });
    if (!inspectionTask) {
      this.BAD_REQUEST({ message: '巡检任务不存在' });
      return false;
    }
    if (inspectionTask.status !== 2) {
      this.BAD_REQUEST({ message: '该状态无法操作' });
      return false;
    }
    if (app.utils.tools.dayjs() > app.utils.tools.dayjs(inspectionTask.end_time)) {
      this.BAD_REQUEST({ message: '任务已结束,不能操作' });
      return false;
    }
    const handlers = await ctx.model.InspectionTaskHandlers.findAll({
      where: {
        task_id: id,
      },
      raw: true,
    });
    const handlerIds = handlers.map(item => item.handler);
    if (!handlerIds.includes(request_user)) {
      this.BAD_REQUEST({ message: '非执行人无操作权限' });
      return false;
    }
    const target = await ctx.model.InspectionResults.findOne({
      where: {
        task_id: id,
        equipment_account_id,
      },
      raw: true,
    });
    if (target.submitter && target.complete_at) {
      this.BAD_REQUEST({ message: '该目标已执行完' });
      return false;
    }
    if (target.results) {
      const targetKeys = Object.keys(target.results);
      const resultKeys = Object.keys(results);
      if (!app.utils.tools.lodash(targetKeys, resultKeys)) {
        this.BAD_REQUEST({ message: '请按照巡检项提交结果' });
        return false;
      }
    }
    const res = await service.inspectionTasks.subResult(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 完成巡检任务
  * @description 完成巡检任务
  * @router post inspection-tasks/:id/complete
  * @request path string *id eg:1
  */
  async complete() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    ctx.validate(ctx.rule.inspectionTasksId, ctx.params);
    // 先查询巡检项有没有全部完成
    const results = await ctx.model.InspectionResults.count({
      where: {
        task_id: id,
        complete_at: null,
      },
    });
    if (results > 0) {
      this.BAD_REQUEST({ message: '还有巡检项没有提交' });
      return false;
    }
    const res = await service.inspectionTasks.update({ id, status: 3 });
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
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

  /**
  * @apikey
  * @summary 巡检任务操作记录
  * @description 巡检任务操作记录
  * @router get inspection-tasks/:id/operation-records
  * @request path string *id eg:1
  */
  async operationRecords() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.inspectionTasksId, params);
    const res = await service.inspectionTasks.operationRecords(params.id);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 巡检任务数量统计
  * @description 巡检任务数量统计
  * @router get inspection-tasks-statistics
  */
  async statistics() {
    const { ctx } = this;
    const res = await ctx.service.inspectionTasks.statistics(ctx.query);
    this.SUCCESS(res);
  }
}

module.exports = InspectionTasksController;
