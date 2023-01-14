'use strict';

const BaseController = require('../base-controller');

/**
* @controller 流程图数据转发 flow-data-forward
*/

class FlowDataForwardController extends BaseController {
  /**
  * @apikey
  * @summary 接口名称
  * @description 接口描述
  * @router get test
  */
  async test() {
    const { ctx } = this;
    // url参数 ctx.query
    // body参数 ctx.request.body
    // 路由参数 ctx.params
  }
}

module.exports = FlowDataForwardController;
