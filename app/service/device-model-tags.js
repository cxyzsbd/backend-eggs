'use strict';

const Service = require('egg').Service;

class DeviceModelTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.DeviceModelTags.count({ where });
    const data = await ctx.model.DeviceModelTags.findAll({
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
    return await ctx.model.DeviceModelTags.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModelTags.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModelTags.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModelTags.destroy({ where: { id: payload.id } });
  }
}

module.exports = DeviceModelTagsService;
