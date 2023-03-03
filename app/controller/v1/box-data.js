'use strict';

const BaseController = require('../base-controller');

/**
* @controller 数据 box-data
*/

class BoxDataController extends BaseController {
  /**
  * @apikey
  * @summary 数据和报警转发
  * @description 数据和报警转发
  * @router post box-data/:url
  * @request body boxDataBodyReq
  */
  async dataAndAlarm() {
    const { ctx, app } = this;
    let { method, url, header: { paramarr, paramtype }, body } = ctx.request;
    console.log('url================', url);
    console.log('header', ctx.request.header);
    if (paramarr && paramtype) {
      paramarr = decodeURIComponent(paramarr).split('&');
      paramtype = Number(paramtype);
      body = { ...body, param_arr: paramarr, param_type: paramtype };
    }
    console.log('body1===============', body);
    body.param_arr = body.param_arr.map(item => String(item));
    ctx.validate(ctx.rule.boxDataBodyReq, body);
    const requestBaseUrl = app.config.dataForwardBaseUrl; let data = body || {};
    const apiUrl = url.indexOf('?') !== -1 ? url.slice(17, url.indexOf('?')) : url.slice(17);
    const params = { ...ctx.query, ...body };
    data.tags = await this.solveParams(params.param_type, params.param_arr);
    // console.log('data========================', data.tags);
    // let res = data.tags.map(t => {
    //   if (Object.keys(t).length) {
    //     t.value = (Math.round(Math.random() * 10000)) / 100;
    //   }
    //   return t;
    // });
    // this.SUCCESS(res);
    // 处理参数
    console.log('apiUrl', apiUrl);
    console.log('data', data);
    try {
      const res = await ctx.curl(`${requestBaseUrl}box-data/${apiUrl}${url.indexOf('?') !== -1 ? url.slice(url.indexOf('?')) : ''}`, {
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

  async solveParams(type, tags = []) {
    const { ctx, app } = this;
    const { company_id } = ctx.request.header;
    const attr_tags = await ctx.service.cache.get('attr_tags', 'attrs');
    const long_attrs = await ctx.service.cache.get(`attrs_${company_id}`, 'attrs');
    // console.log('long_attrs', long_attrs);
    if (type === 1) {
      tags = tags.map(t => Number(t));
      console.log('tags===========', tags);
      return attr_tags.filter(a => tags.includes(a.id)).map(item => { return { id: item.id, boxcode: item.boxcode, tagname: item.tagname }; });
    } else if (type === 2) {
      let tagArr = tags.map(t => {
        const long_attr_arr = t.toLowerCase().split('/');
        let tagId = long_attrs[long_attr_arr[0]] && long_attrs[long_attr_arr[0]][long_attr_arr[1]] && long_attrs[long_attr_arr[0]][long_attr_arr[1]][long_attr_arr[2]] ? long_attrs[long_attr_arr[0]][long_attr_arr[1]][long_attr_arr[2]] : null;
        // console.log(tagId);
        let tag = attr_tags.filter(a => a.id === tagId);
        return tag && tag.length ? tag[0] : {};
      });
      return tagArr.map(item => { return { id: item.id, boxcode: item.boxcode, tagname: item.tagname }; });
    }


    // const Op = app.Sequelize.Op;
    // // id获取
    // if (type === 1) {
    //   return await ctx.model.DeviceTags.findAll({
    //     where: {
    //       id: {
    //         [Op.in]: tags,
    //       },
    //     },
    //   });
    // }
    // // 属性名
    // let stationSet = new Set();
    // let deviceSet = new Set();
    // // 1.先获取设备拿到设备id
    // tags.forEach(tag => {
    //   let tempArr = tag.split('/');
    //   stationSet.add(tempArr[0]);
    //   deviceSet.add(`${tempArr[0]}/${tempArr[1]}`);
    // });
    // const stationNames = Array.from(stationSet);
    // const stations = await ctx.model.Stations.findAll({
    //   where: {
    //     name: {
    //       [Op.in]: stationNames,
    //     },
    //   },
    //   raw: true,
    // });
    // let deviceArr = Array.from(deviceSet);
    // deviceArr = deviceArr.map(deviceStr => {
    //   let device = {};
    //   let keyArr = deviceStr.split('/');
    //   const stationObj = stations.filter(s => s.name === keyArr[0]) || null;
    //   device.station_id = stationObj.id || null;
    //   device.name = keyArr[1];
    //   return device;
    // });
    // let devices = await ctx.model.Devices.findAll({
    //   where: {
    //     [Op.or]: deviceArr,
    //   },
    //   raw: true,
    // });
    // devices = devices.map(d => {
    //   let stationObj = stations.filter(s => s.id === d.station_id) || null;
    //   d.station_name = stationObj.name || null;
    //   return d;
    // });
    // tags = tags.map(t => {
    //   let tObj = { long_name: t };
    //   let keyArr = t.split('/');
    //   let deviceObj = devices.filter(d => d.station_name === keyArr[0] && d.name === keyArr[1]) || null;
    //   tObj.device_id = deviceObj.id;
    //   tObj.name = keyArr[2];
    //   return tObj;
    // });
    // const attrs = tags.map(t => {
    //   return {
    //     device_id: t.device_id,
    //     name: t.name,
    //   };
    // });
    // let attrArr = await ctx.model.DeviceTags.findAll({
    //   where: {
    //     [Op.or]: attrs,
    //   },
    //   raw: true,
    // });
    // attrArr = attrArr.map(a => {
    //   let tag = tags.filter(t => t.device_id === a.device_id && t.name === a.name) || null;
    //   a.long_name = tag.long_name || null;
    //   return a;
    // });
    // return attrArr;
    // 2.再用设备id和属性名的对象去查找相关点合集
    // 3.最后在每个对象中拼接新的长点名转发
  }
}

module.exports = BoxDataController;
