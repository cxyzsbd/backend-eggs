'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class UserSubAttrsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    let where = payload.where;
    where.company_id = company_id;
    const data = await ctx.model.RoleScreens.findAll({
      where,
      include: [
        {
          model: ctx.model.Screens,
          required: true,
        },
      ],
    });
    return data;
  }

  async bulkCreate(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    let tempArr = payload.screen_ids.map(screen_id => {
      return {
        role_id: payload.role_id,
        screen_id,
        company_id,
      };
    });
    return await ctx.model.RoleScreens.bulkCreate(tempArr);
  }

  async destroy(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    return await ctx.model.RoleScreens.destroy({ where: {
      screen_id: {
        [Op.in]: payload.screen_ids,
      },
      role_id: payload.role_id,
      company_id,
    } });
  }
}

module.exports = UserSubAttrsService;
