'use strict';

const BaseController = require('../base-controller');

/**
* @controller 数据转发接口 data-forward
*/

class DataForwardController extends BaseController {
  /**
  * @apikey
  * @summary 转发cpp接口
  * @description 转发cpp接口
  * @router get data-forward/:url
  * @request path string *url eg:getboxlist
  */
  async dataForward() {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    if (params.code) {
      // 判断是否有盒子权限
    }
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    const apiUrl = url.slice(21, url.indexOf('?'));
    const params = { ...ctx.query, ...body };
    try {
      const res = await ctx.curl(`${requestBaseUrl}${apiUrl}${url.slice(url.indexOf('?'))}`, {
        method,
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
      // console.log('res==================', res);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      this.SUCCESS(res.data.error ? { ...res.data } : res.data);
    } catch (error) {
      throw error;
    }
  }

  /**
  * @apikey
  * @summary 无token转发
  * @description 无token转发
  * @router get api-forward/:url
  * @request path string *url eg:getboxlist
  */
  async apiForward() {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    let params = { ...ctx.query, ...body };
    console.log('params', params);
    const apiUrl = url.slice(20, url.indexOf('?'));
    console.log('apiUrl', apiUrl);
    let newParams = app.utils.tools.lodash.cloneDeep(params);
    delete newParams.sign;
    const sign = await this.getSign(newParams, app.config.signSecret);
    if (sign !== params.sign) {
      this.BAD_REQUEST({ message: '签名错误' });
      return false;
    }
    try {
      const res = await ctx.curl(`${requestBaseUrl}${apiUrl}${url.slice(url.indexOf('?'))}`, {
        method,
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        data,
      }).catch(err => {
        return false;
      });
      // console.log('res==================',res);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      this.SUCCESS(res.data.error ? { ...res.data } : res.data);
    } catch (error) {
      throw error;
    }
  }

  async getSign(params, secret) {
    if (typeof params === 'string') {
      return this.paramsStrSort(params, secret);
    } else if (typeof params === 'object') {
      let arr = [];
      for (let i in params) {
        arr.push((i + '=' + params[i]));
      }
      return this.paramsStrSort(arr.join(('&')), secret);
    }
  }

  async paramsStrSort(paramsStr, secret) {
    const { app } = this;
    let urlStr = paramsStr.split('&').sort().join('&');
    let newUrl = `${urlStr}&secret=${secret}`;
    return app.utils.tools.md5(newUrl);
  }
}

module.exports = DataForwardController;
