'use strict';

module.exports = app => {
  const { validator } = app;
  // UUID
  validator.addRule('uuid', (rule, value) => {
    if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value)) {
      return '必须是UUID';
    }
  });
};

