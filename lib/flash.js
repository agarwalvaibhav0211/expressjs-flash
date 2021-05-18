/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options) {
  options = options || {};
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;

  return function (req, res, next) {
    if (req.session) {
      if (req.session.flash) {
        if (options.passToView == true) {
          res.locals.flash = req.session.flash;
        }
        var msgs = req.session.flash;
        for (i in msgs) {
          if (msgs[i]["reqCount"]) {
            msgs[i]["reqCount"]--;
            if (msgs[i]["reqCount"] == 0) {
              delete msgs[i];
            }
          }
        }
      }
      else {
        res.locals.flash = req.session.flash = {};
      }
    }
    if (req.flash && safe) { return next(); }
    req.setFlash = setFlash;
    req.getFlash = getFlash;
    next();
  }
}

/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *      req.flash('info');
 *      // => ['email sent', 'email re-sent']
 *
 *      req.flash('info');
 *      // => []
 *
 *      req.flash();
 *      // => { error: ['email delivery failed'], info: [] }
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param {String} type
 * @param {String} msg
 * @return {Array|Object|Number}
 * @api public
 */
function setFlash(type, msg, options) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  var msgs = this.session.flash = this.session.flash || {};
  if (arguments.length > 3) {
    console.error("Too Many Arguments");
    return;
  } else if (arguments.length == 3) {
    if (typeof type != 'string' && !(type instanceof String) && !isArray(type)) {
      console.error("Invalid Identifier/s");
      return;
    } else {
      msgs[type] = {};
      msgs[type]["data"] = msg;
      if (options["maxRead"]) {
        msgs[type]["accessCount"] = options["maxRead"];
      }
      if (options["reqCount"]) {
        msgs[type]["reqCount"] = options["reqCount"];
      }
    }
  }
  else if (arguments.length == 2) {
    if (typeof type != 'string' && !(type instanceof String) && !isArray(type)) {
      console.error("Invalid Identifier/s");
      return;
    } else {
      msgs[type] = {};
      msgs[type]["data"] = msg;
      msgs[type]["accessCount"] = 1;
    }
  } else {
    console.error("Arguments Missing");
    return;
  }
}

function getFlash(type, options) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  var msgs = this.session.flash = this.session.flash || {};
  if (arguments.length > 2) {
    console.error("Too Many Arguments");
    return;
  } else if (arguments.length == 2) {
    if (typeof type != 'string' && !(type instanceof String)) {
      console.error("Invalid Identifier/s");
      return;
    } else {
      if (options["reflash"]) {
        return msgs[type]["data"];
      }
      else {
        msgs[type]["accessCount"]--;
        var msg = msgs[type]["data"];
        if (msgs[type]["accessCount"] == 0) {
          delete msgs[type];
        }
        return msg;
      }
    }
  }
  else if (arguments.length == 1) {
    if (typeof type != 'string' && !(type instanceof String)) {
      console.error("Invalid Identifier/s");
      return;
    } else {
      msgs[type]["accessCount"]--;
      var msg = msgs[type]["data"];
      if (msgs[type]["accessCount"] == 0) {
        delete msgs[type];
      }
      return msg;
    }
  } else {
    console.error("Arguments Missing");
    return;
  }
}