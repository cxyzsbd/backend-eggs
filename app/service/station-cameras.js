'use strict';

const Service = require('egg').Service;

class StationCamerasService extends Service {
  async findAll(station_id) {
    const { ctx } = this;
    return await ctx.model.StationCameras.findAll({
      where: {
        station_id,
      },
    });
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.StationCameras.findOne({ where: { id: payload.id } });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, company_id } = ctx.request.header;
    payload = {
      ...payload,
      creator: request_user,
      company_id,
    };
    return await ctx.model.StationCameras.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.StationCameras.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.StationCameras.destroy({ where: { id: payload.id } });
  }
}

module.exports = StationCamerasService;
