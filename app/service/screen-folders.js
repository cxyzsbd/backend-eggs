'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class ScreenFoldersService extends Service {
  async findAll(payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { st, et } = queryOrigin;
    const departments = await ctx.service.departments.getUserDepartments();
    const departmentIds = departments.map(item => item.id);
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where = { ...where, company_id };
    where.department_id = {
      [Op.in]: departmentIds,
    };
    if (st && et) {
      where = {
        ...where,
        create_at: {
          [Op.between]: [ st, et ],
        },
      };
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.ScreenFolders.count({ where });
    const data = await ctx.model.ScreenFolders.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      include: [
        {
          model: ctx.model.Screens,
          as: 'screens',
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
    return await ctx.model.ScreenFolders.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.Screens,
          as: 'screens',
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, company_id, department_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, company_id, department_id };
    return await ctx.model.ScreenFolders.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.ScreenFolders.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    const { id } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.ScreenFolders.destroy({ where: { id }, transaction });
      if (res) {
        // 删除绑定关系
        await ctx.model.ScreenFolderScreens.destroy({
          where: {
            screen_folder_id: id,
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
    const { id, screen_ids } = payload;
    let tempArr = screen_ids.map(screen_id => {
      return {
        screen_id,
        screen_folder_id: id,
      };
    });
    let isHaveArr = await ctx.model.ScreenFolderScreens.findAll({
      where: {
        screen_id: {
          [Op.in]: screen_ids,
        },
      },
      raw: true,
    });
    isHaveArr = isHaveArr.map(item => item.screen_id);
    tempArr = tempArr.filter(item => !isHaveArr.includes(item.screen_id));
    // console.log('tempArr', tempArr);
    let res = {
      exists: isHaveArr,
      success: 0,
    };
    if (tempArr.length) {
      res.success = (await ctx.model.ScreenFolderScreens.bulkCreate(tempArr)).length;
    }
    return res;
  }

  async unbind(payload) {
    const { ctx } = this;
    const { id, screen_ids } = payload;
    return await ctx.model.ScreenFolders.destroy({ where: {
      screen_id: {
        [Op.in]: screen_ids,
      },
      screen_folder_id: id,
    } });
  }

  async setDefaultScreen(payload) {
    const { ctx } = this;
    const { id, screen_id } = payload;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.ScreenFolderScreens.update({
        is_default: 1,
      }, {
        where: {
          screen_folder_id: id,
          screen_id,
        },
        transaction,
      });
      if (res && res[0] !== 0) {
        await ctx.model.ScreenFolderScreens.update({
          is_default: 0,
        }, {
          where: {
            screen_folder_id: id,
            screen_id: {
              [Op.not]: screen_id,
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

module.exports = ScreenFoldersService;
