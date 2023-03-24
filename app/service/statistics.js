'use strict';

const Service = require('egg').Service;
const { Op, Sequelize } = require('sequelize');

class StatisticsService extends Service {
  async userCount() {
    const { ctx, app } = this;
    const total = await ctx.model.Users.count();
    const company_counts = await ctx.model.Users.count({
      where: {
        company_id: {
          [Op.not]: null,
        },
      },
      group: 'company_id',
      attributes: [ 'company_id' ],
    });
    // 在线用户数统计
    const {
      socketUserPrefix,
    } = app.config;
    const nsp = app.io.of('/');
    const rooms = nsp.adapter.rooms;
    // console.log('rooms========', rooms);
    let count = 0;
    for (let room in rooms) {
      if (room.startsWith(`${socketUserPrefix}_`)) {
        count++;
      }
    }
    // const onlineUsers = await app.redis.clients.get('io').smembers('onlineUsers') || [];
    // console.log('onlineUsers', onlineUsers);
    const companys = await app.utils.tools.getRedisCachePublic('companys');
    // console.log('companys', companys);
    const company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.company_id);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    return {
      total,
      company_counts: company_counts_data,
      online_count: count,
    };
  }

  async boxCount() {
    const { ctx, app } = this;
    const total = await ctx.models.BoxInfo.count();
    const company_counts = await ctx.models.BoxInfo.count({
      group: 'department',
      attributes: [ 'department' ],
    });
    const companys = await app.utils.tools.getRedisCachePublic('companys');
    // console.log('companys', companys);
    const company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.department);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    return {
      total,
      company_counts: company_counts_data,
    };
  }
  async dataSourceCount() {
    const { ctx, app } = this;
    let where = {
      [Op.and]: [
        { boxcode: {
          [Op.not]: null,
        } },
        { boxcode: {
          [Op.not]: null,
        } },
      ],
    };
    const total = await ctx.model.DeviceTags.count({
      where,
    });
    const company_counts = await ctx.model.DeviceTags.count({
      where,
      attributes: [ 'company_id' ],
      group: 'company_id',
    });
    // console.log('company_counts', company_counts);
    const companys = await app.utils.tools.getRedisCachePublic('companys');
    // console.log('companys', companys);
    const company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.company_id);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    return {
      total,
      company_counts: company_counts_data,
    };
  }

  async companyUserCount() {
    const { ctx, app } = this;
    const {
      socketUserPrefix,
    } = app.config;
    const { company_id } = ctx.request.header;
    const nsp = app.io.of('/');
    const rooms = nsp.adapter.rooms;
    // console.log('rooms========', rooms);
    let count = 0;
    for (let room in rooms) {
      if (room.startsWith(`${socketUserPrefix}_${company_id}_`)) {
        count++;
      }
    }
    const total = await ctx.model.Users.count({
      where: {
        company_id,
      },
    });
    return {
      online: count,
      total,
    };
  }

  async companyDataSourceCount() {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const total = await ctx.model.DeviceTags.count({
      where: {
        company_id,
      },
    });
    const bindTags = await ctx.model.DeviceTags.count({
      where: {
        company_id,
        [Op.and]: [
          { boxcode: {
            [Op.not]: null,
          } },
          { boxcode: {
            [Op.not]: null,
          } },
        ],
      },
    });
    return {
      total,
      bindTags,
    };
  }
}

module.exports = StatisticsService;
