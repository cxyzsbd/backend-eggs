module.exports = options => {
  return async function desensitize (ctx, next) {
    await next();
    const { fields, res_type = 'array', res_name = '' } = options;
    if (res_type === 'array') {
      let data = res_name.length ? ctx.body[res_name] : ctx.body;
      // console.log('data====', data);
      data.map(item => {
        fields.forEach(async ({ field, rule, unit_name }) => {
          if (unit_name) {
            if (typeof (item[unit_name]) === 'string') {
              item[unit_name] = JSON.parse(item[unit_name]);
            }
            if (item[unit_name] && item[unit_name][field]) {
              // console.log('item[unit_name][field]', item[unit_name][field]);
              item[unit_name][field] = await ctx.app.utils.tools.desensitize(item[unit_name][field], rule);
            }
          } else {
            if (item[field]) {
              item[field] = await ctx.app.utils.tools.desensitize(item[field], rule);
            }
          }
        });
        // console.log('item=================', item);
        return item;
      });
    }
    if (res_type === 'object') {
      let data = res_name.length ? ctx.body[res_name] : ctx.body;
      fields.forEach(async ({ field, rule, unit_name }) => {
        if (unit_name) {
          if (typeof (data[unit_name]) === 'string') {
            data[unit_name] = JSON.parse(data[unit_name]);
          }
          if (data[unit_name][field]) {
            data[unit_name][field] = await ctx.app.utils.tools.desensitize(data[unit_name][field], rule);
          }
        } else {
          if (data[field]) {
            data[field] = await ctx.app.utils.tools.desensitize(data[field], rule);
          }
        }
      });
    }
  };
};

