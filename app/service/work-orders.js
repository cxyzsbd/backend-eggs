'use strict';

const Service = require('egg').Service;

class WorkOrdersService extends Service {
  /**
   * 生成工单号
   * @param {*} prefix
   */
  async generateOrderNo(prefix) {
    const { ctx, app } = this;
    const sn = await app.utils.tools.generateSn(prefix);
    // 校验是否已存在
    const checkHas = await ctx.model.WorkOrders.count({
      where: { sn },
    });
    // 如果工单号已存在，重新生成
    if (checkHas) {
      this.generateOrderNo(prefix);
      return false;
    }
    return sn;
  }
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.WorkOrders.count({ where });
    const data = await ctx.model.WorkOrders.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
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
    const { department_id, request_user } = ctx.request.header;
    payload.sn = await this.generateOrderNo('GD-');
    payload.creator = request_user;
    payload.department_id = department_id;
    const transaction = await ctx.model.transaction();
    try {
      console.log('payload', payload);
      const res = await ctx.model.WorkOrders.create(payload, { transaction });
      console.log('res', res);
      // 操作记录
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 1,
        operator: request_user,
      }, { transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async update(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const transaction = await ctx.model.transaction();
    try {
      let res = await ctx.model.WorkOrders.update(payload, {
        where: {
          sn: payload.sn,
        },
        transaction,
      });
      // 操作记录
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 2,
        operator: request_user,
      });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
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
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.WorkOrders.update({
        status: 2,
      }, {
        where: { sn: payload.sn },
        transaction,
      });
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: payload.sn,
        type: 4,
        operator: request_user,
      });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async complete(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { handle_result, sn } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.WorkOrders.update({
        status: 3,
        handle_result,
      }, {
        where: { sn },
        transaction,
      });
      // 操作日志
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_sn: sn,
        type: 5,
        operator: request_user,
      });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = WorkOrdersService;
