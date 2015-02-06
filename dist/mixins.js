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

function isFunction(object) {
  return getType(object) === "[object Function]";
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
  var _options$defaultRule = options.defaultRule;
  var defaultRule = _options$defaultRule === undefined ? Mixins.ONCE : _options$defaultRule;
  var _options$rules = options.rules;
  var rules = _options$rules === undefined ? { something: "ok" } : _options$rules;




  // Set default rules
  options.rules = Object.assign(getDefaultRules(), options.rules);


  // Loop over mixins in reverse order
  mixins.reverse().forEach(function (mixin, index) {
    // Loop over mixin property, ignore non function properties except 'propTypes' and 'statics'
    Object.keys(mixin).forEach(function (propName) {
      // Compatibility hack
      // Replace 'getInitialState' propperty with '_getInitialState'
      // to avoid warning message in React
      propName = propName === "getInitialState" ? "_getInitialState" : propName;

      // Set useful variable
      var rule = rules[propName] || defaultRule;
      var prototypeProp = factory.prototype[propName];
      var mixinProp = mixin[propName];

      switch (propName) {

        // Compatibility hack
        // Merge result of 'getDefaultProps' to 'defaultProps' factory property
        case "getDefaultProps":
          factory.defaultProps = Object.assign(factory.defaultProps || {}, apply(_this, mixinProp));
          break;

        // Compatibility hack
        // Merge 'propTypes to 'propTypes' factory property
        case "propTypes":
          factory.propTypes = Object.assign(factory.propTypes || {}, mixinProp);
          break;

        // Merge statics with factory
        case "statics":
          Object.assign(factory, mixinProp);
          break;

        default:
          // Set function with rule wrapper to factory prototype property
          if (isFunction(mixinProp)) {
            factory.prototype[propName] = rule(prototypeProp, mixinProp, propName);
          }
      }
    });
  });
}


// ---------------
// Define built-in rules
// ---------------

// Can be defined only once
Mixins.ONCE = function (prototypeProp, mixinProp, propName) {
  invariant(isDefinedOnce(prototypeProp, mixinProp), "You are attempting to define `" + propName + "` on your component more than once. " + "This conflict may be due to a mixin.");

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return apply.apply(undefined, [this, prototypeProp || mixinProp].concat(_toArray(args)));
  };
};

// Can be defined multiple times
Mixins.MANY = function (prototypeProp, mixinProp, propName) {
  var shouldMerge = arguments[3] === undefined ? false : arguments[3];
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (apply.apply(undefined, [this, mixinProp].concat(_toArray(args))) || true) && apply.apply(undefined, [this, prototypeProp].concat(_toArray(args)));
  };
};

// Can be defined multiple times, and merge results
Mixins.MANY_MERGED = function (prototypeProp, mixinProp, propName) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var mixinResult = apply.apply(undefined, [this, mixinProp].concat(_toArray(args))) || {};
    var prototypeResult = apply.apply(undefined, [this, prototypeProp].concat(_toArray(args))) || {};

    invariant(isObject(prototypeResult) && isObject(mixinResult), "`" + propName + "` must return an object or null.");

    return Object.assign({}, mixinResult, prototypeResult);
  };
};