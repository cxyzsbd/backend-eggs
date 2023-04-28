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
  async findAll(payload, queryOrigin) {
    const { ctx, app } = this;
    const { pageSize, pageNumber, prop_order, order, status } = payload;
    const { st, et, list_type } = queryOrigin;
    const { company_id, request_user } = ctx.request.header;
    let where = payload.where;
    delete where.list_type;
    where.company_id = company_id;
    if (st && et) {
      where.create_at = {
        [Op.between]: [ st, et ],
      };
    }
    let Order = [];
    if (status || status === 0) {
      if (status === 4) {
        delete where.status;
        where[Op.and] = [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.lt]: new Date().getTime(),
          } },
        ];
      } else if (status !== 3) {
        where.end_time = {
          [Op.gte]: new Date().getTime(),
        };
      }
    }
    if (list_type) {
      switch (Number(list_type)) {
        case 1:where.creator = request_user; break;
        case 2:where.approver = request_user; break;
        case 3:where.handler = request_user; break;
        default: where.creator = request_user; break;
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
        {
          model: ctx.model.WorkOrderOperationRecords,
          as: 'operation_records',
          include: [
            {
              model: ctx.model.Users,
              as: 'operator_info',
            },
          ],
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
      if (payload.approver) {
        await app.utils.iom.workOrderNotice({ data: res, sender_id: request_user, receiver_id: payload.approver, type: 1 });
      }
    }
    return res;
  }

  async eventWorkOrder(payload) {
    const { ctx, app } = this;
    payload.id = await app.utils.tools.SnowFlake();
    payload.creator = 0;
    const res = await ctx.model.WorkOrders.create(payload);
    // 操作记录
    if (res) {
      if (payload.approver) {
        await app.utils.iom.workOrderNotice({ data: res, sender_id: null, receiver_id: payload.approver, type: 1 });
      }
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
    let { approval_result, not_pass_reason = '', handler = null, id } = payload;
    approval_result = Number(approval_result);
    const transaction = await ctx.model.transaction();
    try {
      let operationObj = {
        work_order_id: id,
        type: 3,
        operator: request_user,
        operation_result: approval_result,
      };
      let updateObj = {
        approver: request_user,
        status: approval_result === 1 ? 1 : 0,
      };
      if (payload.approval_result === 0) {
        operationObj.not_pass_reason = not_pass_reason;
      } else {
        updateObj = {
          ...updateObj,
          handler,
        };
      }
      await ctx.model.WorkOrders.update(updateObj, {
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
    const { handle_result, id, signature_img = null, handle_imgs = '', handle_audios = '', remark = '' } = payload;
    const res = await ctx.model.WorkOrders.update({
      status: 3,
      handle_result,
      signature_img,
      handle_imgs,
      handle_audios,
      remark,
      complete_at: new Date(),
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

  async statistics() {
    const { ctx } = this;
    const WorkOrders = ctx.model.WorkOrders;
    const { company_id, request_user } = ctx.request.header;
    const where = {
      company_id,
      handler: request_user,
    };
    // 未接收
    const notReceiveCount = await WorkOrders.count({
      where: {
        ...where,
        status: 1,
        end_time: {
          [Op.gte]: new Date().getTime(),
        },
      },
    });
    // 已接收，未完成
    const receivedCount = await WorkOrders.count({
      where: {
        ...where,
        status: 2,
        end_time: {
          [Op.gte]: new Date().getTime(),
        },
      },
    });
    // 已完成
    const completeCount = await WorkOrders.count({
      where: {
        ...where,
        status: 3,
      },
    });
    // 已逾期
    const overdueCount = await WorkOrders.count({
      where: {
        ...where,
        [Op.and]: [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.lt]: new Date().getTime(),
          } },
        ],
      },
    });
    return {
      notReceiveCount,
      receivedCount,
      completeCount,
      overdueCount,
    };
  }
}

module.exports = WorkOrdersService;
