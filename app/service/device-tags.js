'use strict';

const Service = require('egg').Service;

class DeviceTagsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    console.log('payload================', payload);
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    if (!where.kind) {
      where = {
        ...where,
        kind: 1,
      };
    }
    let Order = [];
    prop_order && order ? Order.push([prop_order, order]) : null;
    const count = await ctx.model.DeviceTags.count({ where });
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
    const data = await ctx.model.DeviceTags.findAll(tempObj);
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

  async findOne(payload, options = {}) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.findOne({ where: payload, ...options });
  }

  async create(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    payload.company_id = company_id;
    if (!payload.type && payload.type != 0) {
      payload.type = null;
    }
    if (!payload.kind) {
      payload.kind = 1;
    }
    return await ctx.model.DeviceTags.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.destroy({ where: { id: payload.id } });
  }


  async destroyMore(payload) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.destroy({ where: { id: payload.ids } });
  }

  async bulkCreate(arr) {
    const { ctx } = this;
    return await ctx.model.DeviceTags.bulkCreate(arr);
  }

  async getTagDatas(payload) {
    const { ctx, app } = this;
    const { device_id, attr_ids = [] } = payload;
    const attr_tags = JSON.parse(await app.utils.tools.getAttrsCache());
    let tempArr = attr_tags.filter(item => item.device_id === device_id);
    if (attr_ids.length) {
      tempArr = tempArr.filter(item => attr_ids.includes(item.id));
    }
    let data = tempArr.filter(item => item.boxcode && item.tagname);
    let noTagAttrs = tempArr.filter(item => !item.boxcode || !item.tagname);
    return {
      data,
      noTagAttrs,
    };
  }
}

module.exports = DeviceTagsService;
