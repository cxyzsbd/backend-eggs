'use strict';

const BaseController = require('../base-controller');

/**
* @--controller sms sms
*/

class SMSController extends BaseController {
  /**
  * @apikey
  * @summary 发送验证码
  * @description 发送验证码
  * @router post sms
  * @request body smsBodyReq
  */
  async send () {
    const { ctx, app } = this;
    const { portmapping_smscode_verify } = app.config;
    if (!portmapping_smscode_verify) {
      this.BAD_REQUEST({ message: '功能未开启' });
      return false;
    }
    const defaultRedis = ctx.app.redis.clients.get('default');
    const params = ctx.request.body;
    const { company_id, request_user } = ctx.request.header;
    const redisKey = `USER_SMS_${request_user}`;
    ctx.validate(ctx.rule.smsBodyReq, params);
    const { others2, others1, other_number1 } = params;
    const other_number2 = await app.utils.sms.generateCode();
    const redisData = await defaultRedis.get(redisKey);
    if (redisData) {
      this.BAD_REQUEST({ message: '请不要频繁发送' });
      return false;
    }
    const data = await ctx.model.SmsConfigs.findOne({
      where: {
        company_id,
      },
      raw: true,
    });
    if (!data || !data.mobile) {
      this.BAD_REQUEST({ message: '请先配置手机号' });
      return false;
    }
    const { data: sendRes } = await app.utils.sms.send({ mobile: data.mobile, others2, others1, other_number1, other_number2 });
    console.log('sendRes=============', sendRes);
    if (sendRes && sendRes.code === 200) {
      // 更新缓存
      defaultRedis.set(redisKey, other_number2);
      defaultRedis.expire(redisKey, 5 * 60);
    }
    this.SUCCESS();
  }
}

module.exports = SMSController;
