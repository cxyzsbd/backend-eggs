'use strict';

const Service = require('egg').Service;
const { Op, Sequelize } = require('sequelize');

class AnnouncementsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const { company_id } = ctx.request.header;
    let where = payload.where;
    where = {
      ...where,
      company_id,
    };
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Announcements.count({ where });
    const data = await ctx.model.Announcements.findAll({
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
    return await ctx.model.Announcements.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = {
      ...payload,
      creator: request_user,
      department_id,
      company_id,
    };
    return await ctx.model.Announcements.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Announcements.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Announcements.destroy({ where: { id: payload.id } });
  }

  async viewList(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const { company_id, request_user } = ctx.request.header;
    let where = payload.where;
    where = {
      ...where,
      company_id,
      status: 2,
      [Op.or]: [
        {
          expire_at: null,
        },
        {
          expire_at: {
            [Op.gt]: new Date(),
          },
        },
      ],
    };
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Announcements.count({ where });
    let data = await ctx.model.Announcements.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      include: [
        {
          where: {
            user_id: request_user,
          },
          model: ctx.model.AnnouncementRead,
          as: 'announcement_read',
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
  async markRead(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { ids } = payload;
    const datas = ids.map(announcement_id => {
      return {
        announcement_id,
        user_id: request_user,
        is_read: 1,
        read_at: new Date(),
      };
    });
    return await ctx.model.AnnouncementRead.bulkCreate(datas);
  }
}

module.exports = AnnouncementsService;
