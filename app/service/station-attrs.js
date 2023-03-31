'use strict';

const Service = require('egg').Service;

class StationAttrsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { station_id } = payload;
    const data = await ctx.model.StationAttrs.findAll({
      where: { station_id },
      include: [
        {
          model: ctx.model.DeviceTags,
          as: 'attr',
        },
      ],
    });
    return data;
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.StationAttrs.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.DeviceTags,
          as: 'attr',
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.StationAttrs.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.StationAttrs.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.StationAttrs.destroy({ where: { id: payload.id } });
  }
}

module.exports = StationAttrsService;
