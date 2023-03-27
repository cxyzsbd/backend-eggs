'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.models;
  const attributes = {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '网关标签',
      field: 'label',
    },
    department: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '部门ID/公司ID/组织ID',
      field: 'department',
    },
    longitude: {
      type: DataTypes.STRING(16),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: 'localtion-longitude 经纬度',
      field: 'longitude',
    },
    latitude: {
      type: DataTypes.STRING(16),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '经纬度',
      field: 'latitude',
    },
    box_code: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户侧用的编码',
      field: 'box_code',
      unique: 'idx_unique_box_code',
    },
    machine_code: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: 'UUID 设备指纹',
      field: 'machine_code',
      unique: 'idx_unique_mc',
    },
    box_model: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '产品型号',
      field: 'box_model',
    },
    online_status: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '在线状态0：离线，1：在线',
      field: 'online_status',
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '网关程序版本号',
      field: 'version',
    },
    req_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: '上线时间',
      field: 'req_time',
    },
  };
  const options = {
    tableName: 'box_info',
    comment: '',
    indexes: [],
  };
  const BoxInfoModel = sequelize.define('box_info_model', attributes, options);
  return BoxInfoModel;
};
