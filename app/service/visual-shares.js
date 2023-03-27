'use strict';

const Service = require('egg').Service;

class VisualSharesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.creator = request_user;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.VisualShares.count({ where });
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
    const data = await ctx.model.VisualShares.findAll(tempObj);
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
    const { request_user } = ctx.request.header;
    payload.creator = request_user;
    return await ctx.model.VisualShares.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    payload.id = await app.utils.tools.SnowFlake();
    payload.creator = request_user;
    payload.company_id = company_id;
    return await ctx.model.VisualShares.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.VisualShares.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.VisualShares.destroy({ where: { id: payload.id } });
  }
}

module.exports = VisualSharesService;
