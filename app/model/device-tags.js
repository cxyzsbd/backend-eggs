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
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备id',
      field: 'device_id',
    },
    tag: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '点名',
      field: 'tag',
    },
    attr_desc: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '属性描述',
      field: 'attr_desc',
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
  };
  const options = {
    tableName: 'device_tags',
    comment: '',
    indexes: [],
  };
  const DeviceTagsModel = sequelize.define('device_tags_model', attributes, options);
  return DeviceTagsModel;
};
