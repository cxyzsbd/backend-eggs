'use strict';

const Service = require('egg').Service;

class CompanyExtendService extends Service {
  async findAll (payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.CompanyExtend.count({ where });
    const data = await ctx.model.CompanyExtend.findAll({
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

  async findOne (payload) {
    const { ctx } = this;
    return await ctx.model.CompanyExtend.findOne({
      where: payload,
    });
  }

  async create (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload.creator = request_user;
    return await ctx.model.CompanyExtend.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    return await ctx.model.CompanyExtend.update(payload, { where: { id: payload.id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    return await ctx.model.CompanyExtend.destroy({ where: { id: payload.id } });
  }

}

module.exports = CompanyExtendService;
