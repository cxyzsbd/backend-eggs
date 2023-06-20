'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    station_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: '站点id',
      field: 'station_id',
    },
    visual_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '可视化工程id',
      field: 'visual_id',
    },
    visual_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '可视化名称',
      field: 'visual_name',
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '可视化缩略图',
      field: 'thumbnail',
    },
    creator: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '创建人',
      field: 'creator',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: '创建时间',
      field: 'create_at',
    },
    updator: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '更新人',
      field: 'updator',
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '更新时间',
      field: 'update_at',
    },
  };
  const options = {
    tableName: 'station_yz_visuals',
    comment: '',
    indexes: [],
  };
  const StationYzVisualsModel = sequelize.define('station_yz_visuals_model', attributes, options);
  return StationYzVisualsModel;
};
