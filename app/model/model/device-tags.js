'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    device_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备id',
      field: 'device_id',
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '点名',
      field: 'tag',
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '属性名称',
      field: 'name',
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '类型(1:int;2:float;3:int;4:string)',
      field: 'type',
    },
    desc: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '描述',
      field: 'desc',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '单位',
      field: 'unit',
    },
    range: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '范围',
      field: 'range',
    },
    boxcode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '点位所属盒子访问码',
      field: 'boxcode',
    },
    tagname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '关联实际点位长点名',
      field: 'tagname',
    },
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'company_id',
    },
  };
  const options = {
    tableName: 'device_tags',
    comment: '',
    indexes: [],
  };
  const DeviceTagsModel = sequelize.define('device_tags_model', attributes, options);
  return DeviceTagsModel;
};
