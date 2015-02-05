"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toArray = function (arr) { return Array.isArray(arr) ? arr : Array.from(arr); };




// ---------------
// Define Mixins function
// ---------------
module.exports = Mixins;
// ---------------
// Import modules
// ---------------
var invariant = _interopRequire(require("react/lib/invariant"));




// ---------------
// Define helpers
// ---------------
function getType(object) {
  return Object.prototype.toString.call(object);
};

function isNull(object) {
  return getType(object) === "[object Null]";
};

function isUndefined(object) {
  return getType(object) === "[object Undefined]";
};

function isDefined(object) {
  return !isUndefined(object) && !isNull(object);
};

function isDefinedOnce() {
  for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
    objects[_key] = arguments[_key];
  }

  return objects.filter(function (object) {
    return isDefined(object);
  }).length === 1;
};

function isObject(object) {
  return getType(object) === "[object Object]";
};

function isObjectOrNull(object) {
  return isObject(object) || isNull(object);
};

function isFunction(object) {
  return getType(object) === "[object Function]";
};

function getOrCall(object) {
  return !isFunction(object) ? object : function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return object.apply.apply(object, [this].concat(_toArray(args)));
  };
};

function apply(self, fn) {
  var args = arguments[2] === undefined ? [] : arguments[2];
  return isFunction(fn) && fn.apply.apply(fn, [self].concat(_toArray(args)));
};


// ---------------
// Define default rules for React class properties
// ---------------
function getDefaultRules() {
  return {
    // Lifecycle methods
    componentWillMount: Mixins.MANY,
    componentDidMount: Mixins.MANY,
    componentWillReceiveProps: Mixins.MANY,
    shouldComponentUpdate: Mixins.ONCE,
    componentWillUpdate: Mixins.MANY,
    componentDidUpdate: Mixins.MANY,
    componentWillUnmount: Mixins.MANY,

    // Compatibility hack
    getDefaultProps: Mixins.MANY_MERGED,
    getInitialState: Mixins.MANY_MERGED
  };
};function Mixins(factory) {
  var _this = this;
  var mixins = arguments[1] === undefined ? [] : arguments[1];
  var options = arguments[2] === undefined ? {} : arguments[2];


  // Define settings from options
  var defaultRule = options.defaultRule || Mixins.ONCE;
  var rules = Object.assign(getDefaultRules(), options.rules);
  var getInitialStateFnName = "_getInitialState";

  // Loop over mixins in reverse order
  mixins.reverse().forEach(function (mixin, index) {
    // Loop over mixin property, ignore non function properties except 'propTypes' and 'statics'
    Object.keys(mixin).forEach(function (key) {
      var mixinProperty = mixin[key];
      var rule = rules[key] || defaultRule;

      // Compatibility hack
      // Merge result of 'getDefaultProps' to 'defaultProps' factory property
      if (key === "getDefaultProps") {
        factory.defaultProps = Object.assign(factory.defaultProps || {}, apply(_this, mixinProperty));
      }

      // Compatibility hack
      // Merge 'propTypes to 'propTypes' factory property
      else if (key === "propTypes") {
        factory.propTypes = Object.assign(factory.propTypes || {}, mixinProperty);
      }

      // Compatibility hack
      // Replace 'getInitialState' function name with getInitialStateFnName value
      // to avoid warning message in React
      else if (key === "getInitialState") {
        factory.prototype[getInitialStateFnName] = getOrCall(rule(factory.prototype[getInitialStateFnName], mixinProperty, key));
      }

      // Merge statics with factory
      else if (key === "statics") {
        Object.assign(factory, mixinProperty);
      }

      // Set function with rule wrapper to factory prototype property
      else if (isFunction(mixinProperty)) {
        factory.prototype[key] = getOrCall(rule(factory.prototype[key], mixinProperty, key));
      }
    });
  });
}


// ---------------
// Define built-in rules
// ---------------

// Can be defined only once
Mixins.ONCE = function (left, right, key) {
  invariant(isDefinedOnce(left, right), "You are attempting to define `" + key + "` on your component more than once. " + "This conflict may be due to a mixin.");

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return apply.apply(undefined, [this, left || right].concat(_toArray(args)));
  };
};

// Can be defined multiple times
Mixins.MANY = function (left, right, key) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (apply.apply(undefined, [this, right].concat(_toArray(args))) || true) && apply.apply(undefined, [this, left].concat(_toArray(args)));
  };
};

// Can be defined multiple times, and merge results
Mixins.MANY_MERGED = function (left, right, key) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var resultRight = apply.apply(undefined, [this, right].concat(_toArray(args)));
    var resultLeft = apply.apply(undefined, [this, left].concat(_toArray(args)));

    invariant(isObjectOrNull(resultRight) && isObjectOrNull(resultLeft), "`" + key + "` must return an object or null.");

    return Object.assign(resultRight || {}, resultLeft);
  };
};