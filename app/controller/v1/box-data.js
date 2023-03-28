'use strict';

const BaseController = require('../base-controller');

/**
* @controller 数据和报警 box-data
*/

class BoxDataController extends BaseController {
  /**
  * @apikey
  * @summary 实时数据
  * @description 实时数据
  * @router post box-data/data
  * @request body boxDataBodyReq
  */
  /**
  * @apikey
  * @summary 历史数据
  * @description 历史数据
  * @router post box-data/his-data
  * @request body boxDataBodyReq
  */
  /**
  * @apikey
  * @summary 原始历史数据
  * @description 原始历史数据
  * @router post box-data/original-his-data
  * @request body boxDataBodyReq
  */
  /**
  * @apikey
  * @summary 实时报警
  * @description 实时报警
  * @router post box-data/alarm
  * @request body boxDataBodyReq
  */
  /**
  * @apikey
  * @summary 历史报警
  * @description 历史报警
  * @router post box-data/his-alarm
  * @request body boxDataBodyReq
  */
  /**
  * @apikey
  * @summary 数据下置
  * @description 数据下置
  * @router post box-data/down-data
  * @request body boxDataBodyReq
  */

  /**
  * @apikey
  * @summary 数据和报警转发
  * @description 本接口支持实时数据(box-data/data)、历史数据(box-data/his-data)、实时报警(box-data/alarm)、历史报警(box-data/his-alarm)、数据下置(box-data/down-data)、原始历史(box-data/original-his-data)、报警确认(box-data/alarm-ack)
  * ,数据服务接收到的数据格式为一个数组对象
  * 无token情况下传签名sign也可以，以下是签名规则，其中秘钥secret，为前后台约定好的字符串
  * 1.先将参数按照`key=value`的形式加入到数组，
  * 2.再将数组按照正序1-9|a-z排序，
  * 3.再用&连接成新的字符串str，
  * 4.最后str拼接秘钥，`str+&secret=sss`的形式再通过md5加密字符串得到签名
  * 5.down-data和original-his-data(原始历史)两个接口，param_arr参数格式为'[{"id": 1,"value": 100},{"id": 2,"value": 101 }],或者type=2时,[{"long_attr": "焦化厂/柴油发电机组/温度","value": 100},{"long_attr": "焦化厂/柴油发电机组/湿度","value": 101 }]'
  * 6.alarm-ack接口，param_arr参数格式为'[{"id": 1,"op": "报警确认备注"},{"id": 2,"op": "报警确认操作备注" }],或者type=2时,[{"long_attr": "焦化厂/柴油发电机组/温度","op": "报警确认操作备注"},{"long_attr": "焦化厂/柴油发电机组/湿度","op": "报警确认备注" }]'
  * @router post box-data/:url
  * @request query number user_id "用户id，如果无token方式下必传"
  * @request body boxDataBodyReq
  */
  async dataAndAlarm() {
    // console.time('dataAndAlarm');
    const { ctx, app } = this;
    const downloadDataBodyReq = {
      param_type: {
        type: 'number',
        required: true,
        enum: [ 1, 2 ],
        description: '点属性参数类型，1：id;2:长属性名',
      },
      param_arr: {
        type: 'array',
        required: true,
        description: '',
        example: '[{"id": 1,"value": 100},{"id": 2,"value": 101 }],或者type=2时,[{"long_attr": "焦化厂/柴油发电机组/温度","value": 100},{"long_attr": "焦化厂/柴油发电机组/湿度","value": 101 }]',
      },
    };
    const forwardUrls = [ 'data', 'his-data', 'alarm', 'his-alarm', 'down-data', 'original-his-data' ];
    let { method, url, header, body } = ctx.request;
    console.log('query==============', ctx.query);
    console.log('body==============', body);
    const { company_id, request_user } = ctx.request.header;
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(17, url.indexOf('?')) : url.slice(17);
    console.log('apiUrl==================', apiUrl);
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
    body.param_arr = body.param_arr.map(item => (typeof item === 'object' ? item : String(item)));
    if ([ 'data', 'his-data', 'alarm', 'his-alarm' ].includes(apiUrl)) {
      ctx.validate(ctx.rule.boxDataBodyReq, body);
    } else {
      ctx.validate(downloadDataBodyReq, body);
    }
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    let dataO = [],
      data = [];
    const params = { ...ctx.query, ...body };
    // console.log('params==========================', params);
    if ([ 'data', 'his-data', 'alarm', 'his-alarm' ].includes(apiUrl)) {
      dataO = await app.utils.tools.solveParams(params.param_type, params.param_arr, company_id);
    } else {
      dataO = await app.utils.tools.solveDownloadDataParams(params.param_type, params.param_arr, company_id);
    }
    console.log('data', JSON.stringify(dataO));
    data = dataO.filter(item => item.boxcode && item.tagname);
    if (![ 'data', 'down-data' ].includes(apiUrl) && (!data || !data.length)) {
      this.BAD_REQUEST({ message: '无效参数' });
      return false;
    }
    // if (apiUrl === 'alarm-ack') {
    //   const userInfo = await ctx.app.utils.tools.getRedisCacheUserinfo(request_user);
    //   data = data.map(item => {
    //     item.username = userInfo.username;
    //     return item;
    //   });
    // }
    let noTagAttrs = dataO.filter(item => !item.boxcode || !item.tagname);
    console.log('noTagAttrs', noTagAttrs);
    // console.timeEnd('dataAndAlarm');
    console.log('参数====================', data);
    // 处理参数
    try {
      let resData = [];
      if (apiUrl === 'data') {
        // 实时数据，如果没有点位，则从内存拿数据,若没有数据则
        const attr_values = await ctx.service.cache.get('attr_values', 'attrs') || {};
        noTagAttrs = noTagAttrs.map(item => {
          item.value = attr_values[item.id] || null;
          return item;
        });
        resData = [ ...resData, ...noTagAttrs ];
        // console.log(1111111111111, resData);
      }
      // console.log(22222222222222222222222, resData);
      if (apiUrl === 'down-data') {
        // 下置数据,如果没有绑定点位，则直接将值写到内存中
        let attr_values = await ctx.service.cache.get('attr_values', 'attrs') || {};
        noTagAttrs.forEach(item => {
          attr_values[item.id] = item.value;
        });
        await ctx.service.cache.set('attr_values', attr_values, 0, 'attrs');
      }
      // 如果data为空数组，直接返回
      if ((!data || !data.length) && (noTagAttrs && noTagAttrs.length)) {
        apiUrl === 'down-data' ? this.SUCCESS() : this.SUCCESS(resData);
        return false;
      }
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
      console.log(`${requestBaseUrl}box-data/${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`);
      console.log('res==================', res.data);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      if (res && res.data) {
        // console.log(11111111);
        if (apiUrl === 'data') {
          // console.log(222222222);
          if (res.data.length) {
            // console.log(333333333);
            resData = [ ...resData, ...res.data ];
          }
        } else {
          // console.log(444444444);
          resData = res.data;
        }
      }
      // console.timeEnd('中转数据');
      console.log('resData111111111', resData);
      [ 'down-data' ].includes(apiUrl) ? this.SUCCESS() : this.SUCCESS(resData);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BoxDataController;
