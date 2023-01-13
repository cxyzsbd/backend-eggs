'use strict';

const Service = require('egg').Service;

class StationTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { station_id } = payload;
    const data = await ctx.model.StationTags.findAll({
      where: { station_id },
    });
    return data;
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.StationTags.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.StationTags.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.StationTags.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.StationTags.destroy({ where: { id: payload.id } });
  }
}

module.exports = StationTagsService;
