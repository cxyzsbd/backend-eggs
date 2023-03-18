'use strict';

const BaseController = require('../base-controller');

/**
* @controller 数据 box-data
*/

class BoxDataController extends BaseController {
  /**
  * @apikey
  * @summary 数据和报警转发
  * @description 本接口支持实时数据(box-data/data)、历史数据(box-data/his-data)、实时报警(box-data/alarm)、历史报警(box-data/his-alarm)、数据下置(box-data/down-data)
  * ,数据服务接收到的数据格式为一个数组对象
  * 无token情况下传签名sign也可以，以下是签名规则，其中秘钥secret，为前后台约定好的字符串
  * 1.先将参数按照`key=value`的形式加入到数组，
  * 2.再将数组按照正序1-9|a-z排序，
  * 3.再用&连接成新的字符串str，
  * 4.最后str拼接秘钥，`str+&secret=sss`的形式再通过md5加密字符串得到签名
  * @router post box-data/:url
  * @request query number user_id "用户id，如果无token方式下必传"
  * @request body boxDataBodyReq
  */
  async dataAndAlarm() {
    // console.time('dataAndAlarm');
    const { ctx, app } = this;
    const forwardUrls = [ 'data', 'his-data', 'alarm', 'his-alarm', 'down-data' ];
    let { method, url, header, body } = ctx.request;
    // console.log('query==============', ctx.query);
    // console.log('body==============', body);
    const { company_id } = ctx.request.header;
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(17, url.indexOf('?')) : url.slice(17);
    if (!forwardUrls.includes(apiUrl)) {
      this.NOT_FOUND({ message: '请检查请求路径是否正确' });
      return false;
    }
    if (header.hasOwnProperty('paramarr') && header.hasOwnProperty('paramtype')) {
      let { paramarr, paramtype } = header;
      paramarr = decodeURIComponent(paramarr).split('&');
      paramtype = Number(paramtype);
      body = { ...body, param_arr: paramarr, param_type: paramtype };
    }
    // console.log('body1===============', body);
    if (!body.param_arr || !body.param_arr.length) {
      this.BAD_REQUEST({ message: 'param_arr不能为空' });
      return false;
    }
    body.param_arr = body.param_arr.map(item => String(item));
    ctx.validate(ctx.rule.boxDataBodyReq, body);
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    let data = [];
    const params = { ...ctx.query, ...body };
    data = await app.utils.tools.solveParams(params.param_type, params.param_arr, company_id);
    data = data.filter(item => item.boxcode && item.tagname);
    if (!data || !data.length) {
      this.BAD_REQUEST({ message: '无效参数' });
      return false;
    }
    // console.timeEnd('dataAndAlarm');
    // 处理参数
    try {
      // console.time('中转数据');
      const res = await ctx.curl(`${requestBaseUrl}box-data/${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
        method: 'POST',
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        data,
      }).catch(err => {
        console.log(err);
        return false;
      });
      // console.log('参数====================', data);
      // console.log('res==================', res.data);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      // console.timeEnd('中转数据');
      this.SUCCESS(res.data.error ? { ...res.data } : res.data);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BoxDataController;
