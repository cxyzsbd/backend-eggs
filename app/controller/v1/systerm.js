'use strict';

const BaseController = require('../base-controller');
const svgCaptcha = require('svg-captcha');

/**
* @controller 系统 systerm
*/

class SystermController extends BaseController {
  /**
  * @apikey
  * @summary 获取验证码
  * @description 获取验证码
  * @request query *prod 类型(vsv:可视化分享验证;lv:登录验证)
  * @request query t 目标id，非必传
  * @router get captcha
  */
  async getcaptcha() {
    const { ctx, app } = this;
    const commonRedis = app.redis.clients.get('common');
    const params = ctx.query;
    const rule = {
      prod: {
        type: 'enum',
        required: true,
        values: [ 'vsv', 'lv' ],
      },
      t: {
        type: 'string',
        required: false,
      },
    };
    const options = {
      width: 120,
      height: 40,
      fontSize: 38,
      color: true,
      noise: 2,
      background: '#CCC',
    };
    ctx.validate(rule, params);
    const { prod, t } = params;
    if (prod === 'vsv' && !t) {
      this.BAD_REQUEST({ message: 't不能为空' });
      return false;
    }
    const captcha = svgCaptcha.create(options);
    const { ip, header: { authorization } } = ctx.request;
    let user = {};
    if (authorization) {
      try {
        user = await app.utils.tools.decodeTokenInfo(authorization, 'access_token');
      } catch (error) {
        ctx.logger.error(error);
      }
    }
    let prefix = user.id || ip;
    if (t) {
      prefix = `${prefix}_${t}`;
    }
    let key = `captcha_${prod}_${prefix}`;
    await commonRedis.set(key, captcha.text);
    await commonRedis.expire(key, 10 * 60);
    this.SUCCESS(captcha.data);
  }
}

module.exports = SystermController;
