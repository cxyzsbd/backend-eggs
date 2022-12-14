'use strict';

const Service = require('egg').Service;
const {Op} = require('sequelize')

class _objectName_Service extends Service {
  async findAll(payload, ids = []) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    if(ids.length) {
      where.id = {
        [Op.in]: ids
      }
    }
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const res = await ctx.model.Departments.findAndCountAll({
      // limit: pageSize,
      // offset: (pageSize* (pageNumber - 1))>0?(pageSize* (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return res.rows;
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Departments.findOne({ where: payload });
  }

  async create(payload) {
    const { ctx } = this;
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
        department_id: null
      },{
        where: {
          department_id: payload.id
        },
        transaction
      })
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
      return false;
    }
  }

  //根据部门id获取子部门
  async getChildrenById(department_id, returnCodes = true) {
    const {ctx,app} = this
    const departments = await app.utils.tools.getRedisCachePublic('departments')
    if(department_id==0) {
      // 超管
      if(returnCodes) {
        return departments.map(item => item.boxcode)
      }
      return departments
    }
    let departmentInfo = (departments.filter(d=>d.id===department_id))[0] || null
    let boxcodes = []
    //获取部门所有子部门
    let departmentChildren = await this.recursionDepartments([departmentInfo])
    const departmentAll = [departmentInfo, ...departmentChildren]
    if(returnCodes) {
      boxcodes = departmentAll.map(item => item.boxcode)
      return boxcodes
    }
    return departmentAll
  }

  //根据id获取部门信息
  async getInfoById(department_id) {
    const {ctx,app} = this
    if(department_id==0) {
      return {
        id: 0,
        parent_id: 0,
        name: "超管顶级目录",
        type: 0
      }
    }
    const departments = await app.utils.tools.getRedisCachePublic('departments')
    let departmentInfo = (departments.filter(d=>d.id===department_id))[0] || null
    return departmentInfo
  }

  //递归获取子部门
  async recursionDepartments(departmentArr = []) {
    const { ctx, app } = this;
    let arr = [];
    const departments = await app.utils.tools.getRedisCachePublic('departments')
    if(departmentArr.length==1 && departmentArr[0].id==0) {
      // 超管
      return departments;
    }
    departmentArr.forEach(d => {
      let children = departments.filter(item => item.parent_id === d.id)
      arr = [...arr, ...children]
    })
    if(arr.length) {
      let arrChildren = await this.recursionDepartments(arr)
      arr = [...arr, ...arrChildren]
    }
    return arr
  }

  // 根据部门id获取顶级部门信息
  async recursionFatherDepartment(id) {
    const { app } = this
    if(id==0) {
      // 超管
      return {
        id: 0,
        parent_id: 0,
        name: "超管顶级目录"
      }
    }
    const departments = await app.utils.tools.getRedisCachePublic('departments');
    const department = (departments.filter(item=>item.id==id))[0]
    let father = null
    if(department.parent_id) {
      father = (departments.filter(item=>item.id===department.parent_id))[0]
    }
    if(father && father.parent_id) {
      father = this.recursionFatherDepartment(father.id)
    }
    return father
  }
}

module.exports = _objectName_Service;
