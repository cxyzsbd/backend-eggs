'use strict';

const BaseController = require('../base-controller');
const { Op } = require('sequelize');

/**
* @controller 保养任务 maintenance-tasks
*/

class MaintenanceTasksController extends BaseController {
  /**
  * @apikey
  * @summary 保养任务列表
  * @description 获取所有保养任务
  * @request query number list_type '列表类型：1:处理人查询待处理列表'
  * @request query number pageSize
  * @request query number pageNumber
  * @router get maintenance-tasks
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
    let rule = ctx.rule.maintenanceTasksPutBodyReq;
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
      res = await service.maintenanceTasks.handlerFindAll(query, queryOrigin);
    } else {
      res = await service.maintenanceTasks.findAll(query, queryOrigin);
    }
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
  * @summary 接受保养任务
  * @description 接受保养任务
  * @router post maintenance-tasks/:id/confirm
  * @request path string *id eg:1
  */
  async confirm() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    ctx.validate(ctx.rule.maintenanceTasksId, ctx.params);
    const res = await service.maintenanceTasks.update({ id, status: 2 });
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 提交保养结果
  * @description 提交保养结果
  * @router post maintenance-tasks/:id/results
  * @request path string *id eg:1
  * @request body maintenancesubReslutsBodyReq
  */
  async subResult() {
    const { ctx, service, app } = this;
    const { request_user } = ctx.request.header;
    const params = { ...ctx.params, ...ctx.request.body };
    const { id, equipment_account_id, results } = params;
    ctx.validate(ctx.rule.maintenancesubReslutsBodyReq, params);
    const maintenanceTask = await ctx.model.MaintenanceTasks.findOne({
      where: { id },
      raw: true,
    });
    if (!maintenanceTask) {
      this.BAD_REQUEST({ message: '保养任务不存在' });
      return false;
    }
    if (maintenanceTask.status !== 2) {
      this.BAD_REQUEST({ message: '该状态无法操作' });
      return false;
    }
    if (app.utils.tools.dayjs() > app.utils.tools.dayjs(maintenanceTask.end_time)) {
      this.BAD_REQUEST({ message: '任务已结束,不能操作' });
      return false;
    }
    const handlers = await ctx.model.MaintenanceTaskHandlers.findAll({
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
    const target = await ctx.model.MaintenanceResults.findOne({
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
        this.BAD_REQUEST({ message: '请按照保养项提交结果' });
        return false;
      }
    }
    const res = await service.maintenanceTasks.subResult(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 完成保养任务
  * @description 完成保养任务
  * @router post maintenance-tasks/:id/complete
  * @request path string *id eg:1
  */
  async complete() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    ctx.validate(ctx.rule.maintenanceTasksId, ctx.params);
    // 先查询保养项有没有全部完成
    const results = await ctx.model.MaintenanceResults.count({
      where: {
        task_id: id,
        complete_at: null,
      },
    });
    if (results > 0) {
      this.BAD_REQUEST({ message: '还有保养项没有提交' });
      return false;
    }
    const res = await service.maintenanceTasks.update({ id, status: 3 });
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
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

  /**
  * @apikey
  * @summary 保养任务操作记录
  * @description 保养任务操作记录
  * @router get maintenance-tasks/:id/operation-records
  * @request path string *id eg:1
  */
  async operationRecords() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.maintenanceTasksId, params);
    const res = await service.maintenanceTasks.operationRecords(params.id);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 保养任务数量统计
  * @description 保养任务数量统计
  * @router get maintenance-tasks-statistics
  */
  async statistics() {
    const { ctx } = this;
    const res = await ctx.service.maintenanceTasks.statistics(ctx.query);
    this.SUCCESS(res);
  }
}

module.exports = MaintenanceTasksController;
