'use strict';

const Service = require('egg').Service;

class SparePartsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.SpareParts.count({ where });
    const data = await ctx.model.SpareParts.findAll({
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
    return await ctx.model.SpareParts.findOne({ where: payload, raw: true });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.creator = request_user;
    payload.department_id = department_id;
    return await ctx.model.SpareParts.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.SpareParts.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.SpareParts.destroy({ where: { id: payload.id } });
  }

  // 库存操作
  async inventory(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.creator = request_user;
    payload.department_id = department_id;
    const { spare_parts_id, type, quantity } = payload;
    const transaction = await ctx.model.transaction();
    try {
      let res = null;
      if (type === 1) {
        // 入库
        res = await ctx.model.SpareParts.increment({ inventory: quantity }, { where: { id: spare_parts_id }, transaction });
      } else if (type === 2) {
        // 出库
        res = await ctx.model.SpareParts.increment({ inventory: -quantity }, { where: { id: spare_parts_id }, transaction });
      } else if (type === 3) {
        // 领用
        res = await ctx.model.SpareParts.increment({ inventory: -quantity, occupy_inventory: quantity }, { where: { id: spare_parts_id }, transaction });
      } else if (type === 4) {
        // 归还
        // 更新主表库存和占用库存
        res = await ctx.model.SpareParts.increment({ inventory: quantity, occupy_inventory: -quantity }, { where: { id: spare_parts_id }, transaction });
        // 更新领用记录中的归还数量
        await ctx.model.SparePartsInventoryRecords.increment({ remand_quantity: quantity }, { where: { id: payload.receiving_record_id }, transaction });
      }
      // 库存操作记录
      await ctx.model.SparePartsInventoryRecords.create(payload, { transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async inventoryRecords(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.SparePartsInventoryRecords.count({ where });
    const data = await ctx.model.SparePartsInventoryRecords.findAll({
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
}

module.exports = SparePartsService;
