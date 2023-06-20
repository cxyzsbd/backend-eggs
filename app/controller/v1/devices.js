'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

/**
* @controller 设备 devices
*/

class devicesController extends BaseController {
  /**
  * @apikey
  * @summary 设备列表
  * @description 获取所有设备
  * @request query *string station_id
  * @request query number pageSize
  * @request query number pageNumber
  * @router get devices
  */
  async findAll () {
    const { ctx, service } = this;
    const rule = {
      station_id: {
        required: true,
        type: 'string',
        max: 20,
      },
    };
    ctx.validate(rule, ctx.query);
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.devicesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.devices.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 设备
  * @description 获取某个 设备
  * @router get devices/:id
  * @request path string *id eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.devicesId, ctx.params);
    const res = await service.devices.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 设备
  * @description 创建 设备
  * @router post devices
  * @request body devicesBodyReq
  */
  async create () {
    const { ctx, app, service } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.devicesBodyReq, params);
    // 忽略大小写查询
    const device = await service.devices.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), station_id: params.station_id });
    if (device) {
      this.BAD_REQUEST({ message: '该站点下已存在同名设备，不能重复添加' });
      return false;
    }
    await service.devices.create(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备
  * @description 更新 设备
  * @router put devices/:id
  * @request path string *id eg:1
  * @request body devicesPutBodyReq
  */
  async update () {
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.devicesPutBodyReq, params);
    // 忽略大小写查询
    const device = await service.devices.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), station_id: params.station_id, id: { [Op.not]: params.id } });
    if (device) {
      this.BAD_REQUEST({ message: '设备名已存在' });
      return false;
    }
    const res = await service.devices.update(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备
  * @description 删除 设备
  * @router delete devices/:id
  * @request path string *id eg:1
  */
  async destroy () {
    const { ctx, service, app } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.devicesId, params);
    const res = await service.devices.destroy(params);
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 模型生成设备
  * @description 通过模型生成设备
  * @router post model-to-device
  * @request body modelToDeviceBodyReq
  */
  async modelToDevice () {
    const { ctx, service, app } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.modelToDeviceBodyReq, params);
    const model = await service.deviceModels.findOne({ id: params.model_id });
    if (!model) {
      this.BAD_REQUEST({ message: '模型不存在' });
      return false;
    }
    // 忽略大小写查询
    const device = await service.devices.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), station_id: params.station_id });
    if (device) {
      this.BAD_REQUEST({ message: '该站点下已存在同名设备，不能重复添加' });
      return false;
    }
    let data = await service.devices.modelToDevice(params);
    data = data.toJSON();
    if (data) {
      delete data.create_at;
      delete data.update_at;
    }
    await app.utils.tools.setAttrsRedisCache();
    await app.utils.tools.setDevicesCache();
    const stations = JSON.parse(await app.utils.tools.getStationsCache());
    data = {
      station_info: null,
      ...data,
    };
    if (stations && stations.length) {
      data.station_info = (stations.filter(item => item.id == params.station_id))[0];
    }
    this.CREATED({ data, message: '成功' });
  }

  /**
  * @apikey
  * @summary 查询设备及其属性
  * @description 查询设备及其属性
  * @router get devices/:id/attrs
  * @request path number *id eg:1
  */
  async getDetailAndAttrs () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.devicesId, ctx.params);
    const res = await service.devices.getDetailAndAttrs(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 获取设备及属性
  * @description 获取设备及属性
  * @router get export-devices
  */
  async getDevicesWithAttrs () {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.devicesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.devices.getDevicesWithAttrs(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 导入设备及其属性
  * @description 导入设备及其属性
  * @router post import-devices
  * @request query string is_cover '遇到数据库已存在的数据是否覆盖，默认不覆盖，1：覆盖'
  * @request body devicesBodyReq
  */
  async importDeviceAndAttrs () {
    const { ctx } = this;
    const { is_cover = 0 } = ctx.query;
    let params = ctx.request.body;
    let attrRule = ctx.rule.deviceTagsBodyReq;
    delete attrRule.device_id;
    const deviceRule = {
      ...ctx.rule.devicesBodyReq,
      attrs: {
        type: 'array',
        itemType: 'object',
        rule: attrRule,
      },
    };
    const rule = {
      devices: {
        type: 'array',
        itemType: 'object',
        rule: deviceRule,
      },
    };
    ctx.validate(rule, { devices: params });
    // 先去除重名
    let deviceNames = [];
    let failArr = [];
    let addArr = [];
    params.forEach(item => {
      if (!deviceNames.includes(item.name)) {
        addArr.push(item);
      } else {
        failArr.push({
          ...item,
          fail_reason: '重复',
        });
      }
    });
    addArr.forEach(async data => {
      let res = await this.resolveUpsertModel(data, is_cover);
      if (!res) {
        failArr.push({
          ...data,
          fail_reason: '设备名称已存在',
        });
      }
    });
    this.SUCCESS({ fail_res: failArr });
  }

  async resolveUpsertModel (params, is_cover) {
    const { ctx, service } = this;
    // 查询是否有重名
    const device = await service.devices.findOne({ name: params.name, station_id: params.station_id }, { raw: true });
    if (device) {
      if (Number(is_cover) === 1) {
        params.id = device.id;
      } else {
      // 不覆盖的情况下，直接返回错误
        return false;
      }
    }
    return await service.devices.createDeviceAndAttrs(params, ctx.query);
  }
}

module.exports = devicesController;
