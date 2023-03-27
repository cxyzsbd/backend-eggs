'use strict';

const Service = require('egg').Service;

class DevicesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Devices.count({ where });
    let tempObj = {
      where,
      order: Order,
    };
    if (pageSize > 0) {
      tempObj = {
        ...tempObj,
        limit: pageSize,
        offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      };
    }
    const data = await ctx.model.Devices.findAll(tempObj);
    let resObj = {
      data,
      total: count,
    };
    if (pageSize > 0) {
      resObj = {
        ...resObj,
        pageNumber,
        pageSize,
      };
    }
    return resObj;
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Devices.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, department_id, company_id };
    return await ctx.model.Devices.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    delete payload.model_id;
    return await ctx.model.Devices.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      await transaction.commit();
      // 删除模型
      const res = await ctx.model.Devices.destroy({ where: { id: payload.id }, transaction });
      // 删除属性
      await ctx.model.DeviceTags.destroy({ where: { device_id: payload.id }, transaction });
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async modelToDevice(payload) {
    const { ctx, app } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    const { model_id, station_id, name, type, brand, model, desc, img } = payload;
    // let modelData = await ctx.model.DeviceModels.findOne({ where: { id: model_id }, raw: true });
    // const { name, type, brand, model, desc, img } = modelData;
    let tags = await ctx.model.DeviceModelTags.findAll({ where: { model_id }, raw: true });
    const transaction = await ctx.model.transaction();
    try {
      // 生成设备
      const device = await ctx.model.Devices.create({
        name, type, brand, model, desc, img,
        creator: request_user,
        company_id,
        station_id,
      }, { raw: true, transaction });
      if (device) {
        tags.map(t => {
          delete t.id;
          delete t.model_id;
          t.device_id = device.id;
          t.company_id = company_id;
          return t;
        });
        await ctx.model.DeviceTags.bulkCreate(tags, { transaction });

        // 生成台账
        const equipmentAccountId = await app.utils.tools.SnowFlake();
        await ctx.model.EquipmentAccounts.create({
          id: equipmentAccountId, name, type, brand, model, desc, networking: 1, creator: request_user, company_id,
          device_id: device.id,
        }, { transaction });
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
