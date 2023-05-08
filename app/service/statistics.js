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
    let company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.company_id);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    company_counts_data = company_counts_data.filter(item => item.company_info !== null);
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
      where: {
        department: {
          [Op.not]: 0,
        },
      },
      group: 'department',
      attributes: [ 'department' ],
    });
    const companys = await app.utils.tools.getRedisCachePublic('companys');
    // console.log('companys', companys);
    let company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.department);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    company_counts_data = company_counts_data.filter(item => item.company_info !== null);
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
    let company_counts_data = company_counts.map(item => {
      let info = companys.filter(company => company.id === item.company_id);
      // console.log('info', info);
      return {
        ...item,
        company_info: info && info.length ? info[0] : null,
      };
    });
    company_counts_data = company_counts_data.filter(item => item.company_info !== null);
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

  async companyStationCount() {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const total = await ctx.model.Stations.count({
      where: {
        company_id,
      },
    });
    return { total };
  }

  async companyDeviceCount() {
    const { ctx, app } = this;
    // const redisAttr = app.redis.clients.get('attrs');
    // const allStations = JSON.parse(await redisAttr.get('stations'));
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const { company_id } = ctx.request.header;
    let where = {
      company_id,
    };
    let total = await ctx.model.Devices.count({
      where,
    });
    const station_counts = await ctx.model.Devices.count({
      where,
      attributes: [ 'station_id' ],
      group: 'station_id',
    });
    // console.log('station_counts=====', station_counts);
    let station_counts_data = station_counts.map(item => {
      let info = allStations.filter(station => station.id === item.station_id);
      // console.log('info', info);
      return {
        ...item,
        station_info: info && info.length ? info[0] : null,
      };
    });
    let tempArr = [];
    station_counts_data.forEach(item => {
      if (item.station_info) {
        tempArr.push(item);
      } else {
        total -= item.count;
      }
    });
    const tIds = tempArr.map(t => t.station_id);
    // console.log('tIds============', tIds);
    allStations.forEach(item => {
      if (item.company_id === company_id && !tIds.includes(item.id)) {
        tempArr.push({
          station_id: item.id,
          station_info: item,
          count: 0,
        });
      }
    });
    // console.log('tempArr======', tempArr);
    return {
      total,
      station_device_counts: tempArr,
    };
  }
}

module.exports = StatisticsService;
