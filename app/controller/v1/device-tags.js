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

  async exportAttrs() {
    const { ctx, app } = this;
    const { device_id } = ctx.params;
    // 查询数据
    const results = await ctx.model.DeviceTags.findAll({
      where: {
        device_id,
      },
    });
    const workbook = new app.utils.tools.Excel.Workbook();
    const worksheet = workbook.addWorksheet('设备属性表');
    worksheet.columns = [
      // { header: 'ID', key: 'id', width: 10 },
      // { header: '设备ID', key: 'device_id', width: 10 },
      // { header: '点名', key: 'tag', width: 50 },
      { header: '属性名', key: 'name', width: 50 },
      { header: '值类型(1:int;2:float;4:string)', key: 'type', width: 30 },
      { header: '描述', key: 'desc', width: 50 },
      { header: '单位', key: 'unit', width: 30 },
      { header: '值范围', key: 'range', width: 60 },
      { header: '访问码', key: 'boxcode', width: 50 },
      // { header: '点名', key: 'tagname', width: 100 },
      { header: '通道', key: 'channel_name', width: 30 },
      { header: '设备', key: 'device_name', width: 30 },
      { header: '点名', key: 'tag_name', width: 30 },
    ];
    for (const row of results) {
      let data = row.toJSON();
      // console.log('row=======================', row);
      let tagnameArr = [ '', '', '' ];
      if (data.tagname) {
        tagnameArr = data.tagname.split('\\');
      }
      data = {
        ...data,
        channel_name: tagnameArr[0],
        device_name: tagnameArr[1],
        tag_name: tagnameArr[2],
      };
      worksheet.addRow(data);
    }
    const buffer = await workbook.xlsx.writeBuffer({ encoding: 'utf-8' });

    // 发送Excel文件给客户端
    ctx.attachment('设备属性表.xlsx');
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.body = buffer;
  }

  async importAttrs() {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const { device_id } = ctx.params;
    const headerMap = {
      属性名: 'name',
      '值类型(1:int;2:float;3:int;4:string)': 'type',
      描述: 'desc',
      单位: 'unit',
      值范围: 'range',
      访问码: 'boxcode',
      通道: 'channel_name',
      设备: 'device_name',
      点名: 'tag_name',
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
    const failDatas = await ctx.model.DeviceTags.findAll({
      where: {
        device_id,
        company_id,
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
      let temp = { device_id, company_id };
      Object.keys(item).forEach(key => {
        temp[headerMap[key]] = item[key];
      });
      if (item['通道'] && item['设备'] && item['点名']) {
        delete temp.channel_name;
        delete temp.device_name;
        delete temp.tag_name;
        temp.tagname = `${item['通道']}\\${item['设备']}\\${item['点名']}`;
      }
      return temp;
    });
    const res = await this.service.deviceTags.bulkCreate(rows);
    console.log('rows=======', rows);
    this.SUCCESS({
      success: res,
      fail: failArr,
    });
  }
}

module.exports = DeviceTagsController;
