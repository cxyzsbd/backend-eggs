'use strict';

const Service = require('egg').Service;

class DeviceModelsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.DeviceModels.count({ where });
    const data = await ctx.model.DeviceModels.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
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
    return await ctx.model.DeviceModels.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, department_id, company_id };
    return await ctx.model.DeviceModels.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModels.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      await transaction.commit();
      // 删除模型
      const res = await ctx.model.DeviceModels.destroy({ where: { id: payload.id }, transaction });
      // 删除属性
      await ctx.model.DeviceModelTags.destroy({ where: { model_id: payload.id }, transaction });
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = DeviceModelsService;
