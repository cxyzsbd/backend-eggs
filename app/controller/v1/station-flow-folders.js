'use strict';

const BaseController = require('../base-controller');

/**
* @controller 站点绑定流程图工程 station-flow-folders
*/

class StationFlowFoldersController extends BaseController {

  /**
  * @apikey
  * @summary 获取某个 站点绑定流程图工程
  * @description 获取某个 站点绑定流程图工程
  * @router get station/:station_id/flow-folders
  * @request path number *station_id eg:1
  */
  async findOne () {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.stationFlowFoldersId, ctx.params);
    const res = await service.stationFlowFolders.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 站点绑定流程图工程
  * @description 创建 站点绑定流程图工程
  * @router post station/:station_id/flow-folders
  * @request body stationFlowFoldersBodyReq
  */
  async bind () {
    const { ctx, service } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    const { station_id } = params;
    ctx.validate(ctx.rule.stationFlowFoldersBodyReq, params);
    const checkRes = await service.stationFlowFolders.checkStationPermission(station_id);
    if (!checkRes) {
      this.FORBIDDEN();
      return false;
    }
    const data = await service.stationFlowFolders.findOne({ station_id });
    if (!data) {
      await ctx.service.stationFlowFolders.create(params);
      this.CREATED({ message: '绑定成功' });
      return false;
    }
    const res = await service.stationFlowFolders.update(params);
    res && res[0] !== 0 ? this.SUCCESS({ message: '绑定成功' }) : this.NOT_FOUND({ message: '绑定无修改' });
  }

  /**
  * @apikey
  * @summary 解绑 站点绑定流程图工程
  * @description 解绑 站点绑定流程图工程
  * @router delete station/:station_id/flow-folders
  * @request path number *station_id eg:1
  */
  async destroy () {
    const { ctx, service } = this;
    let params = ctx.params;
    const checkRes = await service.stationFlowFolders.checkStationPermission(params.station_id);
    if (!checkRes) {
      this.FORBIDDEN();
      return false;
    }
    ctx.validate(ctx.rule.stationFlowFoldersId, params);
    const res = await service.stationFlowFolders.destroy(params);
    res ? this.NO_CONTENT({ message: '解绑成功' }) : this.NOT_FOUND({ message: '未找到绑定关系' });
  }
}

module.exports = StationFlowFoldersController;
