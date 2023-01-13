'use strict';

const Service = require('egg').Service;

class CompanysService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Companys.count({ where });
    const data = await ctx.model.Companys.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      include: [
        {
          as: 'admin_info',
          model: ctx.model.Users,
          attributes: { exclude: [ 'password' ] },
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

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Companys.findOne({
      where: payload,
      include: [
        {
          as: 'admin_info',
          model: ctx.model.Users,
          attributes: { exclude: [ 'password' ] },
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload.creator = request_user;
    return await ctx.model.Companys.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Companys.update(payload, { where: { id: payload.id } });
  }
}

module.exports = CompanysService;
