'use strict';

const Service = require('egg').Service;

class InspectionsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([prop_order, order]) : null;
    const count = await ctx.model.Inspections.count({ where });
    const data = await ctx.model.Inspections.findAndCountAll({
      limit: pageSize,
      offset: (pageSize* (pageNumber - 1))>0?(pageSize* (pageNumber - 1)) : 0,
      raw: true,
      distinct: true,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count
    }
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.update(payload, { where: payload });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.destroy({ where: payload });
  }
}

module.exports = InspectionsService;