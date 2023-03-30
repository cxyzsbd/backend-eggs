'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: '分享id',
      field: 'id',
    },
    visual_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '可视化id',
      field: 'visual_id',
    },
    type: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '可视化类型(1:大屏；2：流程图)',
      field: 'type',
    },
    invalid_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '失效时间',
      field: 'invalid_time',
    },
    is_share: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '分享开关（1：分享；0关闭）',
      field: 'is_share',
    },
    share_pass: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '分享密码，明文',
      field: 'share_pass',
    },
    config_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '配置文件路径',
      field: 'config_path',
    },
    creator: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '分享人',
      field: 'creator',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: '分享时间',
      field: 'create_at',
    },
    company_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
  };
  const options = {
    tableName: 'visual_shares',
    comment: '',
    indexes: [],
  };
  const VisualSharesModel = sequelize.define('visual_shares_model', attributes, options);
  VisualSharesModel.associate = () => {
    VisualSharesModel.hasOne(app.model.Screens, { foreignKey: 'id', sourceKey: 'visual_id', as: 'screen_info' });
    VisualSharesModel.hasOne(app.model.Flows, { foreignKey: 'id', sourceKey: 'visual_id', as: 'flow_info' });
  };
  return VisualSharesModel;
};
