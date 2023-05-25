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

  async exportAttrs() {
    const { ctx, app } = this;
    const { model_id } = ctx.params;
    // 查询数据
    const results = await ctx.model.DeviceModelTags.findAll({
      where: {
        model_id,
      },
    });
    const workbook = new app.utils.tools.Excel.Workbook();
    const worksheet = workbook.addWorksheet('模型属性表');
    worksheet.columns = [
      { header: '属性名', key: 'name', width: 50 },
      { header: '值类型(1:int;2:float;4:string)', key: 'type', width: 30 },
      { header: '描述', key: 'desc', width: 50 },
      { header: '单位', key: 'unit', width: 30 },
      { header: '值范围', key: 'range', width: 60 },
    ];
    for (const row of results) {
      worksheet.addRow(row.toJSON());
    }
    const buffer = await workbook.xlsx.writeBuffer({ encoding: 'utf-8' });

    // 发送Excel文件给客户端
    ctx.attachment('模型属性表.xlsx');
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.body = buffer;
  }

  async importAttrs() {
    const { ctx, app, service } = this;
    const { model_id } = ctx.params;
    const headerMap = {
      属性名: 'name',
      '值类型(1:int;2:float;3:int;4:string)': 'type',
      描述: 'desc',
      单位: 'unit',
      值范围: 'range',
    };
    const fileStream = await ctx.getFileStream();
    const buffer = await app.utils.tools.streamToBuffer(fileStream);
    const workbook = app.utils.tools.XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = app.utils.tools.XLSX.utils.sheet_to_json(sheet);
    let failArr = [];
    let addArr = [];
    let names = [];
    data.forEach(item => {
      if (!names.includes(item['属性名'])) {
        names.push(item['属性名']);
        addArr.push(item);
      } else {
        failArr.push(item);
      }
    });
    let addnames = addArr.map(item => item['属性名']);
    const failDatas = await ctx.model.DeviceModelTags.findAll({
      where: {
        model_id,
        name: {
          [Op.in]: addnames,
        },
      },
      raw: true,
    });
    const failDataNames = failDatas.map(item => item.name);
    let createArr = [];
    addArr.forEach(item => {
      if (!failDataNames.includes(item['属性名'])) {
        if (item['属性名'].length > 20) {
          failArr.push(item);
        } else {
          createArr.push(item);
        }
      } else {
        failArr.push(item);
      }
    });
    let rows = createArr.map(item => {
      let temp = { model_id };
      Object.keys(item).forEach(key => {
        temp[headerMap[key]] = item[key];
      });
      return temp;
    });
    const res = await service.deviceModelTags.bulkCreate(rows);
    console.log('rows=======', rows);
    this.SUCCESS({
      success: res,
      fail: failArr,
    });
  }
}

module.exports = DeviceModelTagsController;
