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
    model_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '设备id',
      field: 'model_id',
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
  };
  const options = {
    tableName: 'device_model_tags',
    comment: '',
    indexes: [],
  };
  const DeviceModelTagsModel = sequelize.define('device_model_tags_model', attributes, options);
  return DeviceModelTagsModel;
};
