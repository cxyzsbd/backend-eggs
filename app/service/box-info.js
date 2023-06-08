'use strict';

const Service = require('egg').Service;

class BoxInfoService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.department = company_id;
    if (!where.use_status && where.use_status !== '0') {
      where.use_status = 1;
    }
    if (Number(where.use_status) === 2) {
      delete where.use_status;
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.models.BoxInfo.count({ where });
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
    const data = await ctx.models.BoxInfo.findAll(tempObj);
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
    const { company_id } = ctx.request.header;
    payload.department = company_id;
    return await ctx.models.BoxInfo.findOne({ where: payload });
  }
}

module.exports = BoxInfoService;
