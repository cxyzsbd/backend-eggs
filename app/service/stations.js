'use strict';

const Service = require('egg').Service;

class StationsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Stations.count({ where });
    const data = await ctx.model.Stations.findAll({
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
    return await ctx.model.Stations.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.StationTags,
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { company_id, request_user, department_id } = ctx.request.header;
    payload = {
      ...payload,
      creator: request_user,
      department_id,
      company_id,
    };
    return await ctx.model.Stations.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Stations.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Stations.destroy({ where: { id: payload.id } });
  }
}

module.exports = StationsService;
