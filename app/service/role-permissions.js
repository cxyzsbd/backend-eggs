'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class _objectName_Service extends Service {
  async findAll (payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order, role_id = null } = payload;
    let where = payload.where;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.RolePermissions.count({ where });
    let tempObj = {
      where,
      order: Order,
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
    };
    if (pageSize < 0 && role_id) {
      delete tempObj.limit;
      delete tempObj.offset;
    }
    const data = await ctx.model.RolePermissions.findAll(tempObj);
    let resObj = {
      data,
      total: count,
      pageNumber,
      pageSize,
    };
    if (pageSize < 0 && role_id) {
      delete resObj.pageNumber;
      delete resObj.pageSize;
    }
    return resObj;
  }

  async findOne (id) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.findOne({ where: { id } });
  }

  async create (payload) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.findOrCreate({
      where: payload,
      defaults: payload,
    });
  }

  async update (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const RolePermissions = ctx.model.RolePermissions;
    const data = await RolePermissions.findByPk(payload.id);
    if (!data) return { _wrong_code: 'NOT_FOUND' };
    const res = await RolePermissions.findOne({
      where: {
        role_id: payload.role_id,
        permission_id: payload.permission_id,
        id: {
          [Op.not]: payload.id,
        },
      },
    });
    if (res) {
      return {
        _wrong_code: 'DATA_EXISTED',
      };
    }
    let where = {
      id: payload.id,
    };
    if (Number(request_user) !== 1) {
      where = {
        ...where,
        role_id: {
          [Op.not]: 1,
        },
      };
    }
    return await RolePermissions.update(payload, {
      where,
    });
  }

  async destroy (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const delData = await ctx.model.RolePermissions.findAll({
      where: { id: payload.ids },
    });
    let where = {
      id: payload.ids,
    };
    if (Number(request_user) !== 1) {
      where = {
        ...where,
        role_id: {
          [Op.not]: 1,
        },
      };
    }
    return await ctx.model.RolePermissions.destroy({
      where,
      delData,
    });
  }

  /**
   *  单角色批量添加多菜单
   * @param payload
   * @return {Promise<void>}
   */
  async bulkCreatePremissions (payload) {
    const { ctx } = this;
    // 先查询该角色包含哪些资源
    const permissions = await ctx.model.RolePermissions.findAll({
      where: {
        role_id: payload.role_id,
      },
      attributes: [ 'permission_id' ],
    });
    // 提取permission_id成数字数组
    const permission_ids = permissions.map(item => item.permission_id);
    // 筛选可以添加的数据
    const ids = payload.permission_ids.filter(id => !permission_ids.includes(id));
    const data = ids.map(e => {
      return { role_id: payload.role_id, permission_id: e };
    });
    return await ctx.model.RolePermissions.bulkCreate(data);
  }
  /**
   *  单角色批量删除多资源
   * @param payload
   * @param payload.role_id
   * @param payload.permission_ids
   * @return {Promise<void>}
   */
  async bulkDeletePermissions ({ role_id, permission_ids }) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.destroy({
      where: {
        role_id,
        permission_id: {
          [Op.in]: permission_ids,
        },
      },
    });
  }
}

module.exports = _objectName_Service;
