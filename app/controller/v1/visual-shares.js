'use strict';

const BaseController = require('../base-controller');

/**
* @controller 可视化分享 visual-shares
*/

class VisualSharesController extends BaseController {
  /**
  * @apikey
  * @summary 可视化分享列表
  * @description 获取所有可视化分享
  * @request query number pageSize
  * @request query number pageNumber
  * @router get visual-shares
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.visualSharesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.visualShares.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 可视化分享
  * @description 获取某个 可视化分享
  * @router get visual-shares/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.visualSharesId, ctx.params);
    const res = await service.visualShares.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 可视化分享
  * @description 创建 可视化分享
  * @router post visual-shares
  * @request body visualSharesBodyReq
  */
  async create() {
    const { ctx, app } = this;
    ctx.validate(ctx.rule.visualSharesBodyReq, ctx.request.body);
    const res = await ctx.service.visualShares.create(ctx.request.body);
    app.utils.tools.setVisualSharesCache();
    this.CREATED({ message: '创建成功', data: res.id });
  }

  /**
  * @apikey
  * @summary 更新 可视化分享
  * @description 更新 可视化分享
  * @router put visual-shares/:id
  * @request path number *id eg:1
  * @request body visualSharesPutBodyReq
  */
  async update() {
    const { ctx, service, app } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.visualSharesPutBodyReq, params);
    const res = await service.visualShares.update(params);
    app.utils.tools.setVisualSharesCache();
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 可视化分享
  * @description 删除 可视化分享
  * @router delete visual-shares/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service, app } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.visualSharesId, params);
    const res = await service.visualShares.destroy(params);
    app.utils.tools.setVisualSharesCache();
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 获取分享可视化工程配置文件
  * @description 获取分享可视化工程配置文件
  * @router get visual-shares/:id/configs
  * @request header string sharePass '123456'
  */
  async getConfigs() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.visualSharesId, ctx.params);
    const res = await service.visualShares.getConfig();
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 可视化实时数据接口
  * @description 可视化实时数据接口
  * @router get visual/data
  * @request header string *paramtype
  * @request header string *paramarr
  */
  /**
  * @apikey
  * @summary 分享可视化工程实时数据接口
  * @description 分享可视化工程实时数据接口
  * @router get visual-shares/:id/data
  * @request header string *paramtype
  * @request header string *paramarr
  */
  async data() {
    const { ctx, app } = this;
    let { header, body } = ctx.request;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
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
    ctx.validate(ctx.rule.boxDataBodyReq, body);
    const params = { ...ctx.query, ...body };
    let dataO = await app.utils.tools.solveParams(params.param_type, params.param_arr);
    let data = dataO.filter(item => item.boxcode && item.tagname);
    let noTagAttrs = dataO.filter(item => !item.boxcode || !item.tagname);

    try {
      let resData = [];
      // 实时数据，如果没有点位，则从内存拿数据,若没有数据则
      const attr_values = await ctx.service.cache.get('attr_values', 'attrs') || {};
      noTagAttrs = noTagAttrs.map(item => {
        item.value = attr_values[item.id] || null;
        return item;
      });
      resData = [ ...resData, ...noTagAttrs ];
      // 如果data为空数组，直接返回
      if ((!data || !data.length) && (noTagAttrs && noTagAttrs.length)) {
        this.SUCCESS(resData);
        return false;
      }
      // console.time('中转数据');
      const res = await ctx.curl(`${requestBaseUrl}box-data/data`, {
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
      console.log('res==================', res.data);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      if (res && res.data && res.data.length) {
        resData = [ ...resData, ...res.data ];
      }
      this.SUCCESS(resData);
    } catch (error) {
      throw error;
    }
  }

  /**
  * @apikey
  * @summary 可视化数据下置
  * @description 可视化数据下置
  * @router post visual/data
  * @request body downloadDataBodyReq
  */

  /**
  * @apikey
  * @summary 分享可视化工程数据下置
  * @description 分享可视化工程数据下置
  * @router post visual-shares/:id/data
  */
  async downData() {
    const { ctx, app } = this;
    const requestBaseUrl = app.config.dataForwardBaseUrl;
    let params = JSON.parse(ctx.request.body);
    // console.log('params ===============', params);
    if (!params || !params.length) {
      this.VALIDATION_FAILED({ message: '参数错误' });
      return false;
    }
    params = params.map(item => {
      item.id = item.dataId;
      return item;
    });
    let dataO = await app.utils.tools.solveDownloadDataParams(1, params);
    let data = dataO.filter(item => item.boxcode && item.tagname);
    let noTagAttrs = dataO.filter(item => !item.boxcode || !item.tagname);
    // console.log('data', data);
    // console.log('noTagAttrs', noTagAttrs);
    try {
      // 下置数据,如果没有绑定点位，则直接将值写到内存中
      let attr_values = await ctx.service.cache.get('attr_values', 'attrs') || {};
      noTagAttrs.forEach(item => {
        attr_values[item.id] = item.value;
      });
      await ctx.service.cache.set('attr_values', attr_values, 0, 'attrs');
      // 如果data为空数组，直接返回
      if (!data || !data.length) {
        this.SUCCESS();
        return false;
      }
      // console.time('中转数据');
      const res = await ctx.curl(`${requestBaseUrl}box-data/down-data`, {
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
      // console.log('下置res123123213213213132131321313213==================', res.data);
      if (!res) {
        this.SERVER_ERROR();
        return false;
      }
      this.SUCCESS();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VisualSharesController;
