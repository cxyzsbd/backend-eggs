'use strict';

const Service = require('egg').Service;

class WorkOrdersService extends Service {
  /**
   * 生成工单号
   */
  async generateOrderNo() {
    const { ctx, app } = this;
    const sn = await app.utils.tools.generateSn('GD');
    // 校验是否已存在
    const checkHas = await ctx.model.WorkOrders.count({
      where: { sn },
    });
    // 如果工单号已存在，重新生成
    if (checkHas) {
      this.generateOrderNo('GD');
      return false;
    }
    return sn;
  }
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const { company_id } = ctx.request.header;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.WorkOrders.count({ where });
    const data = await ctx.model.WorkOrders.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      // raw: true,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.WorkOrders.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { company_id, request_user } = ctx.request.header;
    payload.sn = await this.generateOrderNo('GD-');
    payload.creator = request_user;
    payload.company_id = company_id;
    const res = await ctx.model.WorkOrders.create(payload);
    // 操作记录
    if (res) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 1,
        operator: request_user,
      });
    }
    return res;
  }

  async update(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let res = await ctx.model.WorkOrders.update(payload, {
      where: {
        sn: payload.sn,
      },
    });
    // 操作记录
    if (res && res[0]) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 2,
        operator: request_user,
      });
    }
    return res;
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.WorkOrders.destroy({ where: payload });
  }

  async approval(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const transaction = await ctx.model.transaction();
    try {
      let operationObj = {
        work_order_sn: payload.sn,
        type: 3,
        operator: request_user,
        operation_result: payload.approval_result,
      };
      if (payload.approval_result == 1) {
        operationObj.not_pass_reason = payload.not_pass_reason;
      }
      await ctx.model.WorkOrders.update({
        status: payload.approval_result == 1 ? 1 : 0,
      }, {
        where: { sn: payload.sn },
        transaction,
      });
      const res = await ctx.model.WorkOrderOperationRecords.create(operationObj, { transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async confirm(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const res = await ctx.model.WorkOrders.update({
      status: 2,
    }, {
      where: { sn: payload.sn },
    });
    if (res && res[0]) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 4,
        operator: request_user,
      });
    }
    return res;
  }

  async complete(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { handle_result, sn } = payload;
    const res = await ctx.model.WorkOrders.update({
      status: 3,
      handle_result,
    }, {
      where: { sn },
    });
    if (res && res[0]) {
      // 操作日志
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: sn,
        type: 5,
        operator: request_user,
      });
    }
    return res;
  }
}

module.exports = WorkOrdersService;
