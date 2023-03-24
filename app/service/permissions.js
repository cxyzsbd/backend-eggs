'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class _objectName_Service extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Permissions.count({ where });
    const data = await ctx.model.Permissions.findAll({
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

  async findOne(id) {
    const { ctx } = this;
    return await ctx.model.Permissions.findOne({ where: { id } });
  }

  async create(payload) {
    const { ctx } = this;
    const { url, action } = payload;
    const one = await ctx.model.Permissions.findOne({ where: { url, action } });
    if (one) {
      return { message: '资源已存在，不能重复添加' };
    }
    return await ctx.model.Permissions.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    const { id, url, action } = payload;
    const one = await ctx.model.Permissions.findOne({
      where: { id: { [Op.not]: id }, url, action },
    });
    if (one) {
      const err = new Error('已存在');
      err.parent = {};
      err.parent.errno = 1062;
      throw err;
    }
    return await ctx.model.Permissions.update(payload, {
      ctx,
      where: { id: payload.id },
    });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Permissions.destroy({
      where: { id: payload.id },
    });
  }
}

module.exports = _objectName_Service;
