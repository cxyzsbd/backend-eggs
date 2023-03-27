'use strict';

const Service = require('egg').Service;

class VisualImagesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize = 20, pageNumber = 1, prop_order, order, type } = payload;
    let where = payload.where;
    where = { ...where, company_id, type };
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.VisualImages.count({ where });
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
    const data = await ctx.model.VisualImages.findAll(tempObj);
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
