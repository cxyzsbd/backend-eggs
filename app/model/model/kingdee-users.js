'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    kingdee_uid: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: '金蝶用户uid',
      field: 'kingdee_uid',
    },
    user_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '系统中用户id',
      field: 'user_id',
    },
  };
  const options = {
    tableName: 'kingdee_users',
    comment: '',
    indexes: [],
  };
  const KingdeeUsersModel = sequelize.define('kingdee_users', attributes, options);
  KingdeeUsersModel.associate = () => {
    KingdeeUsersModel.hasOne(app.model.Users, { foreignKey: 'id', sourceKey: 'user_id', as: 'userinfo' });
  };
  return KingdeeUsersModel;
};
