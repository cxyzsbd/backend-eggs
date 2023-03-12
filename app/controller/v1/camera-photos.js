'use strict';

const BaseController = require('../base-controller');

/**
* @controller 设备抓拍图片 camera-photos
*/

class CameraPhotosController extends BaseController {
  /**
  * @apikey
  * @summary 设备抓拍图片列表
  * @description 获取所有设备抓拍图片
  * @request query string *deviceSerial "设备序列号"
  * @request query number pageSize
  * @request query number pageNumber
  * @router get camera-photos
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.cameraPhotoBodyReq,
      queryOrigin: ctx.query,
    });
    const validateRes = await ctx.validate(allRule, query);
    if (!validateRes) {
      return false;
    }
    if (!ctx.query.deviceSerial) {
      this.INVALID_REQUEST({ message: '设备序列号不能为空' });
      return false;
    }
    const data = await service.lkysweb.cameraPhotos.findAll(query);
    this.SUCCESS({ data });
  }

  // async create() {
  //   const {ctx, service} = this
  //   const validateRes = await ctx.validate(ctx.rule.cameraPhotoBodyReq, ctx.request.body);
  //   if(!validateRes) {
  //     return false;
  //   }
  //   await service.lkysweb.cameraPhotos.create(ctx.request.body);
  //   this.CREATED_UPDATE();
  // }
}

module.exports = CameraPhotosController;
