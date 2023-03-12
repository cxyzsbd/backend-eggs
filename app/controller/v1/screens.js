'use strict';

const BaseController = require('../base-controller');
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');

/**
* @controller 可视化大屏 screens
*/

class screensController extends BaseController {
  /**
  * @apikey
  * @summary 可视化大屏列表
  * @description 获取所有可视化大屏
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get screens
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.screensPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.screens.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 可视化大屏
  * @description 获取某个 可视化大屏
  * @router get screens/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.screensId, ctx.params);
    const res = await service.screens.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 可视化大屏
  * @description 创建 可视化大屏
  * @router post screens
  * @request body screensBodyReq
  */
  async create() {
    const { ctx } = this;
    const rule = {
      ...ctx.rule.screensBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, ctx.request.body);
    const { id } = await ctx.service.screens.create(ctx.request.body);
    this.CREATED({ id });
  }

  /**
  * @apikey
  * @summary 上传可视化大屏文件
  * @description 上传可视化大屏文件
  * @router post screens/:id/files
  */
  async uploadFile() {
    const { ctx, app } = this;
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
    const floder = `/files${pathfix}/screens/${id}`;
    const targetPath = path.join(this.config.baseDir, `..${floder}`);
    // 判断路径是否存在
    await app.utils.tools.dirExists(targetPath);
    const target = path.join(this.config.baseDir, `..${floder}`, filename);
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      this.SUCCESS({ res: `${floder}/${filename}` });
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
  }

  /**
  * @apikey
  * @summary 更新 可视化大屏
  * @description 更新 可视化大屏
  * @router put screens/:id
  * @request path string *id eg:1
  * @request body screensPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.rule.screensBodyReq.name.required = false;
    const rule = {
      ...ctx.rule.screensBodyReq,
      configs: {
        type: 'object',
        required: false,
      },
    };
    ctx.validate(rule, params);
    const res = await service.screens.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 可视化大屏
  * @description 删除 可视化大屏
  * @router delete screens/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.screensId, params);
    const res = await service.screens.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 可视化大屏回收站列表
  * @description 可视化大屏回收站列表
  * @router get recovery-screens
  */
  async recoveryScreensList() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.screensPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.screens.recoveryScreensList(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 强力删除回收站可视化大屏
  * @description 强力删除回收站可视化大屏
  * @router delete recovery-screens/:id
  * @request path string *id eg:1
  */
  async forceDelete() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.screensId, params);
    const res = await service.screens.forceDelete(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 恢复回收站的可视化大屏
  * @description 恢复回收站的可视化大屏
  * @router patch recovery-screens/:id
  * @request path string *id eg:1
  */
  async recoveryScreens() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.screensId, params);
    const res = await service.screens.recoveryScreens(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = screensController;
