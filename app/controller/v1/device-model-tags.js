'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

/**
* @controller 设备模型属性 device-model-tags
*/

class DeviceModelTagsController extends BaseController {
  /**
  * @apikey
  * @summary 设备模型属性列表
  * @description 获取所有设备模型属性
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-model-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.deviceModelTagsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceModelTags.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 设备模型属性
  * @description 创建 设备模型属性
  * @router post device-model-tags
  * @request body deviceModelTagsBodyReq
  */
  async create() {
    const { ctx, service } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.deviceModelTagsBodyReq, params);
    // 忽略大小写查询
    const attr = await service.deviceModelTags.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), model_id: params.model_id });
    if (attr) {
      this.BAD_REQUEST({ message: '该属性已存在' });
      return false;
    }
    await ctx.service.deviceModelTags.create(params);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备模型属性
  * @description 更新 设备模型属性
  * @router put device-model-tags/:id
  * @request path number *id eg:1
  * @request body deviceModelTagsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelTagsPutBodyReq, params);
    // 忽略大小写查询
    const attr = await service.deviceModelTags.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), model_id: params.model_id, id: { [Op.not]: params.id } });
    if (attr) {
      this.BAD_REQUEST({ message: '该属性已存在' });
      return false;
    }
    const res = await service.deviceModelTags.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备模型属性
  * @description 删除 设备模型属性
  * @router delete device-model-tags/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceModelTagsId, params);
    const res = await service.deviceModelTags.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = DeviceModelTagsController;
