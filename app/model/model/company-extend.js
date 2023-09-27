'use strict';
const secretKey = 'mysecretkey';
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
      comment: 'id',
      field: 'id',
    },
    remark: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '备注',
      field: 'remark',
    },
    account: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '账号',
      field: 'account',
    },
    password: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '密码',
      field: 'password',
      get () {
        return app.utils.tools.aesDecryptNew(this.getDataValue('password'), secretKey);
      },
      set (val) {
        this.setDataValue('password', app.utils.tools.aesEncryptNew(val, secretKey));
      },
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
    val_type: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: '类型',
      field: 'val_type',
    },
  };
  const options = {
    tableName: 'company_extend',
    comment: '',
    indexes: [],
  };
  const CompanyExtendModel = sequelize.define('company_extend_model', attributes, options);
  return CompanyExtendModel;
};
