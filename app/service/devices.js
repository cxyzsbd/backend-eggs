'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class DevicesService extends Service {
  async findAll (payload) {
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

  async findOne (payload, options = {}) {
    const { ctx } = this;
    return await ctx.model.Devices.findOne({ where: payload, ...options });
  }

  async create (payload) {
    const { ctx, app } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, department_id, company_id };
    payload.id = await app.utils.tools.SnowFlake();
    return await ctx.model.Devices.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    delete payload.model_id;
    return await ctx.model.Devices.update(payload, { where: { id: payload.id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      // 删除模型
      const res = await ctx.model.Devices.destroy({ where: { id: payload.id }, transaction });
      // 删除属性
      await ctx.model.DeviceTags.destroy({ where: { device_id: payload.id }, transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async modelToDevice (payload) {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    const { model_id, station_id, name, type, brand, model, desc, img } = payload;
    // let modelData = await ctx.model.DeviceModels.findOne({ where: { id: model_id }, raw: true });
    // const { name, type, brand, model, desc, img } = modelData;
    let tags = await ctx.model.DeviceModelTags.findAll({ where: { model_id }, raw: true });
    const transaction = await ctx.model.transaction();
    try {
      // 生成设备
      const id = await app.utils.tools.SnowFlake();
      const device = await ctx.model.Devices.create({
        id,
        name, type, brand, model, desc, img,
        creator: request_user,
        company_id,
        station_id,
        model_id,
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
          station_id,
        }, { transaction });
      }
      await transaction.commit();
      return device;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async getDetailAndAttrs (payload) {
    const { ctx } = this;
    return await ctx.model.Devices.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.DeviceTags,
          as: 'attrs',
        },
      ],
    });
  }

  async getDevicesWithAttrs (payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { prop_order, order } = payload;
    const { st, et } = queryOrigin;
    let where = {
      ...payload.where,
      company_id,
    };
    if (st && et) {
      where.create_at = {
        [Op.between]: [ st, et ],
      };
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    return await ctx.model.Devices.findAll({
      where,
      order: Order,
      include: [
        {
          model: ctx.model.DeviceTags,
          as: 'attrs',
        },
      ],
    });
  }

  async createDeviceAndAttrs (payload, query) {
    const { ctx, app } = this;
    let { id = null, attrs = [] } = payload;
    const { is_cover = 0 } = query;
    const { request_user, company_id, department_id } = ctx.request.header;
    let res = null;
    let params = payload;
    if (id) {
      res = params;
      await ctx.model.Devices.update(params, { where: { id } });
    } else {
      id = await app.utils.tools.SnowFlake();
      params = {
        ...params,
        creator: request_user,
        company_id,
        department_id,
        id,
      };
      res = await ctx.model.Devices.create(params, { raw: true });
    }
    // 添加属性
    let failArr = [];
    let addArr = [];
    let names = [];
    attrs.forEach(item => {
      if (!names.includes(item.name)) {
        names.push(item.name);
        addArr.push(item);
      } else {
        failArr.push({
          ...item,
          fail_reason: '表内重复',
        });
      }
    });
    let addnames = addArr.map(item => item.name);
    const failDatas = await ctx.model.DeviceTags.findAll({
      where: {
        device_id: id,
        name: {
          [Op.in]: addnames,
        },
      },
      raw: true,
    });
    const failDataNames = failDatas.map(item => item.name);
    let createArr = [];
    let updateArr = [];
    addArr.forEach(item => {
      item = {
        ...item,
        device_id: id,
        company_id,
      };
      if (!failDataNames.includes(item.name)) {
        if (item.name.length > 20) {
          failArr.push({
            ...item,
            fail_reason: '属性名长度不符合规则',
          });
        } else {
          createArr.push(item);
        }
      } else {
        if (Number(is_cover) === 1) {
          const data = (failDatas.filter(f => f.name === item.name))[0] || null;
          if (data && data.id) {
            updateArr.push({
              ...item,
              id: data.id,
            });
          }
        } else {
          failArr.push({
            ...item,
            fail_reason: '属性已存在',
          });
        }
      }
    });
    console.log('createArr==========', createArr);
    console.log('updateArr==========', updateArr);
    let create_res = [];
    let update_res = [];
    if (createArr && createArr.length) {
      create_res = await ctx.model.DeviceTags.bulkCreate(createArr);
    }
    if (updateArr && updateArr.length) {
      updateArr.forEach(async item => {
        // 对比更新数据和已存在的数据是否相同
        const d = (failDatas.filter(f => f.id === item.id))[0];
        console.log('d============', d);
        if (app.utils.tools.lodash.isEqual(d, item)) {
          console.log(2);
          failArr.push({
            ...item,
            fail_reason: '没有更改',
          });
        } else {
          console.log(1);
          update_res.push(item);
        }
        await ctx.model.DeviceTags.update(item, { where: { id: item.id } });
      });
    }
    return res;
  }
}

module.exports = DevicesService;
