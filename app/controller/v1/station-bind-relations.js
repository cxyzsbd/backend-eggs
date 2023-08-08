'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点和数据绑定关系 station-bind-relations
*/

class StationBindRelationsController extends BaseController {
  /**
  * @apikey
  * @summary 获取某个 站点绑定数据
  * @description 获取某个 站点绑定数据
  * @router get station-bind-relations
  * @request query string *station_id eg:1
  * @request query number *type eg:1
  */
  async findAll () {
    const { ctx, service } = this;
    const params = ctx.query;
    ctx.validate(ctx.rule.stationBindRelationsQueryReq, params);
    const res = await service.stationBindRelations.findAll(params);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 创建 站点绑定数据
  * @description 创建 站点绑定数据
  * @router post station-bind-relations
  * @request body stationBindRelationsBodyReq
  */
  async bind () {
    const { ctx, service } = this;
    const params = ctx.request.body;
    const { station_id, target_id, type } = params;
    ctx.validate(ctx.rule.stationBindRelationsBodyReq, params);
    const checkRes = await service.stationFlowFolders.checkStationPermission(station_id);
    if (!checkRes) {
      this.FORBIDDEN();
      return false;
    }
    const data = await service.stationBindRelations.findOne({ station_id, target_id, type });
    if (data) {
      this.BAD_REQUEST({ message: '已存在,请勿重复绑定' });
      return false;
    }
    const res = await service.stationBindRelations.create(params);
    this.SUCCESS({ message: '绑定成功' });
  }

  /**
  * @apikey
  * @summary 解绑 站点绑定数据
  * @description 解绑 站点绑定数据
  * @router delete station-bind-relations/:id
  * @request path number *id eg:1 '绑定关系唯一标识，id'
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    const data = await service.stationBindRelations.findOne({ id: params.id }, { raw: true });
    if (!data) {
      this.NOT_FOUND({ message: '未找到绑定关系' });
      return false;
    }
    const checkRes = await service.stationFlowFolders.checkStationPermission(data.station_id);
    if (!checkRes) {
      this.FORBIDDEN();
      return false;
    }
    ctx.validate(ctx.rule.stationBindRelationsId, params);
    await service.stationBindRelations.destroy(params);
    this.NO_CONTENT({ message: '解绑成功' });
  }
}

module.exports = StationBindRelationsController;
