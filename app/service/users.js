'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class UserService extends Service {
  /**
   * 创建
   * @param {*} payload
   * @return
   */
  async create(payload) {
    const { ctx, app } = this;
    const username_check = await ctx.model.Users.findOne({where: {
      username: payload.username
    }})
    if(username_check) {
      return {message: "用户名已存在"}
    }
    const transaction = await ctx.model.transaction();
    try {
      const res_user = await ctx.model.Users.create(payload, { transaction });
      const roles = await ctx.model.Roles.findAll({ where: { id: {
        [Op.in]: payload.roles
      } } });
      let userRoles = []
      roles.forEach(role=> {
        userRoles.push({
          user_id: res_user.id,
          role_id: role.id,
        })
      })
      // 分配 默认角色
      await ctx.model.UserRoles.bulkCreate(userRoles, {transaction});
      await transaction.commit();
      return res_user;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
  async findOne({ id = null, username = '' }, exclude = [ 'password', 'delete_at' ], include = true) {
    const { ctx } = this;
    const where = {};
    if (id) {
      where.id = id;
    }
    if (username && username.length) {
      where.username = username;
    }
    return await ctx.model.Users.findOne({
      where,
      include: include && [
        {
          model: ctx.model.Roles,
        },
        {
          as: 'department',
          model: ctx.model.Departments,
        },
      ],
      attributes: { exclude },
    });
  }
  async findAll(payload, departments=[]) {
    const { ctx, app } = this;
    // await ctx.helper.sendSocketToClientOfRoom({a:12312313123},4)
    const { pageSize, pageNumber, prop_order, order, state, username, email, phone, department_id, keyword, date_after_created } = payload;
    const where = {};
    if(departments.length) {
      const ids = departments.map(item => item.id)
      where.department_id = {
        [Op.in]: ids
      }
    }
    keyword
      ? (where[Op.or] = [{ username: { [Op.like]: `%${keyword}%` } }, { email: { [Op.like]: `%${keyword}%` } }, { phone: { [Op.like]: `%${keyword}%` } }])
      : null;
    // 创建时间大于等于date_after_created
    date_after_created ? (where[Op.and] = [{ created_at: { [Op.gte]: date_after_created } }]) : null;
    const Order = [];
    username ? (where.username = { [Op.like]: `%${username}%` }) : null;
    !ctx.helper.tools.isParam(state) ? (where.state = state) : null;
    email ? (where.email = { [Op.like]: `%${email}%` }) : null;
    phone ? (where.phone = { [Op.like]: `%${phone}%` }) : null;
    !ctx.helper.tools.isParam(department_id) ? (where.department_id = department_id === 0 ? null : department_id) : null;
    if (department_id === -1) {
      where.department_id = null;
    }
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    // 不返回id为1的超级管理员用户
    if (where[Op.and]) {
      where[Op.and].push({ id: { [Op.ne]: 1 } });
    } else {
      where[Op.and] = [{ id: { [Op.ne]: 1 } }];
    }
    const res = await ctx.model.Users.findAndCountAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      include: [
        {
          model: ctx.model.Roles,
        },
      ],
      order: Order,
      attributes: { exclude: [ 'password', 'delete_at' ] },
      distinct: true,
    });
    return {
      data: res.rows,
      pageNumber,
      pageSize,
      total: res.count,
    };
  }
  async update(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      const res_user = await ctx.model.Users.update(payload, { 
        where: {
          id: payload.id
        },
        transaction
      });
      let rolesRes = null;
      if(payload.roles) {
        const roles = await ctx.model.Roles.findAll({ where: { id: {
          [Op.in]: payload.roles
        } } });
        let userRoles = []
        roles.forEach(role=> {
          userRoles.push({
            user_id: payload.id,
            role_id: role.id,
          })
        })
        // 先删除角色
        await ctx.model.UserRoles.destroy({
          where: {
            user_id: payload.id
          },
          transaction
        });
        // 分配 默认角色
        rolesRes = await ctx.model.UserRoles.bulkCreate(userRoles, {transaction, returning: true});
      }
      await transaction.commit();
      return {
        res_user, 
        rolesRes
      };
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async destroy(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      const res_user = await ctx.model.Users.destroy({
        where: {
          id: payload.id
        },
        transaction
      });
      let rolesRes =await ctx.model.UserRoles.destroy({
        where: {
          user_id: payload.id
        },
        transaction
      });
      await transaction.commit();
      return res_user && rolesRes;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  /**
   * 用户信息
   * @return
   */
  async userInfo() {
    const { ctx, app } = this;
    const { request_user } = ctx.request.header;
    const res = await ctx.model.Users.findOne({
      include: [
        {
          model: ctx.model.Roles,
          include: [
            {
              model: ctx.model.Permissions,
              attributes: [ 'id', 'url', 'action' ],
            },
          ],
        },
        {
          model: ctx.model.Departments,
          as: "department"
        }
      ],
      where: { id: Number(request_user) },
      attributes: { exclude: [ 'password', 'deleted_at' ] },
    });
    let arr = [];
    res.roles.forEach(e => {
      e.permissions.forEach(ee => {
        arr.push(ee);
      });
    });
    arr = app.utils.tools.lodash.uniqWith(arr, (a, b) => a.id === b.id);
    arr = arr.map(permission => `${permission.action}:${permission.url}`);
    res.dataValues.permissions = arr || [];
    return res;
  }

  async userMenus() {
    const { ctx, app } = this;
    let data = await ctx.model.Users.findAll({
      include: [
        {
          model: ctx.model.Roles,
          // attributes: {
          //   exclude: [ 'user_roles', 'updated_at' ],
          // },
          include: [
            {
              model: ctx.model.Menus,
              attributes: {
                exclude: [ 'created_at', 'updated_at' ],
              },
            },
          ],
        },
      ],
      where: {
        id: ctx.request.header.request_user,
      },
      raw: false,
    });
    // 如果没有则直接返回空数组
    if (data.length === 0) {
      return [];
    }
    data = data[0].roles;
    // 去重
    const arr = [];
    data.forEach((e, i) => {
      e.menus.forEach((ee, ii) => {
        ee.__roles = {
          id: e.id,
          name: e.name,
        };
        arr.push(ee);
      });
    });
    data = app.utils.tools.lodash.uniqWith(arr, (a, b) => a.id === b.id);
    data = data.sort((a, b) => b.sort - a.sort);
    return data;
  }

  async getUserPermissions(id) {
    const {ctx, app} = this
    const {request_user} = ctx.request.header
    // 获取所有资源列表和角色资源绑定关系
    const { role_permissions } = await app.utils.tools.getRedisCachePublic('permissions');
    // 获取用户所有权限
    const userInfo = await app.utils.tools.getRedisCacheUserinfo(request_user);
    let roles = userInfo.roles || [];
    roles = roles.map(item => item.id);
    let permissions = [];
    // 根据roles去拿权限列表
    role_permissions.map(item => {
      if (roles.includes(item.id)) {
        permissions = [ ...permissions, ...item.permissions ];
      }
    });
    return permissions;
  }
}
module.exports = UserService;
