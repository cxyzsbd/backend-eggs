'use strict';

const BaseController = require('../base-controller');

/**
* @controller 统计 statistics
*/

class statisticsController extends BaseController {
  /**
  * @apikey
  * @summary 获取某个 对象
  * @description 获取某个 对象
  * @router get statistics/user-count
  */
  async userCount() {
    const { service } = this;
    const res = await service.statistics.userCount();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取平台连接的数据源设备数（比如网关数）及其排名
  * @description 获取平台连接的数据源设备数（比如网关数）及其排名
  * @router get statistics/box-count
  */
  async boxCount() {
    const { service } = this;
    const res = await service.statistics.boxCount();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取平台连接的数据量（比如mqtt点位）总数及其排名
  * @description 获取平台连接的数据量（比如mqtt点位）总数及其排名
  * @router get statistics/data-source-count
  */
  async dataSourceCount() {
    const { service } = this;
    const res = await service.statistics.dataSourceCount();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取公司用户统计信息
  * @description 在线数、总数
  * @router get company-user-count
  */
  async companyUserCount() {
    const { service } = this;
    const res = await service.statistics.companyUserCount();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取公司数据源统计信息
  * @description 总数、连接实际数据源数
  * @router get company-data-source-count
  */
  async companyDataSourceCount() {
    const { service } = this;
    const res = await service.statistics.companyDataSourceCount();
    this.SUCCESS(res);
  }
}

module.exports = statisticsController;
