/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;
var debug = require('debug')('expressjs-flash')


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options) {
  options = options || {};

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
        res.locals.getFlash = getFlash;
        res.locals.setFlash = setFlash;
      }
    }
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
    debug("Too Many Arguments");
    return;
  } else if (arguments.length == 3) {
    if (typeof type != 'string' && !(type instanceof String) && !isArray(type)) {
      debug("Invalid Identifier/s");
      return;
    } else {
      msgs[type] = {};
      msgs[type]["data"] = msg;
      if (options["maxReads"]) {
        msgs[type]["accessCount"] = options["maxReads"];
      }
      if (options["reqCount"]) {
        msgs[type]["reqCount"] = options["reqCount"] + 1;
      }
    }
  }
  else if (arguments.length == 2) {
    if (typeof type != 'string' && !(type instanceof String) && !isArray(type)) {
      debug("Invalid Identifier/s");
      return;
    } else {
      msgs[type] = {};
      msgs[type]["data"] = msg;
      msgs[type]["accessCount"] = 1;
    }
  } else {
    debug("Arguments Missing");
    return;
  }
}

function getFlash(type, options) {
  if (this.session === undefined) throw Error('req.flash() requires sessions');
  var msgs = this.session.flash = this.session.flash || {};
  if (arguments.length > 2) {
    debug("Too Many Arguments");
    return;
  } else if (arguments.length == 2) {
    if (typeof type != 'string' && !(type instanceof String)) {
      debug("Invalid Identifier/s");
      return;
    } else {
      if (msgs[type]) {
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
      else
        return;
    }
  }
  else if (arguments.length == 1) {
    if (typeof type != 'string' && !(type instanceof String)) {
      debug("Invalid Identifier/s");
      return;
    } else {
      if (msgs[type]) {
        msgs[type]["accessCount"]--;
        var msg = msgs[type]["data"];
        if (msgs[type]["accessCount"] == 0) {
          delete msgs[type];
        }
        return msg;
      }
      else
        return;
    }
  } else {
    debug("Arguments Missing");
    return;
  }
}