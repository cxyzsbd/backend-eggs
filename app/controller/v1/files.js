'use strict';

const BaseController = require('../base-controller');
const fs = require('fs');
const path = require('path');
// 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
// 管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');

/**
 * @controller 文件 files
 */

class FilesController extends BaseController {
  /**
   * @apikey
   * @summary 上传文件
   * @description 上传文件
   * @router post files
   */
  async upload () {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const size = ctx.request.header['content-length'];
    const stream = await ctx.getFileStream();
    const { fileSize } = app.config.multipart;
    if (size > fileSize) {
      this.INVALID_REQUEST({
        message: `文件大小不可超过${fileSize / 1024 / 1024}Mb`,
      });
      return false;
    }
    const filename = `${app.utils.tools.uuidv4()}${path.extname(
      stream.filename
    )}`;
    const pathfix = company_id ? `/${company_id}` : '';
    const targetPath = path.join(
      this.config.baseDir,
      `../files${pathfix}/others`
    );
    // 判断路径是否存在
    await app.utils.tools.dirExists(targetPath);
    const target = path.join(
      this.config.baseDir,
      `../files${pathfix}/others`,
      filename
    );
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      this.SUCCESS({ res: `/files${pathfix}/others/${filename}` });
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
  }
  /**
   * @apikey
   * @summary 上传图片
   * @description 上传图片
   * @router post upload-images
   */
  async uploadImages () {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const size = ctx.request.header['content-length'];
    const stream = await ctx.getFileStream();
    const { fileSize } = app.config.multipart;
    if (size > fileSize) {
      this.INVALID_REQUEST({
        message: `文件大小不可超过${fileSize / 1024 / 1024}Mb`,
      });
      return false;
    }
    if (![ '.jpg', '.jpeg', '.png' ].includes(path.extname(stream.filename))) {
      this.INVALID_REQUEST({
        message: '图片必须是jpg/png/jpeg格式',
      });
      return false;
    }
    const filename = `${app.utils.tools.uuidv4()}${path.extname(
      stream.filename
    )}`;
    const pathfix = company_id ? `/${company_id}` : '';
    const targetPath = path.join(
      this.config.baseDir,
      `../files${pathfix}/others`
    );
    // 判断路径是否存在
    await app.utils.tools.dirExists(targetPath);
    const target = path.join(
      this.config.baseDir,
      `../files${pathfix}/others`,
      filename
    );
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      this.SUCCESS({ res: `/files${pathfix}/others/${filename}` });
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }
  }
}

module.exports = FilesController;
