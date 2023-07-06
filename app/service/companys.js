'use strict';

const Service = require('egg').Service;
const { QueryTypes } = require('sequelize');

class CompanysService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([prop_order, order]) : null;
    const total = await ctx.model.Companys.count({ where });
    const data = await ctx.model.Companys.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      include: [
        {
          as: 'admin_info',
          model: ctx.model.Users,
          attributes: { exclude: ['password'] },
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
    return await ctx.model.Companys.findOne({
      where: payload,
      include: [
        {
          as: 'admin_info',
          model: ctx.model.Users,
          attributes: { exclude: ['password'] },
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload.creator = request_user;
    !payload.time_limit && delete payload.time_limit;
    return await ctx.model.Companys.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    !payload.time_limit && delete payload.time_limit;
    return await ctx.model.Companys.update(payload, { where: { id: payload.id } });
  }


  async companyCount() {
    const { ctx, app } = this;
    return await ctx.model.query('select c.id,c.name,count(s.id) as num from  companys as c left join stations as s  on c.id = s.company_id group by c.id', { type: QueryTypes.SELECT });
  }


}

module.exports = CompanysService;
