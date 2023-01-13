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
    station_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '站点id',
      field: 'station_id',
    },
    boxcode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '盒子访问码',
      field: 'boxcode',
    },
    tagname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '点名',
      field: 'tagname',
    },
    attr_desc: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '属性描述',
      field: 'attr_desc',
    },
  };
  const options = {
    tableName: 'station_tags',
    comment: '',
    indexes: [],
  };
  const StationTagsModel = sequelize.define('station_tags_model', attributes, options);
  return StationTagsModel;
};
