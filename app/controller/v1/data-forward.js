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
  async apiForward() {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    const apiUrl = url.slice(21, url.indexOf('?'));
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
}

module.exports = DataForwardController;
