'use strict';

const Service = require('egg').Service;

class CameraPhotosService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    Order.push([ 'create_at', 'DESC' ]);
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.CameraPhotos.count({ where });
    const data = await ctx.model.CameraPhotos.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      // raw: true,
      // distinct: true,
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
    return await ctx.model.CameraPhotos.create(payload);
  }
}

module.exports = CameraPhotosService;
