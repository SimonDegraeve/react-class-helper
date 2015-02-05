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

function isObjectOrNull(object) {
  return isObject(object) || isNull(object);
};

function isFunction(object) {
  return getType(object) === '[object Function]';
};

function getOrCall(object) {
  return !isFunction(object) ? object : function(...args) { return object.apply(this, ...args); }
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
  var defaultRule           = options.defaultRule || Mixins.ONCE;
  var rules                 = Object.assign(getDefaultRules(), options.rules);
  var getInitialStateFnName = '_getInitialState';

  // Loop over mixins in reverse order
  mixins.reverse().forEach((mixin, index) => {

    // Loop over mixin property, ignore non function properties except 'propTypes' and 'statics'
    Object
      .keys(mixin)
      .forEach(key => {
        var mixinProperty = mixin[key];
        var rule          = rules[key] || defaultRule;

        // Compatibility hack
        // Merge result of 'getDefaultProps' to 'defaultProps' factory property
        if (key === 'getDefaultProps') {
          factory.defaultProps = Object.assign(factory.defaultProps || {}, apply(this, mixinProperty));
        }

        // Compatibility hack
        // Merge 'propTypes to 'propTypes' factory property
        else if (key === 'propTypes') {
          factory.propTypes = Object.assign(factory.propTypes || {}, mixinProperty);
        }

        // Compatibility hack
        // Replace 'getInitialState' function name with getInitialStateFnName value
        // to avoid warning message in React
        else if (key === 'getInitialState') {
          factory.prototype[getInitialStateFnName] = getOrCall(
            rule(factory.prototype[getInitialStateFnName], mixinProperty, key)
          );
        }

        // Merge statics with factory
        else if (key === 'statics') {
          Object.assign(factory, mixinProperty);
        }

        // Set function with rule wrapper to factory prototype property
        else if (isFunction(mixinProperty)){
          factory.prototype[key] = getOrCall(
            rule(factory.prototype[key], mixinProperty, key)
          );
        }
    });
  });
};


// ---------------
// Define built-in rules
// ---------------

// Can be defined only once
Mixins.ONCE = function(left, right, key) {

  invariant(
    isDefinedOnce(left, right),
    `You are attempting to define \`${key}\` on your component more than once. ` +
    `This conflict may be due to a mixin.`
  );

  return function(...args) {
    return apply(this, left || right, ...args);
  };
};

// Can be defined multiple times
Mixins.MANY = function(left, right, key) {
  return function(...args) {
    return (apply(this, right, ...args) || true) && apply(this, left, ...args);
  };
};

// Can be defined multiple times, and merge results
Mixins.MANY_MERGED = function(left, right, key) {
  return function(...args) {
    var resultRight = apply(this, right, ...args);
    var resultLeft  = apply(this, left, ...args);

    invariant(
      isObjectOrNull(resultRight) && isObjectOrNull(resultLeft),
      `\`${key}\` must return an object or null.`
    );

    return Object.assign(resultRight || {}, resultLeft);
  };
};
