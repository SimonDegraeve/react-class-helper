// ---------------
// Import modules
// ---------------
import React from 'react';


// ---------------
// Define Component class
// ---------------
export default class Component extends React.Component {

  constructor(props, shouldAutoBind = true) {

    // Call 'React.Component' constructor
    super(props);

    // Set initial state to merged object from '_getInitialState()'
    this.state = Object.assign({}, this._getInitialState(), this.state);

    // If options `shouldAutoBind` is true (default),
    // bind all methods to class instance (instead of window in browser)
    if (shouldAutoBind) {
      this.autoBind();
    }
  }

  // Bind an array of method name to class instance
  bind(methods) {
    methods.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  // Bind all methods to class instance
  autoBind() {
    this.bind(
      Object.getOwnPropertyNames(this.constructor.prototype)
        .filter(prop => typeof this[prop] === 'function')
    );
  }

  // Compatibility hack
  // 'getInitialState' throw a warning in React class, use '_getInitialState' instead
  // When using mixin, 'getInitialState' from mixins are rename to this method
  _getInitialState() {
    return {};
  }
}
