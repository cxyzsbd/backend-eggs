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
        model_id: Number(model_id),
      },
    });
    console.log('results=================', results);
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
    const { is_cover = 1 } = ctx.query;
    const headerMap = {
      属性名: 'name',
      '值类型(1:int;2:float;4:string)': 'type',
      描述: 'desc',
      单位: 'unit',
      值范围: 'range',
    };
    const fileStream = await ctx.getFileStream();
    const workbook = new app.utils.tools.Excel.Workbook();
    await workbook.xlsx.read(fileStream);
    const worksheet = workbook.getWorksheet(1); // 获取第一个工作表
    let data = [];
    worksheet.eachRow((row, rowNumber) => {
      // 逐行读取数据
      let rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // 逐列读取数据
        const cellValue = cell.value;
        const cellKey = worksheet.getCell(1, colNumber).value; // 假设第一行是表头
        rowData[cellKey] = cellValue;
      });
      // 将当前行的数据添加到JSON数组中
      if (rowNumber !== 1) { // 跳过表头行
        data.push(rowData);
      }
    });
    let failArr = [];
    let addArr = [];
    let names = [];
    // 返回每条失败数据的失败原因
    // 1：excel表内重复;2：属性已存在（is_cover=0）;3:服务端错误，插入失败
    data.forEach(item => {
      if (!names.includes(item['属性名'])) {
        names.push(item['属性名']);
        addArr.push(item);
      } else {
        failArr.push({
          ...item,
          fail_reason: '表内重复',
        });
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
    let updateArr = [];
    addArr.forEach(item => {
      if (!failDataNames.includes(item['属性名'])) {
        if (item['属性名'].length > 20) {
          failArr.push({
            ...item,
            fail_reason: '属性名长度不符合规则',
          });
        } else {
          createArr.push(item);
        }
      } else {
        if (Number(is_cover) === 1) {
          const { id = null } = (failDatas.filter(f => f.name === item['属性名']))[0];
          if (id) {
            updateArr.push({
              ...item,
              id,
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
    console.log('updateArr============', updateArr);
    let create_res = [];
    let update_res = [];
    if (createArr && createArr.length) {
      let createRows = createArr.map(item => {
        let temp = { model_id };
        Object.keys(item).forEach(key => {
          temp[headerMap[key]] = item[key];
        });
        return temp;
      });
      create_res = await service.deviceModelTags.bulkCreate(createRows);
    }
    if (updateArr && updateArr.length) {
      updateArr.forEach(async item => {
        let temp = { model_id: Number(model_id), id: Number(item.id) };
        Object.keys(item).forEach(key => {
          if (headerMap[key]) {
            temp[headerMap[key]] = item[key];
          }
        });
        console.log('temp===============', temp);
        // 对比更新数据和已存在的数据是否相同
        const d = (failDatas.filter(f => f.id === temp.id))[0];
        console.log('d============', d);
        if (app.utils.tools.lodash.isEqual(d, temp)) {
          console.log(2);
          failArr.push({
            ...item,
            fail_reason: '没有更改',
          });
        } else {
          console.log(1);
          update_res.push(item);
        }
        await service.deviceModelTags.update(temp);
      });
    }
    this.SUCCESS({
      create_res,
      update_res,
      fail: failArr,
    });
  }
}

module.exports = DeviceModelTagsController;
