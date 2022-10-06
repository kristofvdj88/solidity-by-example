logger = {
  production: false,

  group: function (groupName) {
    if (!production) console.groupCollapsed(groupName);
  },

  groupEnd: function () {
    console.groupEnd();
  },

  message: function (message, object) {
    if (!production) console.log(message, object);
  },

  error: function (e) {
    console.error(e);
  },

  warn: function (warning) {
    console.warn(warning);
  },
};
