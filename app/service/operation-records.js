'use strict';

const Service = require('egg').Service;
const { Sequelize, Op } = require('sequelize');

class OperationRecordsService extends Service {
  async findAll(payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const { st, et } = queryOrigin;
    let where = payload.where;
    where.company_id = company_id;
    if (st && et) {
      where.operation_time = {
        [Op.between]: [ st, et ],
      };
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.OperationRecords.count({ where });
    const data = await ctx.model.OperationRecords.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      attributes: {
        include: [
          [ Sequelize.col('operator.username'), 'operator_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'operator',
          attributes: [],
        },
      ],
    });
    return {
      data,
      pageNumber,
      pageSize,
      total,
    };
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.OperationRecords.destroy({ where: { id: payload.id } });
  }
}

module.exports = OperationRecordsService;
