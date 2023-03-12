'use strict';

const Service = require('egg').Service;
const { Sequelize, Op } = require('sequelize');

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
    const { ctx, app } = this;
    const { pageSize, pageNumber, prop_order, order, status } = payload;
    const { company_id } = ctx.request.header;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    if (status || status == 0) {
      if (status == 4) {
        where[Op.and] = [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.gt]: new Date().getTime(),
          } },
        ];
      } else if (status != 3) {
        where.end_time = {
          [Op.gt]: new Date().getTime(),
        };
      }
    }
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.WorkOrders.count({ where });
    const data = await ctx.model.WorkOrders.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      // raw: true,
      include: [
        {
          model: ctx.model.Users,
          attributes: [ 'username' ],
          as: 'creator_info',
        },
      ],
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
    return await ctx.model.WorkOrders.findOne({
      where: payload,
      attributes: {
        include: [
          [ Sequelize.col('creator_info.username'), 'creator_name' ],
          [ Sequelize.col('handler_info.username'), 'handler_name' ],
          [ Sequelize.col('approver_info.username'), 'approver_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          attributes: [],
          as: 'creator_info',
        },
        {
          model: ctx.model.Users,
          attributes: [],
          as: 'handler_info',
        },
        {
          model: ctx.model.Users,
          attributes: [],
          as: 'approver_info',
        },
      ],
    });
  }

  async create(payload) {
    const { ctx, app } = this;
    const { company_id, request_user } = ctx.request.header;
    // payload.sn = await this.generateOrderNo('GD-');
    payload.id = await app.utils.tools.SnowFlake();
    payload.creator = request_user;
    payload.company_id = company_id;
    const res = await ctx.model.WorkOrders.create(payload);
    // 操作记录
    if (res) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_id: payload.id,
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
        id: payload.id,
      },
    });
    // 操作记录
    if (res && res[0]) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_id: payload.id,
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
        work_order_id: payload.id,
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
        where: { id: payload.id },
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
      where: { id: payload.id },
    });
    if (res && res[0]) {
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_id: payload.id,
        type: 4,
        operator: request_user,
      });
    }
    return res;
  }

  async complete(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { handle_result, id } = payload;
    const res = await ctx.model.WorkOrders.update({
      status: 3,
      handle_result,
    }, {
      where: { id },
    });
    if (res && res[0]) {
      // 操作日志
      await ctx.model.WorkOrderOperationRecords.create({
        work_order_id: id,
        type: 5,
        operator: request_user,
      });
    }
    return res;
  }
}

module.exports = WorkOrdersService;
