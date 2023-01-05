'use strict';

const Service = require('egg').Service;

class EquipmentAccountsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.EquipmentAccounts.count({ where });
    const data = await ctx.model.EquipmentAccounts.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.EquipmentAccounts.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.EquipmentAccounts.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.EquipmentAccounts.update(payload, { where: { sn: payload.sn } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.EquipmentAccounts.destroy({ where: { sn: payload.sn } });
  }
}

module.exports = EquipmentAccountsService;
