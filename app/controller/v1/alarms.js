'use strict';

const BaseController = require('../base-controller');

/**
* @controller 报警 alarms
*/

class alarmsController extends BaseController {

  /**
  * @apikey
  * @summary 创建 对象
  * @description 创建 对象
  * @router post alarms
  */
  async create() {
    const { ctx, app } = this;
    const params = { ...ctx.query, ...ctx.request.body };
    let newParams = app.utils.tools.lodash.cloneDeep(params);
    delete newParams.sign;
    const sign = await app.utils.tools.getSign(newParams);
    if (sign !== params.sign) {
      this.BAD_REQUEST({ message: '签名错误' });
      return false;
    }
    console.log(params);
    this.SUCCESS();
  }
}

module.exports = alarmsController;
