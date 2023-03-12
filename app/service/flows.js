'use strict';

const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class FlowsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Flows.count({ where });
    const data = await ctx.model.Flows.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne(payload) {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    payload.company_id = company_id;
    let res = await ctx.model.Flows.findOne({ where: payload, raw: true });
    if (!res) {
      return res;
    }
    const filename = 'config.json';
    const pathfix = company_id ? `/${company_id}` : '';
    const floder = `/files${pathfix}/flows/${res.id}`;
    let target = path.join(this.config.baseDir, `..${floder}/${filename}`);
    const hasPath = await app.utils.tools.checkHasDir(target);
    res.configs = hasPath ? JSON.parse(fs.readFileSync(target, 'utf-8')) : null;
    return res;
  }

  async create(payload) {
    const { ctx, app } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, department_id, company_id };
    const res = await ctx.model.Flows.create(payload);
    if ((res && res.id) && payload.configs) {
      // 写配置文件
      const filename = 'config.json';
      const pathfix = company_id ? `/${company_id}` : '';
      const floder = `/files${pathfix}/flows/${res.id}`;
      const targetPath = path.join(this.config.baseDir, `..${floder}`);
      // 判断路径是否存在
      await app.utils.tools.dirExists(targetPath);
      const target = path.join(this.config.baseDir, `..${floder}`, filename);
      fs.writeFileSync(target, JSON.stringify(payload.configs));
    }
    return res;
  }

  async update(payload) {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const { id } = payload;
    if (payload.configs) {
      // 传了配置，就认为是修改，手动触发更新时间
      payload.update_at = new Date();
      // 修改配置
      const filename = 'config.json';
      const pathfix = company_id ? `/${company_id}` : '';
      const floder = `/files${pathfix}/flows/${id}`;
      const targetPath = path.join(this.config.baseDir, `..${floder}`);
      // 判断路径是否存在
      await app.utils.tools.dirExists(targetPath);
      const target = path.join(this.config.baseDir, `..${floder}`, filename);
      fs.writeFileSync(target, JSON.stringify(payload.configs));
    }
    return await ctx.model.Flows.update(payload, { where: { id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Flows.destroy({ where: { id: payload.id } });
  }

  async recoveryFlowsList(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const { company_id } = ctx.request.header;
    let where = payload.where;
    where.delete_at = {
      [Op.not]: null,
    };
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Flows.count({ where });
    const data = await ctx.model.Flows.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      paranoid: false,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }
  async forceDelete(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const res = await ctx.model.Flows.destroy({ where: { id: payload.id, company_id }, force: true });
    const pathfix = company_id ? `/${company_id}` : '';
    const targetPath = path.join(this.config.baseDir, `../files${pathfix}/flows/${payload.id}`);
    fs.rm(targetPath, { force: true, recursive: true }, err => {
      console.log(err);
    });
    return res;
  }
  async recoveryFlows(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    return await ctx.model.Flows.restore({ where: { id: payload.id, company_id }, force: true });
  }
}

module.exports = FlowsService;
