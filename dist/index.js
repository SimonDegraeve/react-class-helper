'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
// ---------------
// Import modules
// ---------------

var _Component = require('./component');

var _Component2 = _interopRequireWildcard(_Component);

var _Mixins = require('./mixins');

var _Mixins2 = _interopRequireWildcard(_Mixins);

// ---------------
// Export library
// ---------------
exports['default'] = { Component: _Component2['default'], Mixins: _Mixins2['default'] };
module.exports = exports['default'];