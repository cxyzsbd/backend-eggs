'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class _objectName_Service extends Service {
  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Departments.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
    const { company_id, request_user } = ctx.request.header;
    payload.creator = request_user;
    payload.company_id = company_id;
    return await ctx.model.Departments.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Departments.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    // 事务
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.Departments.destroy({ where: { id: payload.id }, transaction });
      await ctx.model.Users.update({
        department_id: null,
      }, {
        where: {
          department_id: payload.id,
        },
        transaction,
      });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
      return false;
    }
  }
  // 获取用户可以管理的所有部门
  async getUserDepartments() {
    const { ctx, app } = this;
    const { request_user, department_id, company_id } = ctx.request.header;
    if (!company_id) {
      // 超管
      return [];
    }
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    if (!department_id) {
      // 管理员
      return departments.filter(item => item.company_id === company_id);
    }
    // 普通用户
    // 获取当前用户的部门信息
    const departmentInfo = (departments.filter(d => d.id === department_id))[0] || null;
    if (!departmentInfo) {
      // 部门信息不存在，也返回空
      return [];
    }
    // 其他情况递归获取子级所有部门
    let departmentChildren = await this.recursionDepartments([ departmentInfo ]);
    return [ departmentInfo, ...departmentChildren ];
  }

  // 根据id获取部门信息
  async getInfoById(department_id) {
    const { ctx, app } = this;
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    let departmentInfo = (departments.filter(d => d.id === department_id))[0] || null;
    return departmentInfo;
  }

  // 递归获取子部门
  async recursionDepartments(departmentArr = []) {
    const { ctx, app } = this;
    let arr = [];
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    departmentArr.forEach(d => {
      let children = departments.filter(item => item.parent_id === d.id);
      arr = [ ...arr, ...children ];
    });
    if (arr.length) {
      let arrChildren = await this.recursionDepartments(arr);
      arr = [ ...arr, ...arrChildren ];
    }
    return arr;
  }
}

module.exports = _objectName_Service;
