'use strict';

const Service = require('egg').Service;

class PatrolPointsService extends Service {
  /**
   * 生成编号
   * @param {*} prefix
   */
  async generateSn(prefix) {
    const { ctx, app } = this;
    const sn = await app.utils.tools.generateSn(prefix);
    // 校验是否已存在
    const checkHas = await ctx.model.PatrolPoints.count({
      where: { sn },
    });
    if (checkHas) {
      this.generateOrderNo(prefix);
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
    payload.sn = await this.generateSn('XD-');
    payload.creator = request_user;
    payload.department_id = department_id;
    return await ctx.model.PatrolPoints.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.PatrolPoints.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.PatrolPoints.destroy({ where: { id: payload.id } });
  }
}

module.exports = PatrolPointsService;
