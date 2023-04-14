'use strict';

const Service = require('egg').Service;
const { Sequelize, Op } = require('sequelize');

class NotificationsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where = {
      ...where,
      receiver_id: request_user,
    };
    let Order = [];
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

  async markRead(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { ids } = payload;
    return await ctx.model.Notifications.update({
      is_read: 1,
    }, {
      where: {
        id: {
          [Op.in]: ids,
        },
        receiver_id: request_user,
      },
    });
  }
}

module.exports = NotificationsService;
