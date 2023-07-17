'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

/**
* @controller 设备模型 deviceModels
*/

class DeviceModelsController extends BaseController {
  /**
  * @apikey
  * @summary 设备模型列表
  * @description 获取所有设备模型
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-models
  */
  async findAll () {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.deviceModelsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceModels.findAll(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 设备模型
  * @description 获取某个 设备模型
  * @router get device-models/:id
  * @request path number *id eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.deviceModelsId, ctx.params);
    const res = await service.deviceModels.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 设备模型
  * @description 创建 设备模型
  * @router post device-models
  * @request body deviceModelsBodyReq
  */
  async create () {
    const { ctx, service } = this;
    const params = ctx.request.body;
    const { company_id } = ctx.request.header;
    ctx.validate(ctx.rule.deviceModelsBodyReq, params);
    // 忽略大小写查询
    const model = await service.deviceModels.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), company_id });
    if (model) {
      this.BAD_REQUEST({ message: '模型名称已被使用，不能重复添加' });
      return false;
    }
    await service.deviceModels.create(params);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备模型
  * @description 更新 设备模型
  * @router put device-models/:id
  * @request path number *id eg:1
  * @request body deviceModelsPutBodyReq
  */
  async update () {
    const { ctx, service } = this;
    const { company_id } = ctx.request.header;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.deviceModelsPutBodyReq, params);
    // 忽略大小写查询
    const model = await service.deviceModels.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), company_id, id: { [Op.not]: params.id } });
    if (model) {
      this.BAD_REQUEST({ message: '模型名称已存在' });
      return false;
    }
    const res = await service.deviceModels.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备模型
  * @description 删除 设备模型
  * @router delete device-models/:id
  * @request path string *id eg:1
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.deviceModelsId, params);
    const res = await service.deviceModels.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 查询模型及其属性
  * @description 查询模型及其属性
  * @router get device-models/:id/attrs
  * @request path number *id eg:1
  */
  async getDetailAndAttrs () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.deviceModelsId, ctx.params);
    const res = await service.deviceModels.getDetailAndAttrs(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }
  /**
  * @apikey
  * @summary 获取模型及属性
  * @description 获取模型及属性
  * @router get export-device-models
  */
  async getModelsWithAttrs () {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.deviceModelsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceModels.getModelsWithAttrs(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 导入模型及其属性
  * @description 导入模型及其属性
  * @router post import-device-models
  * @request query string is_cover '遇到数据库已存在的数据是否覆盖，默认不覆盖，1：覆盖'
  * @request body deviceModelsBodyReq
  */
  async importModelAndAttrs () {
    const { ctx } = this;
    const { is_cover = 0 } = ctx.query;
    let params = ctx.request.body;
    let attrRule = ctx.rule.deviceModelTagsBodyReq;
    delete attrRule.model_id;
    const modelRule = {
      ...ctx.rule.deviceModelsBodyReq,
      attrs: {
        type: 'array',
        itemType: 'object',
        rule: attrRule,
      },
    };
    const rule = {
      models: {
        type: 'array',
        itemType: 'object',
        rule: modelRule,
      },
    };
    ctx.validate(rule, { models: params });
    // 先去除重名
    let modelNames = [];
    let failArr = [];
    let addArr = [];
    params.forEach(item => {
      if (!modelNames.includes(item.name)) {
        addArr.push(item);
        modelNames.push(item.name);
      } else {
        failArr.push({
          ...item,
          fail_reason: '重复',
        });
      }
    });
    addArr.forEach(async data => {
      if (!data.kind) {
        data = {
          ...data,
          kind: 1,
        };
      }
      let res = await this.resolveUpsertModel(data, is_cover);
      if (!res) {
        failArr.push({
          ...data,
          fail_reason: '模型名称已存在',
        });
      }
    });
    this.SUCCESS({ fail_res: failArr });
  }
  async resolveUpsertModel (params, is_cover) {
    const { ctx, service } = this;
    const { company_id } = ctx.request.header;
    // 查询是否有重名模型
    const model = await service.deviceModels.findOne({ name: params.name, company_id }, { raw: true });
    if (model) {
      if (Number(is_cover) === 1) {
        params.id = model.id;
      } else {
        // 不覆盖的情况下，直接返回错误
        // this.INVALID_REQUEST({ message: '模型名称已存在' });
        return false;
      }
    }
    return await service.deviceModels.createModelAndAttrs(params, ctx.query);
  }

  /**
  * @apikey
  * @summary 模型属性导入目录
  * @description 模型属性导入目录
  * @router post model-to-directory
  * @request body modelToDirectoryBodyReq
  */
  async modelToDirectory () {
    const { ctx, service, app } = this;
    const params = ctx.request.body;
    console.log('params====================', params);
    ctx.validate(ctx.rule.modelToDirectoryBodyReq, params);
    const model = await service.deviceModels.findOne({ id: params.model_id });
    if (!model) {
      this.BAD_REQUEST({ message: '模型不存在' });
      return false;
    }
    const { directory_id, kind } = params;
    let directoryModelName = Number(kind) === 2 ? 'Departments' : 'Stations';
    const directory = await ctx.model[directoryModelName].findOne({ where: { id: directory_id }, raw: true });
    if (!directory || !directory.id) {
      this.BAD_REQUEST({ message: '目录不存在' });
      return false;
    }
    let data = await service.deviceModels.modelToDirectory(params, directory);
    this.CREATED({ data, message: '成功' });
  }
}

module.exports = DeviceModelsController;
