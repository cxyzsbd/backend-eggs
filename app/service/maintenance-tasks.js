'use strict';

const Service = require('egg').Service;
const { Op, Sequelize } = require('sequelize');

class MaintenanceTasksService extends Service {
  async findAll(payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { st, et } = queryOrigin;
    const { pageSize, pageNumber, prop_order, order, status } = payload;
    let where = payload.where;
    where = {
      ...where,
      company_id,
    };
    if (st && et) {
      where.start_time = {
        [Op.between]: [ st, et ],
      };
    }
    if (status || status === 0) {
      if (status === 4) {
        delete where.status;
        where[Op.and] = [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.lt]: new Date().getTime(),
          } },
        ];
      } else if (status !== 3) {
        where.end_time = {
          [Op.gte]: new Date().getTime(),
        };
      }
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.MaintenanceTasks.count({ where });
    const data = await ctx.model.MaintenanceTasks.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
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

  async handlerFindAll(payload, queryOrigin) {
    const { ctx } = this;
    const { company_id, request_user } = ctx.request.header;
    const { st, et } = queryOrigin;
    const { pageSize, pageNumber, prop_order, order, status } = payload;
    let where = payload.where;
    where = {
      ...where,
      company_id,
    };
    if (st && et) {
      where.start_time = {
        [Op.between]: [ st, et ],
      };
    }
    if (status || status === 0) {
      if (status === 4) {
        delete where.status;
        where[Op.and] = [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.lt]: new Date().getTime(),
          } },
        ];
      } else if (status !== 3) {
        where.end_time = {
          [Op.gte]: new Date().getTime(),
        };
      }
    }
    const tasks = await ctx.model.MaintenanceTaskHandlers.findAll({
      where: {
        handler: request_user,
      },
      raw: true,
    });
    if (!tasks || !tasks.length) {
      return {
        data: [],
        pageNumber,
        pageSize,
        total: 0,
      };
    }
    const task_ids = tasks.map(item => item.task_id);
    where.id = {
      [Op.in]: task_ids,
    };
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.MaintenanceTasks.count({ where });
    const data = await ctx.model.MaintenanceTasks.findAll({
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
    const { ctx } = this;
    return await ctx.model.MaintenanceTasks.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.Maintenances,
          as: 'maintenance_info',
          include: [
            {
              as: 'handlers',
              model: ctx.model.Users,
              attributes: { exclude: [ 'password' ] },
            },
            {
              model: ctx.model.MaintenanceTargets,
              include: [
                {
                  model: ctx.model.EquipmentAccounts,
                  as: 'equipment_account',
                },
              ],
            },
          ],
        },
        {
          model: ctx.model.MaintenanceResults,
          as: 'maintenance_results',
          include: [
            {
              model: ctx.model.EquipmentAccounts,
              as: 'equipment_account',
            },
          ],
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.MaintenanceTasks.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.MaintenanceTasks.update(payload, { where: { id: payload.id } });
  }

  async subResult(payload) {
    const { ctx } = this;
    const { id, results, equipment_account_id, audios = null, imgs = null, remarks = null } = payload;
    const { request_user } = ctx.request.header;
    return await ctx.model.MaintenanceResults.update({
      results,
      audios,
      imgs,
      remarks,
      submitter: request_user,
      complete_at: new Date(),
    }, { where: { task_id: id, equipment_account_id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.MaintenanceTasks.destroy({ where: { id: payload.id } });
  }

  async operationRecords(task_id = null) {
    const { ctx } = this;
    if (!task_id) {
      return null;
    }
    const data = await ctx.model.OperationRecords.findAll({
      where: {
        path: {
          [Op.like]: `%/maintenance-tasks/${task_id}%`,
        },
        action: {
          [Op.not]: 'get',
        },
      },
      order: [
        [ 'operation_time', 'DESC' ],
      ],
      attributes: {
        include: [
          [ Sequelize.col('operator.username'), 'operator_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'operator',
          attributes: [],
        },
      ],
    });
    return data;
  }

  async statistics(query) {
    const { ctx } = this;
    const { st, et } = query;
    const MaintenanceTasks = ctx.model.MaintenanceTasks;
    const MaintenanceTaskHandlers = ctx.model.MaintenanceTaskHandlers;
    const { company_id, request_user } = ctx.request.header;
    let where = {
      company_id,
    };
    if (st && et) {
      where = {
        ...where,
        start_time: {
          [Op.between]: [ st, et ],
        },
      };
    }
    // 未接收
    const notReceiveCount = await MaintenanceTasks.count({
      where: {
        ...where,
        status: 1,
        end_time: {
          [Op.gte]: new Date().getTime(),
        },
      },
      include: [
        {
          model: MaintenanceTaskHandlers,
          where: {
            handler: request_user,
          },
          required: true,
        },
      ],
    });
    // 已接收，未完成
    const receivedCount = await MaintenanceTasks.count({
      where: {
        ...where,
        status: 2,
        end_time: {
          [Op.gte]: new Date().getTime(),
        },
      },
      include: [
        {
          model: MaintenanceTaskHandlers,
          where: {
            handler: request_user,
          },
          required: true,
        },
      ],
    });
    // 已完成
    const completeCount = await MaintenanceTasks.count({
      where: {
        ...where,
        status: 3,
      },
      include: [
        {
          model: MaintenanceTaskHandlers,
          where: {
            handler: request_user,
          },
          required: true,
        },
      ],
    });
    // 已逾期
    const overdueCount = await MaintenanceTasks.count({
      where: {
        ...where,
        [Op.and]: [
          { status: {
            [Op.lte]: 2,
          } },
          { end_time: {
            [Op.lt]: new Date().getTime(),
          } },
        ],
      },
      include: [
        {
          model: MaintenanceTaskHandlers,
          where: {
            handler: request_user,
          },
          required: true,
        },
      ],
    });
    return {
      notReceiveCount,
      receivedCount,
      completeCount,
      overdueCount,
    };
  }
}

module.exports = MaintenanceTasksService;
