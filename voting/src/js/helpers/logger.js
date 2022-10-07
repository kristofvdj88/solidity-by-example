const Log = {
  production: false,

  group: function (groupName) {
    if (!Log.production) console.groupCollapsed(groupName);
  },

  groupEnd: function () {
    console.groupEnd();
  },

  message: function (message) {
    if (!Log.production) console.debug(message);
  },

  object: function (name, object) {
    if (!Log.production) console.debug(`${name}: `, object);
  },

  table: function (list) {
    if (!Log.production) console.table(list);
  },

  error: function (e) {
    console.error(e);
    $("#error-box").css("display", "block");
    $("#error-box").html(e.message);
  },

  warn: function (warning) {
    console.warn(warning);
  },
};
