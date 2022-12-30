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
    user_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户id',
      field: 'user_id',
    },
    boxcode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '访问码',
      field: 'boxcode',
    },
    tagname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '长点名',
      field: 'tagname',
    },
  };
  const options = {
    tableName: 'user_alarm_tags',
    comment: '',
    indexes: [],
  };
  const UserAlarmTagsModel = sequelize.define('user_alarm_tags_model', attributes, options);
  return UserAlarmTagsModel;
};
