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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '文件名称',
      field: 'name',
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '描述',
      field: 'desc',
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '后缀名',
      field: 'type',
    },
    station_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '站点id',
      field: 'station_id',
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '文件地址',
      field: 'url',
    },
    creator: {
      type: DataTypes.INTEGER(11),
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
  };
  const options = {
    tableName: 'station_files',
    comment: '',
    indexes: [],
  };
  const StationFilesModel = sequelize.define('station_files_model', attributes, options);
  return StationFilesModel;
};
