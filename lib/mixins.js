// ---------------
// Import modules
// ---------------
import invariant from 'react/lib/invariant';


// ---------------
// Define helpers
// ---------------
function getType(object) {
  return Object.prototype.toString.call(object);
};

function isNull(object) {
  return getType(object) === '[object Null]';
};

function isUndefined(object) {
  return getType(object) === '[object Undefined]';
};

function isDefined(object) {
  return !isUndefined(object) && !isNull(object);
};

function isDefinedOnce(...objects) {
  return objects.filter(object => isDefined(object)).length === 1;
};

function isObject(object) {
  return getType(object) === '[object Object]';
};

function isFunction(object) {
  return getType(object) === '[object Function]';
};

function apply(self, fn, args = []) {
  return isFunction(fn) && fn.apply(self, ...args);
};


// ---------------
// Define default rules for React class properties
// ---------------
function getDefaultRules() {
  return {
    // Lifecycle methods
    componentWillMount:        Mixins.MANY,
    componentDidMount:         Mixins.MANY,
    componentWillReceiveProps: Mixins.MANY,
    shouldComponentUpdate:     Mixins.ONCE,
    componentWillUpdate:       Mixins.MANY,
    componentDidUpdate:        Mixins.MANY,
    componentWillUnmount:      Mixins.MANY,

    // Compatibility hack
    getDefaultProps:           Mixins.MANY_MERGED,
    getInitialState:           Mixins.MANY_MERGED
  };
};


// ---------------
// Define Mixins function
// ---------------
export default function Mixins(factory, mixins = [], options = {}) {

  // Define settings from options
  var defaultRule = options.defaultRule || Mixins.ONCE;
  var rules       = Object.assign(getDefaultRules(), options.rules);


  // Loop over mixins in reverse order
  mixins.reverse().forEach((mixin, index) => {

    // Loop over mixin property
    Object.keys(mixin).forEach(propName => {

      // Compatibility hack
      // Replace 'getInitialState' property with '_getInitialState'
      // to avoid warning message in React
      propName = propName === 'getInitialState' ? '_getInitialState' : propName;

      // Set useful variable
      var rule          = rules[propName] || defaultRule;
      var prototypeProp = factory.prototype[propName];
      var mixinProp     = mixin[propName];

      // Compatibility hack
      // Merge result of 'getDefaultProps' to 'defaultProps' factory property
      if (propName === 'getDefaultProps') {
        factory.defaultProps = Object.assign(factory.defaultProps || {}, apply(this, mixinProp));
      }

      // Compatibility hack
      // Merge 'propTypes to 'propTypes' factory property
      else if (propName === 'propTypes') {
        factory.propTypes = Object.assign(factory.propTypes || {}, mixinProp);
      }

      // Compatibility hack
      // Merge statics with factory
      else if (propName === 'statics') {
        Object.assign(factory, mixinProp);
      }

      // Ignore non function property, set factory prototype property to rule wrapper
      else if (isFunction(mixinProp)){
        factory.prototype[propName] = rule(prototypeProp, mixinProp, propName);
      }
    });
  });
};


// ---------------
// Define built-in rules
// ---------------

// Can be defined only once
Mixins.ONCE = function(prototypeProp, mixinProp, propName) {

  invariant(
    isDefinedOnce(prototypeProp, mixinProp),
    `You are attempting to define \`${propName}\` on your component more than once. ` +
    `This conflict may be due to a mixin.`
  );

  return function(...args) {
    return apply(this, prototypeProp || mixinProp, ...args);
  };
};

// Can be defined multiple times
Mixins.MANY = function(prototypeProp, mixinProp, propName, shouldMerge = false) {
  return function(...args) {
    return (apply(this, mixinProp, ...args) || true) && apply(this, prototypeProp, ...args);
  };
};

// Can be defined multiple times, and merge results
Mixins.MANY_MERGED = function(prototypeProp, mixinProp, propName) {
  return function(...args) {
    var mixinResult     = apply(this, mixinProp, ...args) || {};
    var prototypeResult = apply(this, prototypeProp, ...args) || {};

    invariant(
      isObject(prototypeResult) && isObject(mixinResult),
      `\`${propName}\` must return an object or null.`
    );

    return Object.assign({}, mixinResult, prototypeResult);
  };
};
