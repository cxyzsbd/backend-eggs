'use strict';

const Service = require('egg').Service;

class StationFilesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.StationFiles.count({ where });
    const data = await ctx.model.StationFiles.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.StationFiles.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.StationFiles.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.StationFiles.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.StationFiles.destroy({ where: { id: payload.id } });
  }
}

module.exports = StationFilesService;
