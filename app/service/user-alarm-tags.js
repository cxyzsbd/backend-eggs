'use strict';

const Service = require('egg').Service;

class UserAlarmTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let where = payload.where;
    where.user_id = request_user;
    const data = await ctx.model.UserAlarmTags.findAll({
      where,
    });
    return data;
  }

  async bulkCreate(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let tempArr = payload.tags.map(tag => {
      tag.user_id = request_user;
      return tag;
    });
    return await ctx.model.UserAlarmTags.bulkCreate(tempArr);
  }

  async destroy(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload.tags.forEach(async tag => {
      await ctx.model.UserAlarmTags.destroy({ where: {
        ...tag,
        user_id: request_user,
      } });
    });
  }
}

module.exports = UserAlarmTagsService;
