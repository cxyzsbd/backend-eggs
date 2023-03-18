'use strict';

const BaseController = require('../base-controller');

/**
* @controller 可视化图片 visual-images
*/

class visualImagesController extends BaseController {
  /**
  * @apikey
  * @summary 可视化图片列表
  * @description 获取所有可视化图片
  * @request query number pageSize
  * @request query number pageNumber
  * @router get visual-images
  * @request query string *type "图片类型：1：大屏；2：流程图"
  */
  async findAll() {
    const { ctx, service } = this;
    const rule = {
      type: {
        type: 'string',
        required: true,
        eumn: [ '1', '2' ],
        description: '图片类型：1：大屏；2：流程图',
      },
    };
    ctx.validate(rule, ctx.query);
    const res = await service.visualImages.findAll(ctx.query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 删除 可视化图片
  * @description 删除 可视化图片
  * @router delete visual-images/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    const rule = {
      id: {
        type: 'number',
        required: true,
        description: 'id',
      },
    };
    ctx.validate(rule, params);
    const res = await service.visualImages.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = visualImagesController;
