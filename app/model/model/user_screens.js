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
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户id',
      field: 'user_id',
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
  };
  const options = {
    tableName: 'user_screens',
    comment: '',
    indexes: [],
  };
  const UserScreensModel = sequelize.define('user_screens_model', attributes, options);
  UserScreensModel.associate = () => {
    UserScreensModel.hasOne(app.model.Screens, { foreignKey: 'id', sourceKey: 'screen_id' });
  };
  return UserScreensModel;
};
