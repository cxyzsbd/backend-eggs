'use strict';

const Service = require('egg').Service;

class VisualImagesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where = { ...where, company_id };
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.VisualImages.count({ where });
    const data = await ctx.model.VisualImages.findAll({
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

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.VisualImages.create(payload);
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.VisualImages.destroy({ where: { id: payload.id } });
  }
}

module.exports = VisualImagesService;
