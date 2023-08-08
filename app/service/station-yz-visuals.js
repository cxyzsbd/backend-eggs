'use strict';

const Service = require('egg').Service;

class StationYzVisualsService extends Service {
  async findOne (payload) {
    const { ctx } = this;
    return await ctx.model.StationYzVisuals.findOne({ where: payload });
  }

  async create (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload = {
      creator: request_user,
      ...payload,
    };
    return await ctx.model.StationYzVisuals.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    const { station_id } = payload;
    const { request_user } = ctx.request.header;
    payload = {
      updator: request_user,
      ...payload,
    };
    return await ctx.model.StationYzVisuals.update(payload, { where: { station_id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    const { station_id } = payload;
    return await ctx.model.StationYzVisuals.destroy({ where: { station_id } });
  }

  async checkStationPermission (station_id) {
    const { ctx, app } = this;
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const departments = await ctx.service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    const stations = allStations.filter(item => departmentIds.includes(item.department_id));
    const station_ids = stations.map(item => `${item.id}`);
    return station_ids.includes(`${station_id}`);
  }
}

module.exports = StationYzVisualsService;
