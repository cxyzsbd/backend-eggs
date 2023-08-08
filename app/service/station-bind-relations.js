'use strict';

const Service = require('egg').Service;

class StationBindRelationsService extends Service {
  async findAll (payload) {
    const { ctx } = this;
    return await ctx.model.StationBindRelations.findAll({ where: payload });
  }
  async findOne (payload, options = {}) {
    const { ctx } = this;
    return await ctx.model.StationBindRelations.findOne({ where: payload, ...options });
  }

  async create (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    payload = {
      creator: request_user,
      ...payload,
    };
    return await ctx.model.StationBindRelations.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    const { id } = payload;
    const { request_user } = ctx.request.header;
    payload = {
      updator: request_user,
      ...payload,
    };
    return await ctx.model.StationBindRelations.update(payload, { where: { id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    const { id } = payload;
    return await ctx.model.StationBindRelations.destroy({ where: { id } });
  }
}

module.exports = StationBindRelationsService;
