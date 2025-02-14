'use strict';

const Service = require('egg').Service;

class UserScreensService extends Service {
  async findOne(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let where = payload || {};
    where.user_id = request_user;
    return await ctx.model.UserScreens.findOne({
      where,
      include: [
        {
          model: ctx.model.Screens,
          required: true,
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload.user_id = request_user;
    const data = await ctx.model.UserScreens.findOne({
      where: { user_id: request_user },
    });
    if (data) {
      return await ctx.model.UserScreens.update(payload, {
        where: { user_id: request_user },
      });
    }
    return await ctx.model.UserScreens.create(payload);
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.UserScreens.destroy({ where: { id: payload.id } });
  }
}

module.exports = UserScreensService;
