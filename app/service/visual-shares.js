'use strict';

const Service = require('egg').Service;
const path = require('path');
const fs = require('fs');

class VisualSharesService extends Service {
  async findAll (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order, type } = payload;
    let where = payload.where;
    where.creator = request_user;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.VisualShares.count({ where });
    let tempObj = {
      where,
      order: Order,
    };
    let include = [];
    if (Number(type) === 1) {
      include = [
        {
          model: ctx.model.Screens,
          as: 'screen_info',
        },
      ];
    } else {
      include = [
        {
          model: ctx.model.Flows,
          as: 'flow_info',
        },
      ];
    }
    if (pageSize > 0) {
      tempObj = {
        ...tempObj,
        limit: pageSize,
        offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
        include,
      };
    }
    const data = await ctx.model.VisualShares.findAll(tempObj);
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

  async findOne (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    if (request_user) {
      payload.creator = request_user;
    }
    let res = await ctx.model.VisualShares.findOne({
      where: payload,
      raw: true,
    });
    if (!res) {
      return res;
    }
    res.has_pass = false;
    if (res.share_pass) {
      res.has_pass = true;
    }
    delete res.share_pass;
    return res;
  }

  async create (payload) {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    payload.id = await app.utils.tools.SnowFlake();
    payload.creator = request_user;
    payload.company_id = company_id;
    // 文件路径
    const pathfix = company_id ? `/${company_id}` : '';
    const typeUrl = payload.type === 1 ? 'screens' : 'flows';
    payload.config_path = `/files${pathfix}/${typeUrl}/${payload.visual_id}/config.json`;
    return await ctx.model.VisualShares.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    return await ctx.model.VisualShares.update(payload, { where: { id: payload.id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    return await ctx.model.VisualShares.destroy({ where: { id: payload.id, creator: request_user } });
  }

  async getConfig () {
    const { ctx, app } = this;
    const { visualId, configPath, viaualType } = ctx.request.header;
    // 校验可视化工程存不存在
    const MODEL = Number(viaualType) === 1 ? 'Screens' : 'Flows';
    let res = await ctx.model[MODEL].findOne({ where: { id: visualId }, raw: true });
    if (!res) {
      return res;
    }
    let target = path.join(this.config.baseDir, `..${configPath}`);
    const hasPath = await app.utils.tools.checkHasDir(target);
    res.configs = hasPath ? JSON.parse(fs.readFileSync(target, 'utf-8')) : null;
    return res;
  }
}

module.exports = VisualSharesService;
