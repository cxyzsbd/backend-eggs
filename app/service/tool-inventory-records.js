'use strict';

const Service = require('egg').Service;

class ToolInventoryRecordsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.ToolInventoryRecords.count({ where });
    const data = await ctx.model.ToolInventoryRecords.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      // raw: true,
      include: [
        {
          model: ctx.model.Users,
          attributes: [ 'username' ],
          as: 'creator_info',
          paranoid: false,
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
    return await ctx.model.ToolInventoryRecords.findOne({ where: payload, raw: true });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.creator = request_user;
    payload.department_id = department_id;
    return await ctx.model.ToolInventoryRecords.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.ToolInventoryRecords.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.ToolInventoryRecords.destroy({ where: { id: payload.id } });
  }
}

module.exports = ToolInventoryRecordsService;
