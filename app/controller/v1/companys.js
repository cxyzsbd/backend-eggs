'use strict';

const BaseController = require('../base-controller');

/**
* @controller 超管管理公司 super-user/companys
*/

class CompanysController extends BaseController {
  /**
  * @apikey
  * @summary 公司列表
  * @description 获取所有公司
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get super-user/companys
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.companysPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.companys.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 公司
  * @description 获取某个 公司
  * @router get super-user/companys/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.companysId, ctx.params);
    const res = await service.companys.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 公司
  * @description 创建 公司
  * @router post super-user/companys
  * @request body companysBodyReq
  */
  async create() {
    const { ctx, app } = this;
    ctx.validate(ctx.rule.companysBodyReq, ctx.request.body);
    await ctx.service.companys.create(ctx.request.body);
    app.utils.tools.redisCachePublic('companys', 0, 'companys', 'Companys');
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 公司
  * @description 更新 公司
  * @router put super-user/companys/:id
  * @request path number *id eg:1
  * @request body companysPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.companysPutBodyReq, params);
    const res = await service.companys.update(params);
    app.utils.tools.redisCachePublic('companys', 0, 'companys', 'Companys');
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
    * @summary 创建 管理员
    * @description 创建 管理员
    * @router post super-user/add-admin
    * @request body userCreateBodyReq
    */
  async addAdmin() {
    const { ctx, app } = this;
    let params = ctx.request.body;
    const rule = {
      ...ctx.rule.userCreateBodyReq,
      company_id: {
        type: 'number',
        required: true,
      },
    };
    ctx.validate(rule, params);
    const res = await ctx.service.users.create(params);
    if (res && res.message) {
      this.BAD_REQUEST(res);
      return false;
    }
    if (res.id) {
      await ctx.service.companys.update({ id: params.company_id, admin: res.id });
    }
    app.utils.tools.redisCachePublic('companys', 0, 'companys', 'Companys');
    this.CREATED();
  }
}

module.exports = CompanysController;
