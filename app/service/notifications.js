'use strict';

const Service = require('egg').Service;
const { Sequelize } = require('sequelize');

class NotificationsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Notifications.count({ where });
    const data = await ctx.model.Notifications.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      attributes: {
        include: [
          [ Sequelize.col('sender.username'), 'sender_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'sender',
          attributes: [],
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
    return await ctx.model.Notifications.findOne({
      where: payload,
      attributes: {
        include: [
          [ Sequelize.col('sender.username'), 'sender_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'sender',
          attributes: [],
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.Notifications.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Notifications.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Notifications.destroy({ where: { id: payload.id } });
  }
}

module.exports = NotificationsService;
