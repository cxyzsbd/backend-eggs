'use strict';

const BaseController = require('../base-controller');

/**
* @controller 公告 announcements
*/

class AnnouncementsController extends BaseController {
  /**
  * @apikey
  * @summary 管理公告列表
  * @description 获取管理所有公告
  * @request query number pageSize
  * @request query number pageNumber
  * @router get announcements
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.announcementsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.announcements.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 公告
  * @description 获取某个 公告
  * @router get announcements/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.announcementsId, ctx.params);
    const res = await service.announcements.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 公告
  * @description 创建 公告
  * @router post announcements
  * @request body announcementsBodyReq
  */
  async create() {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.announcementsBodyReq, params);
    const res = await ctx.service.announcements.create(params);
    if (res && params.status && Number(params.status) === 2) {
      app.utils.tools.socketPush(company_id, 'company', 'announcement', res);
    }
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 公告
  * @description 更新 公告
  * @router put announcements/:id
  * @request path number *id eg:1
  * @request body announcementsPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    const { company_id } = ctx.request.header;
    let rule = ctx.rule.announcementsPutBodyReq;
    rule.status = {
      type: 'number',
      enum: [ 1, 2 ],
      required: false,
    };
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(rule, params);
    const data = await service.announcements.findOne({ id: params.id });
    if (!data) {
      this.BAD_REQUEST({ message: '公告不存在' });
      return false;
    }
    const res = await service.announcements.update(params);
    if (res && res[0] !== 0 && data.status !== 2 && params.status === 2) {
      const dataNow = await service.announcements.findOne({ id: params.id });
      app.utils.tools.socketPush(company_id, 'company', 'announcement', dataNow);
    }
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 公告
  * @description 删除 公告
  * @router delete announcements/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.announcementsId, params);
    const res = await service.announcements.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 查看公告列表
  * @description 获取能查看的所有公告
  * @request query number pageSize
  * @request query number pageNumber
  * @router get view-announcements
  */
  async viewList() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.announcementsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.announcements.viewList(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 发布公告
  * @description 发布公告
  * @router put announcements/:id/publish
  */
  async publish() {
    const { ctx, service, app } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    const { company_id } = ctx.request.header;
    ctx.validate(ctx.rule.announcementsId, params);
    const data = await service.announcements.findOne({ id: params.id });
    if (!data) {
      this.BAD_REQUEST({ message: '公告不存在' });
      return false;
    }
    if (data.status === 2) {
      this.BAD_REQUEST({ message: '该公告已经发布，不能再次发布' });
      return false;
    }
    const res = await service.announcements.update({ id: params.id, status: 2 });
    if (res && res[0] !== 0) {
      app.utils.tools.socketPush(company_id, 'company', 'announcement', data);
    }
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
  /**
  * @apikey
  * @summary 撤回公告
  * @description 撤回公告
  * @router put announcements/:id/recall
  */
  async recall() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.announcementsId, params);
    const res = await service.announcements.update({ id: params.id, status: 3 });
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
  /**
  * @apikey
  * @summary 标记已读公告
  * @description 标记已读公告
  * @router post announcements/mark-read
  * @request body announcementMarkReadBodyReq
  */
  async markRead() {
    const { ctx, service } = this;
    let params = ctx.reuqest.body;
    ctx.validate(ctx.rule.announcementMarkReadBodyReq, params);
    await service.announcements.markRead(params);
    this.SUCCESS();
  }
}

module.exports = AnnouncementsController;
