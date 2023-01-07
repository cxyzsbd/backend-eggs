'use strict';

const Service = require('egg').Service;

class DeviceTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.deviceTags.count({ where });
    const data = await ctx.model.deviceTags.findAll({
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

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.deviceTags.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.deviceTags.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.deviceTags.destroy({ where: { id: payload.id } });
  }
}

module.exports = DeviceTagsService;
