'use strict';

const Service = require('egg').Service;

class PatrolPointsService extends Service {
  /**
   * 生成编号
   */
  async generateSn() {
    const { ctx, app } = this;
    const sn = await app.utils.tools.generateSn('XJ-XD');
    // 校验是否已存在
    const checkHas = await ctx.model.PatrolPoints.count({
      where: { sn },
    });
    if (checkHas) {
      this.generateOrderNo('XJ-XD');
      return false;
    }
    return sn;
  }
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.PatrolPoints.count({ where });
    const data = await ctx.model.PatrolPoints.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
      distinct: true,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.PatrolPoints.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.sn = await this.generateSn();
    payload.creator = request_user;
    payload.department_id = department_id;
    return await ctx.model.PatrolPoints.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.PatrolPoints.update(payload, { where: { sn: payload.sn } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.PatrolPoints.destroy({ where: { sn: payload.sn } });
  }
}

module.exports = PatrolPointsService;
