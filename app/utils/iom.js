module.exports = class Iom {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
    this.config = app.config;
    this.logger = app.logger;
  }

  // 巡检推送
  async inspectionPush(inspectionId, company_id) {
    const { ctx, app } = this;
    const { dayjs } = app.utils.tools;
    const { socketUserPrefix } = app.config;
    const nsp = app.io.of('/');
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
        const taskTargets = inspectionTargets.map(item => {
          return {
            task_id: task.id,
            equipment_account_id: item.equipment_account_id,
          };
        });
        await ctx.model.InspectionResults.bulkCreate(taskTargets, { transaction });
        ctx.logger.info('巡检生成结果：', taskTargets);
        // 3.备份巡检人员
        const taskHandlers = inspectionHandlers.map(item => {
          return {
            task_id: task.id,
            handler: item.handler,
          };
        });
        await ctx.model.InspectionTaskHandlers.bulkCreate(taskHandlers, { transaction });
        ctx.logger.info('巡检任务备份执行人：', taskHandlers);
        const companyPrefix = company_id ? company_id : '';
        // 4.通知
        taskHandlers.forEach(item => {
          ctx.logger.info('巡检任务通知执行人：', item.handler);
          nsp.to(`${socketUserPrefix}_${companyPrefix}_${item.handler}`).emit('inspection', task);
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
};
