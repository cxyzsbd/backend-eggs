module.exports = class Iom {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
    this.config = app.config;
    this.logger = app.logger;
  }

  // 巡检推送
  async inspectionPush(inspectionId, company_id) {
    const { app } = this;
    const ctx = app.createAnonymousContext();
    const { dayjs } = app.utils.tools;
    // const { socketUserPrefix } = app.config;
    // const nsp = app.io.of('/');
    ctx.logger.info('巡检执行推送：', inspectionId);
    const inspection = await ctx.model.Inspections.findOne({
      where: { id: inspectionId },
      raw: true,
    });
    if (!inspection) {
      return false;
    }
    ctx.logger.info('巡检执行推送巡检内容：', inspection);
    const inspectionTargets = await ctx.model.InspectionTargets.findAll({
      where: { inspection_id: inspectionId },
      raw: true,
    });
    const inspectionHandlers = await ctx.model.InspectionHandlers.findAll({
      where: { inspection_id: inspectionId },
      raw: true,
    });
    ctx.logger.info('巡检执行推送巡检目标：', inspectionTargets);
    ctx.logger.info('巡检执行推送巡检执行人：', inspectionHandlers);
    const transaction = await ctx.model.transaction();
    try {
      const start_time = inspection.next_time || inspection.start_time;
      let end_time = inspection.end_time;
      if (inspection.cycle !== 1) {
        // 结束时间等于开始时间加上单次巡检持续时间
        const { duration, duration_unit } = inspection;
        let u = Number(duration_unit) === 1 ? 'day' : 'hour';
        end_time = dayjs(start_time).add(duration, u);
      }
      // 1.创建巡检任务
      const taskId = await app.utils.tools.SnowFlake();
      const task = await ctx.model.InspectionTasks.create({
        id: taskId,
        inspection_id: inspection.id,
        name: `${inspection.name}-${dayjs(start_time).format('YYYYMMDDHHmmss')}`,
        start_time,
        end_time,
        company_id,
        status: 1,
      }, { transaction });
      ctx.logger.info('巡检生成任务结果：', task);
      if (task) {
        // 2.生成巡检任务结果
        console.log('inspectionTargets==============', inspectionTargets);
        let taskTargets = inspectionTargets.map(item => {
          let results = {};
          JSON.parse(item.items).forEach(key => {
            results[key] = '';
          });
          return {
            task_id: task.id,
            equipment_account_id: item.equipment_account_id,
            results,
          };
        });
        ctx.logger.info('巡检生成结果：', taskTargets);
        await ctx.model.InspectionResults.bulkCreate(taskTargets, { transaction });
        // 3.备份巡检人员
        const taskHandlers = inspectionHandlers.map(item => {
          return {
            task_id: task.id,
            handler: item.handler,
          };
        });
        await ctx.model.InspectionTaskHandlers.bulkCreate(taskHandlers, { transaction });
        ctx.logger.info('巡检任务备份执行人：', taskHandlers);
        // const companyPrefix = company_id ? company_id : '';
        // 4.通知
        taskHandlers.forEach(async item => {
          ctx.logger.info('巡检任务通知执行人：', item.handler);
          // nsp.to(`${socketUserPrefix}_${companyPrefix}_${item.handler}`).emit('inspection', task);
          await this.inspectionTaskNotice({ data: task, receiver_id: item.handler });
        });
        if (inspection.cycle !== 1) {
          // 5.修改计划表
          // 计算下次任务时间
          let count = 1,
            unit = 'day';
          switch (inspection.cycle) {
            case 2: count = 1; unit = 'day'; break;
            case 3: count = 1; unit = 'week'; break;
            case 4: count = 1; unit = 'month'; break;
            case 5: count = 1; unit = 'quarter'; break;
            case 6: count = 6; unit = 'month'; break;
            case 7: count = 1; unit = 'year'; break;
            default: count = 1; unit = 'day'; break;
          }
          const next_time = dayjs(start_time).add(count, unit);
          ctx.logger.info('巡检任务下次执行时间：', next_time);
          // 判断下次执行时间有没有大于结束时间
          if (dayjs(inspection.end_time).isAfter(dayjs(next_time))) {
            ctx.logger.info('巡检计划结束前还能执行下次任务：', inspection.end_time);
            await ctx.model.Inspections.update({
              next_time,
            }, {
              where: { id: inspectionId },
              transaction,
            });
            ctx.logger.info('巡检计划更新下次执行时间：', next_time);
            // 6.创建下一个倒计时任务
            // 提醒时间
            const remindTime = dayjs(next_time).subtract(Number(inspection.remind_time), 'second');
            const diff = dayjs(remindTime).diff(dayjs(), 'second');
            let key = `INSPECTION__${inspectionId}__${company_id}`;
            const redisPub = app.redis.clients.get('iom');
            redisPub.set(key, 1);
            redisPub.expire(key, diff);
            ctx.logger.info('巡检计划创建新的倒计时任务：', key);
          } else {
            ctx.logger.info('巡检计划无后续任务：', next_time);
            await ctx.model.Inspections.update({
              next_time: null,
            }, {
              where: { id: inspectionId },
              transaction,
            });
          }
        }
      }
      await transaction.commit();
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  // 保养推送
  async maintenancePush(maintenanceId, company_id) {
    const { app } = this;
    const ctx = app.createAnonymousContext();
    const { dayjs } = app.utils.tools;
    // const { socketUserPrefix } = app.config;
    // const nsp = app.io.of('/');
    ctx.logger.info('保养执行推送：', maintenanceId);
    const maintenance = await ctx.model.Maintenances.findOne({
      where: { id: maintenanceId },
      raw: true,
    });
    if (!maintenance) {
      return false;
    }
    ctx.logger.info('保养执行保养保养内容：', maintenance);
    const maintenanceTargets = await ctx.model.MaintenanceTargets.findAll({
      where: { maintenance_id: maintenanceId },
      raw: true,
    });
    const maintenanceHandlers = await ctx.model.MaintenanceHandlers.findAll({
      where: { maintenance_id: maintenanceId },
      raw: true,
    });
    ctx.logger.info('保养执行推送保养目标：', maintenanceTargets);
    ctx.logger.info('保养执行推送保养执行人：', maintenanceHandlers);
    const transaction = await ctx.model.transaction();
    try {
      const start_time = maintenance.next_time || maintenance.start_time;
      let end_time = maintenance.end_time;
      if (maintenance.cycle !== 1) {
        // 结束时间等于开始时间加上单次保养持续时间
        const { duration, duration_unit } = maintenance;
        let u = Number(duration_unit) === 1 ? 'day' : 'hour';
        end_time = dayjs(start_time).add(duration, u);
      }
      // 1.创建保养任务
      const taskId = await app.utils.tools.SnowFlake();
      const task = await ctx.model.MaintenanceTasks.create({
        id: taskId,
        maintenance_id: maintenance.id,
        name: `${maintenance.name}-${dayjs(start_time).format('YYYYMMDDHHmmss')}`,
        start_time,
        end_time,
        company_id,
        status: 1,
      }, { transaction });
      ctx.logger.info('保养生成任务结果：', task);
      if (task) {
        // 2.生成保养任务结果
        console.log('maintenanceTargets==============', maintenanceTargets);
        let taskTargets = maintenanceTargets.map(item => {
          let results = {};
          JSON.parse(item.items).forEach(key => {
            results[key] = '';
          });
          return {
            task_id: task.id,
            equipment_account_id: item.equipment_account_id,
            results,
          };
        });
        ctx.logger.info('保养生成结果：', taskTargets);
        await ctx.model.MaintenanceResults.bulkCreate(taskTargets, { transaction });
        // 3.备份保养人员
        const taskHandlers = maintenanceHandlers.map(item => {
          return {
            task_id: task.id,
            handler: item.handler,
          };
        });
        await ctx.model.MaintenanceTaskHandlers.bulkCreate(taskHandlers, { transaction });
        ctx.logger.info('保养任务备份执行人：', taskHandlers);
        // const companyPrefix = company_id ? company_id : '';
        // 4.通知
        taskHandlers.forEach(async item => {
          ctx.logger.info('保养任务通知执行人：', item.handler);
          // nsp.to(`${socketUserPrefix}_${companyPrefix}_${item.handler}`).emit('maintenance', task);
          await this.maintenanceTaskNotice({ data: task, receiver_id: item.handler });
        });
        if (maintenance.cycle !== 1) {
          // 5.修改计划表
          // 计算下次任务时间
          let count = 1,
            unit = 'day';
          switch (maintenance.cycle) {
            case 2: count = 1; unit = 'day'; break;
            case 3: count = 1; unit = 'week'; break;
            case 4: count = 1; unit = 'month'; break;
            case 5: count = 1; unit = 'quarter'; break;
            case 6: count = 6; unit = 'month'; break;
            case 7: count = 1; unit = 'year'; break;
            default: count = 1; unit = 'day'; break;
          }
          const next_time = dayjs(start_time).add(count, unit);
          ctx.logger.info('保养任务下次执行时间：', next_time);
          // 判断下次执行时间有没有大于结束时间
          if (dayjs(maintenance.end_time).isAfter(dayjs(next_time))) {
            ctx.logger.info('保养计划结束前还能执行下次任务：', maintenance.end_time);
            await ctx.model.Maintenances.update({
              next_time,
            }, {
              where: { id: maintenanceId },
              transaction,
            });
            ctx.logger.info('保养计划更新下次执行时间：', next_time);
            // 6.创建下一个倒计时任务
            // 提醒时间
            const remindTime = dayjs(next_time).subtract(Number(maintenance.remind_time), 'second');
            const diff = dayjs(remindTime).diff(dayjs(), 'second');
            let key = `INSPECTION__${maintenanceId}__${company_id}`;
            const redisPub = app.redis.clients.get('iom');
            redisPub.set(key, 1);
            redisPub.expire(key, diff);
            ctx.logger.info('保养计划创建新的倒计时任务：', key);
          } else {
            ctx.logger.info('保养计划无后续任务：', next_time);
            await ctx.model.Maintenances.update({
              next_time: null,
            }, {
              where: { id: maintenanceId },
              transaction,
            });
          }
        }
      }
      await transaction.commit();
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async userSocketPush({ data, user_id, event }) {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const { socketUserPrefix } = app.config;
    const userinfo = await ctx.service.cache.get(`userinfo_${user_id}`, 'default');
    const companyPrefix = userinfo && userinfo.company_id ? userinfo.company_id : '';
    nsp.to(`${socketUserPrefix}_${companyPrefix}_${user_id}`).emit(event, data);
  }

  // 工单消息
  async workOrderNotice(payload) {
    const { ctx, app } = this;
    const { NOTICE_PUSH_EVENT_NAME } = app.config;
    const { data, sender_id = null, receiver_id, type } = payload;
    const { id, name } = data;
    let content = '';
    if (type === 1) {
      content = `新的工单【${name}】等待审核`;
    } else {
      content = `新的工单【${name}】等待执行`;
    }
    const params = {
      sender_id,
      receiver_id,
      type,
      is_read: 0,
      content,
      target_id: id,
    };
    const res = await ctx.service.notifications.create(params);
    if (res) {
      await this.userSocketPush({ data: params, user_id: receiver_id, event: NOTICE_PUSH_EVENT_NAME });
    }
  }

  // 巡检任务消息
  async inspectionTaskNotice(payload) {
    const { ctx, app } = this;
    const { NOTICE_PUSH_EVENT_NAME } = app.config;
    const { data, sender_id = null, receiver_id } = payload;
    const { id, name } = data;
    let content = `新的巡检任务【${name}】等待执行`;
    const params = {
      sender_id,
      receiver_id,
      type: 3,
      is_read: 0,
      content,
      target_id: id,
    };
    const res = await ctx.service.notifications.create(params);
    if (res) {
      await this.userSocketPush({ data: params, user_id: receiver_id, event: NOTICE_PUSH_EVENT_NAME });
    }
  }

  // 保养任务消息
  async maintenanceTaskNotice(payload) {
    const { ctx, app } = this;
    const { NOTICE_PUSH_EVENT_NAME } = app.config;
    const { data, sender_id = null, receiver_id } = payload;
    const { id, name } = data;
    let content = `新的保养任务【${name}】等待执行`;
    const params = {
      sender_id,
      receiver_id,
      type: 4,
      is_read: 0,
      content,
      target_id: id,
    };
    const res = await ctx.service.notifications.create(params);
    if (res) {
      await this.userSocketPush({ data: params, user_id: receiver_id, event: NOTICE_PUSH_EVENT_NAME });
    }
  }
};
