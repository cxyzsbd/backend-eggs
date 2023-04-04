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
    screen_folder_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '文件夹id',
      field: 'screen_folder_id',
    },
    screen_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '大屏id',
      field: 'screen_id',
    },
    is_default: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '是否默认1:默认；0：非默认',
      field: 'is_default',
    },
  };
  const options = {
    tableName: 'screen_folder_screens',
    comment: '',
    indexes: [],
  };
  const ScreenFolderScreensModel = sequelize.define('screen_folder_screens_model', attributes, options);
  return ScreenFolderScreensModel;
};
