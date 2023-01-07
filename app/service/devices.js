'use strict';

const Service = require('egg').Service;

class DevicesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Devices.count({ where });
    const data = await ctx.model.Devices.findAll({
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
    return await ctx.model.Devices.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.creator = request_user;
    payload.department_id = department_id;
    return await ctx.model.Devices.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    delete payload.model_id;
    return await ctx.model.Devices.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Devices.destroy({ where: { id: payload.id } });
  }

  async modelToDevice(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    const { model_id } = payload;
    let modelData = await ctx.model.DeviceModels.findOne({ where: { id: model_id }, raw: true });
    const { name, type, brand, model, desc, img } = modelData;
    let tags = await ctx.model.DeviceModelTags.findAll({ where: { model_id }, raw: true });
    const transaction = await ctx.model.transaction();
    try {
      // 生成设备
      const device = await ctx.model.Devices.create({
        name, type, brand, model, desc, img,
        creator: request_user,
        department_id,
      }, { raw: true, transaction });
      if (device) {
        tags.map(t => {
          delete t.id;
          delete t.model_id;
          t.device_id = device.id;
          return t;
        });
        await ctx.model.DeviceTags.bulkCreate(tags, { transaction });
      }
      await transaction.commit();
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = DevicesService;
