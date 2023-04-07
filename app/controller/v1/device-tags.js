'use strict';

const BaseController = require('../base-controller');
const { Sequelize, Op } = require('sequelize');

/**
* @controller 设备绑定点位 device-tags
*/

class DeviceTagsController extends BaseController {
  /**
  * @apikey
  * @summary 设备绑定点位列表
  * @description 获取所有设备绑定点位
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get device-tags
  */
  async findAll() {
    const { ctx, service } = this;
    const rule = {
      device_id: {
        required: true,
        type: 'number',
      },
    };
    ctx.validate(rule, ctx.query);
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.deviceTagsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.deviceTags.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 设备绑定点位
  * @description 创建 设备绑定点位
  * @router post device-tags
  * @request body deviceTagsBodyReq
  */
  async create() {
    const { ctx, service, app } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.deviceTagsBodyReq, params);
    // 忽略大小写查询
    const attr = await service.deviceTags.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), device_id: params.device_id });
    if (attr) {
      this.BAD_REQUEST({ message: '该属性已存在' });
      return false;
    }
    await service.deviceTags.create(params);
    await app.utils.tools.setAttrsRedisCache();
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 设备绑定点位
  * @description 更新 设备绑定点位
  * @router put device-tags/:id
  * @request path number *id eg:1
  * @request body deviceTagsPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceTagsPutBodyReq, params);
    // 忽略大小写查询
    const attr = await service.deviceTags.findOne({ name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), '=', params.name.toLowerCase()), device_id: params.device_id, id: { [Op.not]: params.id } });
    if (attr) {
      this.BAD_REQUEST({ message: '该属性已存在' });
      return false;
    }
    const res = await service.deviceTags.update(params);
    await app.utils.tools.setAttrsRedisCache();
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 设备绑定点位
  * @description 删除 设备绑定点位
  * @router delete device-tags/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service, app } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.deviceTagsId, params);
    const res = await service.deviceTags.destroy(params);
    await app.utils.tools.setAttrsRedisCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
   * 获取属性及其实时数据
  * 获取属性及其实时数据
  * post device-tag-datas
  * body deviceTagsDataReq
  */
  async getTagDatas() {
    const { ctx, service, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const params = { ...ctx.request.body, ...ctx.query };
    ctx.validate(ctx.rule.deviceTagsDataReq, params);
    let { data, noTagAttrs } = await service.deviceTags.getTagDatas(params);
    try {
      let resData = [];
      if (noTagAttrs && noTagAttrs.length) {
        const attr_values = await ctx.service.cache.get('attr_values', 'attrs') || {};
        noTagAttrs = noTagAttrs.map(item => {
          item.value = attr_values[item.id] || null;
          return item;
        });
        resData = [ ...resData, ...noTagAttrs ];
      }
      // 如果data为空数组，直接返回
      if ((!data || !data.length) && (noTagAttrs && noTagAttrs.length)) {
        this.SUCCESS(resData);
        return false;
      }
      const res = await ctx.curl(`${requestBaseUrl}box-data/data`, {
        method: 'POST',
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        data,
      }).catch(err => {
        console.log(err);
        return false;
      });
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      if (res && res.data && res.data.length) {
        resData = [ ...resData, ...res.data ];
      }
      this.SUCCESS(resData);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DeviceTagsController;
