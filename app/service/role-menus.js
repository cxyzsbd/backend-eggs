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
    const total = await ctx.model.RoleMenus.count({ where });
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
    const data = await ctx.model.RoleMenus.findAll(tempObj);
    let resObj = {
      data,
      total,
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
    return await ctx.model.RoleMenus.findOne({ where: { id } });
  }

  async create (payload) {
    const { ctx } = this;
    const [ data, created ] = await ctx.model.RoleMenus.findOrCreate({
      where: payload,
      defaults: payload,
    });
    return created;
  }

  async update (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    const RoleMenus = ctx.model.RoleMenus;
    const data = await RoleMenus.findByPk(payload.id);
    if (!data) return { _wrong_code: 'NOT_FOUND' };
    const res = await RoleMenus.findOne({
      where: {
        role_id: payload.role_id,
        menu_id: payload.menu_id,
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
    return await RoleMenus.update(payload, {
      where,
    });
  }

  async destroy (payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
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
    return await ctx.model.RoleMenus.destroy({ where });
  }

  /**
   *  单角色批量添加多菜单
   * @param payload
   * @return {Promise<void>}
   */
  async bulkCreateMenus (payload) {
    const { ctx } = this;
    // 先查询该角色包含哪些菜单
    const menus = await ctx.model.RoleMenus.findAll({
      where: {
        role_id: payload.role_id,
      },
      attributes: [ 'menu_id' ],
    });
    // 提取menu_id成数字数组
    const menu_ids = menus.map(item => item.menu_id);
    // 筛选可以添加的数据
    const ids = payload.menu_ids.filter(id => !menu_ids.includes(id));
    const data = ids.map(e => {
      return { role_id: payload.role_id, menu_id: e };
    });
    return await ctx.model.RoleMenus.bulkCreate(data);
  }

  /**
   *  单角色批量删除多菜单
   * @param payload
   * @param payload.role_id
   * @param payload.menu_ids
   * @return {Promise<void>}
   */
  async bulkDeleteMenus ({ role_id, menu_ids }) {
    const { ctx } = this;
    return await ctx.model.RoleMenus.destroy({
      where: {
        role_id,
        menu_id: {
          [Op.in]: menu_ids,
        },
      },
    });
  }
}

module.exports = _objectName_Service;
