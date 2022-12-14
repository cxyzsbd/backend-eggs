'use strict';

const BaseController = require('../base-controller');
const {Op} = require('sequelize')

/**
 * @controller 角色 roles
 */

class RoleController extends BaseController {
  /**
   * @apikey
   * @summary 获取role
   * @description 获取role
   * @request query string name role名
   * @request query number pageSize
   * @request query number pageNumber
   * @router get roles
   */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.rolePutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const {department_id} = ctx.request.header
    const departments = await service.departments.getChildrenById(department_id, false)
    const department_ids = departments.map(item=>item.id)
    query.where.department_id = {
      [Op.in]: [...department_ids, 0]
    }
    const res = await service.roles.findAll(query);
    this.SUCCESS(res);
  }

  /**
   * @apikey
   * @summary 获取某个role
   * @description 获取某个role
   * @router get roles/:id
   * @request path number *id eg:1 roleID
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.roleId, ctx.params);
    const res = await service.roles.findOne(ctx.params.id);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 创建role
   * @description 创建role
   * @router post roles
   * @request body roleCreateReq
   */
  async create() {
    const { ctx, service } = this;
    delete ctx.request.body.id;
    ctx.validate(ctx.rule.roleCreateReq, ctx.request.body);
    await service.roles.create(ctx.request.body);
    this.CREATED();
  }

  /**
   * @apikey
   * @summary 更新role
   * @description 更新role
   * @router put roles
   * @request path number *id ex:1 roleID
   * @request body rolePutBodyReq
   */
  async update() {
    const { ctx, service } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(ctx.rule.rolePutBodyReq, params);
    delete params.create_at;
    delete params.update_at;
    const res = await service.roles.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 删除role
   * @description 删除role
   * @router delete roles
   * @request path number *id ex:1 roleID
   */
  async destroy() {
    const { ctx, service } = this;
    const {request_user, department_id} = ctx.request.header
    ctx.validate(ctx.rule.roleId, ctx.params);
    const role = await ctx.model.Roles.findOne({where:{id:ctx.params.id}, raw: true})
    if(role && role.department_id==0 && department_id!=0) {
      this.BAD_REQUEST({message: "无权限删除该角色"})
      return false
    }
    const res = await service.roles.destroy(ctx.params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = RoleController;
