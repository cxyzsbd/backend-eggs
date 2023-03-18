'use strict';

const BaseController = require('../base-controller');
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');

/**
* @controller 流程图 flows
*/

class flowsController extends BaseController {
  /**
  * @apikey
  * @summary 流程图列表
  * @description 获取所有流程图
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get flows
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.flowsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.flows.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 流程图
  * @description 获取某个 流程图
  * @router get flows/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.flowsId, ctx.params);
    const res = await service.flows.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 流程图
  * @description 创建 流程图
  * @router post flows
  * @request body flowsBodyReq
  */
  async create() {
    const { ctx } = this;
    const rule = {
      ...ctx.rule.flowsBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, ctx.request.body);
    const { id } = await ctx.service.flows.create(ctx.request.body);
    this.CREATED({ id });
  }

  /**
  * @apikey
  * @summary 上传流程图文件
  * @description 上传流程图文件
  * @router post flows/:id/files
  * @request query number is_save "是否保存到数据库，1：保存到数据库；不传不保存"
  */
  async uploadFile() {
    const { ctx, app, service } = this;
    const query = ctx.query;
    const { company_id } = ctx.request.header;
    const { id } = ctx.params;
    const size = ctx.request.header['content-length'];
    const stream = await ctx.getFileStream();
    const { fileSize } = app.config.multipart;
    if (size > fileSize) {
      this.INVALID_REQUEST({ message: `文件大小不可超过${fileSize / 1024 / 1024}Mb` });
      return false;
    }
    const filename = `${app.utils.tools.uuidv4()}${path.extname(stream.filename)}`;
    const pathfix = company_id ? `/${company_id}` : '';
    let floder = `/files${pathfix}/flows/${id}`;
    if (query.is_save == 1) {
      floder = `/files${pathfix}/flows/common`;
    }
    const targetPath = path.join(this.config.baseDir, `..${floder}`);
    // 判断路径是否存在
    await app.utils.tools.dirExists(targetPath);
    const target = path.join(this.config.baseDir, `..${floder}`, filename);
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      if (query.is_save == 1) {
        await service.visualImages.create({
          type: 2,
          url: `${floder}/${filename}`,
          company_id,
        });
      }
      this.SUCCESS({ res: `${floder}/${filename}` });
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
  }

  /**
  * @apikey
  * @summary 更新 流程图
  * @description 更新 流程图
  * @router put flows/:id
  * @request path string *id eg:1
  * @request body flowsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.rule.flowsBodyReq.name.required = false;
    const rule = {
      ...ctx.rule.flowsBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, params);
    const res = await service.flows.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 流程图
  * @description 删除 流程图
  * @router delete flows/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 流程图回收站列表
  * @description 流程图回收站列表
  * @router get recovery-flows
  */
  async recoveryFlowsList() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.flowsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.flows.recoveryFlowsList(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 强力删除回收站流程图
  * @description 强力删除回收站流程图
  * @router delete recovery-flows/:id
  * @request path string *id eg:1
  */
  async forceDelete() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.forceDelete(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 恢复回收站的流程图
  * @description 恢复回收站的流程图
  * @router patch recovery-flows/:id
  * @request path string *id eg:1
  */
  async recoveryFlows() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.flowsId, params);
    const res = await service.flows.recoveryFlows(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = flowsController;
