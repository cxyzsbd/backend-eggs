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
      comment: '公司id，对应departments表中parent_id=0的数据id',
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司名称',
      field: 'name',
    },
    platform_name: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '平台名称',
      field: 'platform_name',
    },
    connection_limit: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '连接数限制',
      field: 'connection_limit',
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: 'logo',
      field: 'logo',
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
    time_limit: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '使用期限',
      field: 'time_limit',
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
    update_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '更新时间',
      field: 'update_at',
    },
    admin: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '管理员',
      field: 'admin',
    },
    kingdee_company: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '金蝶同步用户公司id',
      field: 'kingdee_company',
    },
  };
  const options = {
    tableName: 'companys',
    comment: '',
    indexes: [],
  };
  const CompanysModel = sequelize.define('companys_model', attributes, options);
  CompanysModel.associate = function() {
    CompanysModel.hasOne(app.model.Users, { sourceKey: 'admin', foreignKey: 'id', as: 'admin_info' });
  };
  return CompanysModel;
};
