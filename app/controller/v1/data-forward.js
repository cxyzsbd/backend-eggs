'use strict';

const BaseController = require('../base-controller');

/**
* @--controller 数据转发接口 data-forward
*/

class DataForwardController extends BaseController {
  /**
  * @apikey
  * @summary 通用转发接口
  * @description 通用转发接口
  * @router get data-forward/:url
  * @request path string *url eg:getboxlist
  */
  async dataForward () {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { portmapping_smscode_verify } = app.config;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(21, url.indexOf('?')) : url.slice(21);
    const params = { ...ctx.query, ...body };
    if (apiUrl === 'portmapping' && portmapping_smscode_verify) {
      const { opt, smscode } = params;
      if (Number(opt) === 3) {
        const defaultRedis = app.redis.clients.get('default');
        const redisKey = `USER_SMS_${request_user}`;
        const verifyCode = await defaultRedis.get(redisKey);
        if (!verifyCode || !smscode || verifyCode !== smscode) {
          this.INVALID_REQUEST({ message: '验证码错误' });
          return false;
        }
        await defaultRedis.del(redisKey);
      }
    }
    console.log('apiUrl', apiUrl);
    try {
      const res = await ctx.curl(`${requestBaseUrl}${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
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
      console.log('res==================', res);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      this.SUCCESS(res.data.error ? { ...res.data } : res.data);
    } catch (error) {
      throw error;
    }
  }
  async restForward () {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.restForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(21, url.indexOf('?')) : url.slice(21);
    try {
      const res = await ctx.curl(`${requestBaseUrl}${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
        method,
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          ...header,
        },
        dataType: 'json',
        data,
      }).catch(err => {
        ctx.logger.error('rest转发错误====================', err);
        return false;
      });
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
  * @summary CPP服务转发接口
  * @description CPP服务转发接口
  * @router get cpp-forward/:url
  * @request path string *url eg:getboxlist
  */
  async cppForward () {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.cppForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const { company_id } = header;
    let data = body || {};
    data = {
      ...data,
      company: company_id,
    };
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(20, url.indexOf('?')) : url.slice(20);
    if (apiUrl === 'readtasklist') {
      const departments = await ctx.service.departments.getUserDepartments();
      const departmentIds = departments.map(item => item.id);
      data.department_ids = departmentIds;
      data.company_id = company_id;
      // console.log('departmentIds=============', departmentIds);
    }
    ctx.logger.error('CPP服务转发==============', requestBaseUrl);
    try {
      const res = await ctx.curl(`${requestBaseUrl}api/v1/${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
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
        ctx.logger.error('CPP服务转发错误==============', err);
        return false;
      });
      ctx.logger.error('CPP服务转发结果==============', res);
      // console.log('res==================', res);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      this.SUCCESS(res.data);
    } catch (error) {
      throw error;
    }
  }

  /**
  * @apikey
  * @summary 无token转发
  * @description 签名规则：
  * 1.先将参数按照`key=value`的形式加入到数组，
  * 2.再将数组按照正序1-9|a-z排序，
  * 3.再用&连接成新的字符串str，
  * 4.最后str拼接秘钥，`str+&secret=sss`的形式再通过md5加密字符串得到签名
  * @router get api-forward/:url
  * @request path string *url eg:getboxlist
  */
  async apiForward () {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    const { method, url, header, body } = ctx.request;
    const data = body || {};
    let params = { ...ctx.query, ...body };
    console.log('params', params);
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(20, url.indexOf('?')) : url.slice(20);
    console.log('apiUrl', apiUrl);
    let newParams = app.utils.tools.lodash.cloneDeep(params);
    delete newParams.sign;
    const sign = await app.utils.tools.getSign(newParams);
    if (sign !== params.sign) {
      this.BAD_REQUEST({ message: '签名错误' });
      return false;
    }
    try {
      const res = await ctx.curl(`${requestBaseUrl}${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
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
