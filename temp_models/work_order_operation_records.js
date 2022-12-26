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
      field: "id"
    },
    work_order_sn: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "工单号",
      field: "work_order_sn"
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1:新建；2:编辑；3:审核；4:认领；5:处理",
      field: "type"
    },
    operator: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作人",
      field: "operator"
    },
    operation_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "操作时间",
      field: "operation_time"
    },
    operation_result: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审核操作结果(1:通过：0不通过)",
      field: "operation_result"
    },
    not_pass_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审核不通过原因",
      field: "not_pass_reason"
    }
  };
  const options = {
    tableName: "work_order_operation_records",
    comment: "",
    indexes: []
  };
  const WorkOrderOperationRecordsModel = sequelize.define("work_order_operation_records_model", attributes, options);
  return WorkOrderOperationRecordsModel;
};