'use strict';

const BaseController = require('../base-controller');

/**
*@controller 部门 departments
*/

class DepartmentsController extends BaseController {
  /**
  * @apikey
  * @summary 部门列表
  * @description 获取所有部门
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get departments
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.departmentsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    // 查询当前用户的部门id
    const { department_id } = ctx.request.header;
    const departmentAll = await service.departments.getChildrenById(department_id, false);
    const ids = departmentAll.map(item => item.id);
    const res = await service.departments.findAll(query, ids);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 部门
  * @description 获取某个 部门
  * @router get departments/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.departmentId, ctx.params);
    const res = await service.departments.findOne({ id: ctx.params.id });
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 部门
  * @description 创建 部门
  * @router post departments
  * @request body departmentsBodyReq
  */
  async create() {
    const { ctx, app } = this;
    ctx.validate(ctx.rule.departmentsBodyReq, ctx.request.body);
    const { request_user } = ctx.request.header;
    await ctx.service.departments.create({ ...ctx.request.body, creator: request_user });
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 部门
  * @description 更新 部门
  * @router put departments/:id
  * @request path number *id eg:1
  * @request body departmentsPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    const params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.departmentsPutBodyReq, params);
    delete params.create_at;
    delete params.update_at;
    const res = await service.departments.update(params);
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 部门
  * @description 删除 部门
  * @router delete departments/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service, app } = this;
    ctx.validate(ctx.rule.departmentId, ctx.params);
    // 判断是否有子部门
    const childrenDepartments = await ctx.model.Departments.count({
      where: {
        parent_id: ctx.params.id,
      },
    });
    if (childrenDepartments > 0) {
      this.BAD_REQUEST({ message: '请先删除子级部门' });
      return false;
    }
    const res = await service.departments.destroy(ctx.params);
    await app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    if (res) {
      const department_users = await ctx.model.Users.findAll({
        where: {
          department_id: ctx.params.id,
        },
        attributes: [ 'id' ],
        raw: true,
      });
      department_users.forEach(async id => {
        await app.utils.tools.redisCacheUserinfo(id);
      });
    }
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = DepartmentsController;
