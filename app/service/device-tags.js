'use strict';

const Service = require('egg').Service;

class DeviceTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.DeviceTags.count({ where });
    let tempObj = {
      where,
      order: Order,
    };
    if (pageSize > 0) {
      tempObj = {
        ...tempObj,
        limit: pageSize,
        offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      };
    }
    const data = await ctx.model.DeviceTags.findAll(tempObj);
    let resObj = {
      data,
      total: count,
    };
    if (pageSize > 0) {
      resObj = {
        ...resObj,
        pageNumber,
        pageSize,
      };
    }
    return resObj;
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    payload.company_id = company_id;
    return await ctx.model.DeviceTags.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.destroy({ where: { id: payload.id } });
  }
}

module.exports = DeviceTagsService;
