'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (descriptor.value) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
// ---------------
// Import modules
// ---------------

var _React = require('react');

var _React2 = _interopRequireWildcard(_React);

// ---------------
// Define Component class
// ---------------

var Component = (function (_React$Component) {
  function Component(props) {
    var shouldAutoBind = arguments[1] === undefined ? true : arguments[1];

    _classCallCheck(this, Component);

    // Call 'React.Component' constructor
    _get(Object.getPrototypeOf(Component.prototype), 'constructor', this).call(this, props);

    // Set initial state to merged object from '_getInitialState()'
    this.state = Object.assign({}, this._getInitialState(), this.state);

    // If options `shouldAutoBind` is true (default),
    // bind all methods to class instance (instead of window in browser)
    if (shouldAutoBind) {
      this.autoBind();
    }
  }

  _inherits(Component, _React$Component);

  _createClass(Component, [{
    key: 'bind',

    // Bind an array of method name to class instance
    value: function bind(methods) {
      var _this = this;

      methods.forEach(function (method) {
        _this[method] = _this[method].bind(_this);
      });
    }
  }, {
    key: 'autoBind',

    // Bind all methods to class instance
    value: function autoBind() {
      var _this2 = this;

      this.bind(Object.getOwnPropertyNames(this.constructor.prototype).filter(function (prop) {
        return typeof _this2[prop] === 'function';
      }));
    }
  }, {
    key: '_getInitialState',

    // Compatibility hack
    // 'getInitialState' throw a warning in React class, use '_getInitialState' instead
    // When using mixin, 'getInitialState' from mixins are rename to this method
    value: function _getInitialState() {
      return {};
    }
  }]);

  return Component;
})(_React2['default'].Component);

exports['default'] = Component;
module.exports = exports['default'];