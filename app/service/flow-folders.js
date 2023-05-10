'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class FlowFoldersService extends Service {
  async findAll(payload, queryOrigin) {
    const { ctx, app } = this;
    // const redisAttr = app.redis.clients.get('attrs');
    const { company_id } = ctx.request.header;
    const { st, et } = queryOrigin;
    // const allStations = JSON.parse(await redisAttr.get('stations'));
    const allStations = JSON.parse(await app.utils.tools.getStationsCache());
    const departments = await ctx.service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    const stations = allStations.filter(item => departmentIds.includes(item.department_id));
    const station_ids = stations.map(item => item.id);
    console.log('ids=============', departmentIds);
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    console.log('where========================', where);
    if (st && et) {
      where = {
        ...where,
        create_at: {
          [Op.between]: [ st, et ],
        },
      };
    }
    where = { ...where, company_id };
    if (where[Op.or]) {
      where[Op.or].map(item => {
        return {
          ...item,
          [Op.or]: [
            {
              department_id: {
                [Op.in]: departmentIds,
              },
            },
            {
              station_id: {
                [Op.in]: station_ids,
              },
            },
          ],
        };
      });
    } else {
      where = {
        ...where,
        [Op.or]: [
          {
            department_id: {
              [Op.in]: departmentIds,
            },
          },
          {
            station_id: {
              [Op.in]: station_ids,
            },
          },
        ],
      };
    }

    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.FlowFolders.count({ where });
    const data = await ctx.model.FlowFolders.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      include: [
        {
          model: ctx.model.Flows,
          as: 'flows',
          through: {
            where: { is_default: 1 },
          },
        },
      ],
    });
    return {
      data,
      pageNumber,
      pageSize,
      total,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    let { department_id } = ctx.request.header;
    if (department_id || department_id == 0) {
      const departments = await ctx.service.departments.getUserDepartments();
      const departmentIds = departments.map(item => item.id);
      payload.department_id = {
        [Op.in]: departmentIds,
      };
    }
    return await ctx.model.FlowFolders.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.Flows,
          as: 'flows',
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, company_id, department_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, company_id, department_id };
    return await ctx.model.FlowFolders.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.FlowFolders.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    const { id } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.FlowFolders.destroy({ where: { id }, transaction });
      if (res) {
        // 删除绑定关系
        await ctx.model.FlowFolderFlows.destroy({
          where: {
            flow_folder_id: id,
          },
          transaction,
        });
      }
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async bind(payload) {
    const { ctx } = this;
    const { id, flow_ids } = payload;
    let tempArr = flow_ids.map(flow_id => {
      return {
        flow_id,
        flow_folder_id: id,
      };
    });
    let isHaveArr = await ctx.model.FlowFolderFlows.findAll({
      where: {
        flow_id: {
          [Op.in]: flow_ids,
        },
      },
      raw: true,
    });
    isHaveArr = isHaveArr.map(item => item.flow_id);
    tempArr = tempArr.filter(item => !isHaveArr.includes(item.flow_id));
    // console.log('tempArr', tempArr);
    let res = {
      exists: isHaveArr,
      success: 0,
    };
    if (tempArr.length) {
      res.success = (await ctx.model.FlowFolderFlows.bulkCreate(tempArr)).length;
    }
    return res;
  }

  async unbind(payload) {
    const { ctx } = this;
    const { id, flow_ids } = payload;
    return await ctx.model.FlowFolders.destroy({ where: {
      flow_id: {
        [Op.in]: flow_ids,
      },
      flow_folder_id: id,
    } });
  }

  async setDefaultFlow(payload) {
    const { ctx } = this;
    const { id, flow_id } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.FlowFolderFlows.update({
        is_default: 1,
      }, {
        where: {
          flow_folder_id: id,
          flow_id,
        },
        transaction,
      });
      if (res && res[0] !== 0) {
        await ctx.model.FlowFolderFlows.update({
          is_default: 0,
        }, {
          where: {
            flow_folder_id: id,
            flow_id: {
              [Op.not]: flow_id,
            },
          },
          transaction,
        });
      }
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = FlowFoldersService;
