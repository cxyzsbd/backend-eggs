'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class StationsService extends Service {
  async findAll(payload) {
    const { ctx, service } = this;
    const { company_id, department_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    // 获取当前用户下所有的部门
    const departments = await service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    if (department_id || department_id == 0) {
      where.department_id = {
        [Op.in]: departmentIds,
      };
    }
    // console.log('departmentIds===============', departmentIds);
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.Stations.count({ where });
    // console.log('pageSize', pageSize);
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
    const data = await ctx.model.Stations.findAll(tempObj);
    let resObj = {
      data,
      total,
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

  async findOne(payload, hasInclude = true) {
    const { ctx } = this;
    if (!hasInclude) {
      return await ctx.model.Stations.findOne({ where: payload });
    }
    return await ctx.model.Stations.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.StationAttrs,
        },
      ],
    });
  }

  async create(payload) {
    const { ctx, app } = this;
    const { company_id, request_user } = ctx.request.header;
    payload = {
      ...payload,
      creator: request_user,
      company_id,
    };
    payload.id = await app.utils.tools.SnowFlake();
    return await ctx.model.Stations.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Stations.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx, app } = this;
    // const redisAttr = app.redis.clients.get('attrs');
    // const allDevices = JSON.parse(await redisAttr.get('devices'));
    const allDevices = JSON.parse(await app.utils.tools.getDevicesCache());
    const { id } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.Stations.destroy({
        where: { id }, transaction,
      });
      if (res) {
        const devices = allDevices.filter(item => item.station_id == id);
        const deviceIds = devices.map(item => item.id);
        if (deviceIds && deviceIds.length) {
          await ctx.model.Devices.destroy({
            where: {
              station_id: id,
            },
            transaction,
          });
          await ctx.model.DeviceTags.destroy({
            where: {
              device_id: {
                [Op.in]: deviceIds,
              },
            },
            transaction,
          });
        }
      }
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }


  async getTag (payload) {

    const { ctx } = this;
    if (!payload.where.device_id || payload.where.device_id.length == 0) {
      const devices = await ctx.model.Devices.findAll({
        where: {
          station_id: payload.station_id,
        },
        raw: true,
        attributes: [ 'id' ],
      });
      payload.where.device_id = devices.map(v => v.id);
    }


    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    delete where.station_id;
    where.kind = 1;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.DeviceTags.count({ where });
    let tempObj = {
      where,
      order: Order,
      include: [
        {
          model: ctx.model.Devices,
        },
      ],
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

}

module.exports = StationsService;
