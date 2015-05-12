# React Class Helper [![npm version](https://badge.fury.io/js/react-class-helper.svg)](http://badge.fury.io/js/react-class-helper)

> Helper for ES6 class with React (autobind, mixins, ...)

# /!\ Deprecated
This project is no longer maintained. Please use [react-mixin](https://github.com/brigand/react-mixin) instead.

## Installation

`npm install react-class-helper`

To see how to use ES6 class with React, please check this [post](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#es6-classes)


## Usage
This library provides two elements: `Component` and `Mixins`. They can be used together or separately.


### Component

`Component` extends React's Component built-in class to provide [auto-binding](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#autobinding).

> React.createClass has a built-in magic feature that bound all methods to this automatically for you. This can be a little confusing for JavaScript developers that are not used to this feature in other classes, or it can be confusing when they move from React to other classes.

> Therefore we decided not to have this built-in into React's class model. You can still explicitly prebind methods in your constructor if you want.

<br>
So it means that currently you have to do this:

```js
import React from 'react';

class MyButton extends React.Component {
  constructor(props) {
    super(props);

    // Explicitly prebind methods in your constructor
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    // If not prebind, this === window (global object in browser)
    this.setState({ clicked: true });
  }

  render() {
    return (
      <button onClick={this.onClick}>My button</button>
    );
  }
}
```

<br>
With your component extending `Component` class, you can do this:

```js
// Note, I left React module because the JSX tags are transformed
// to `React.createElement` so we still need to import this module
import React from 'react';
import { Component } from 'react-class-helper';

// Extending `Component` instead of `React.Component`
class MyButton extends Component {
  constructor(props) {
    super(props);
    // Use `super(props, false);` to not autobind
    // Or `this.bind(['onClick']);` to bind only some methods
  }

  onClick() {
    // Automatically bind to class instance
    this.setState({ clicked: true });
  }

  render() {
    return (
      <button onClick={this.onClick}>My button</button>
    );
  }
}
```


### Mixins
`Mixins` provides **compatibility** with `React.createClass` mixins. Original idea from [react-mixin](https://github.com/brigand/react-mixin).

> Unfortunately, we will not launch any mixin support for ES6 classes in React. That would defeat the purpose of only using idiomatic JavaScript concepts.

> There is no standard and universal way to define mixins in JavaScript. In fact, several features to support mixins were dropped from ES6 today. There are a lot of libraries with different semantics. We think that there should be one way of defining mixins that you can use for any JavaScript class. React just making another doesn't help that effort.

But if you still want to use mixins with ES6 class. See below how.

<br/>
`Mixins(componentClass, mixins = [], options = {})`

- `componentClass`  Component factory (not class instance).
- `mixins`          Array of mixin objects.
- `options`
  - `defaultRule`   Default rule to apply to property not defined in `rules`  
  - `rules`         Map mixin properties to rules

```js
// This is the default options
{
  rules: {
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
  },
  defaultRule:                 Mixins.ONCE
}

```
<br/>
Built-in rules
- `Mixins.ONCE` Property can be defined only once in component or mixin
- `Mixins.MUlTI` Property can be defined multiple times in component or mixin, execution order is from left to right in mixins array and then component.
- `Mixins.MULTI_MERGED` Property can be defined multiple times in component or mixin, execution order is from left to right in mixins array and then component. Merge all results into one. Must returns objects or null.


<br/>
Example:

```js
import React from 'react';
import { Component, Mixins } from 'react-class-helper';

// Define component
class MyButton extends Component {
  constructor(props) {
    super(props);

    // `Component` class set `this.state` from `_getInitialState()` automatically
    // If you use the built-in `React.Component` you have to call it explicitly
    //
    // this.state = Object.assign({}, this._getInitialState());
  }

  // If you use the built-in `React.Component` you must declare
  // this method explicitly
  //
  // _getInitialState() {
  //   return {};
  // }

  onClick() {
    this.setState({ clicked: true });
  }

  componentDidMount() {
    console.log('called `componentDidMount` from MyButton');
  }

  render() {
    return (
      <button onClick={this.onClick}>My button</button>
    );
  }
}

// Define some mixins
var myMixin1 = {
  componentDidMount() {
    console.log('called `componentDidMount` from Mixin1');
  }
};

var myMixin2 = {
  componentDidMount() {
    console.log('called `componentDidMount` from Mixin2');
  },

  // Objects are ignored except 'statics' and 'propTypes'
  someObject: {}, // Ignore

  propTypes: { // Merge into `MyButton.propTypes`
    myProp: React.PropTypes.string
  },

  statics: { // Merge into `MyButton`
    queries: {}
  },

  getDefaultProps() { // Merge into `MyButton.defaultProps`
    return { myProp: 'myProp' };
  },

  getInitialState() { // Rename to `_getInitialState` to avoid React's warning
                      // Call in component constructor and merge result
    return { myState: 'myState'};
  },

  shouldComponentUpdate() { // Throw error if defined in other mixin
    return true;
  }
};

// Set mixins to component
Mixins(MyButton, [myMixins1, myMixin2]);
```

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/SimonDegraeve/react-class-helper/issues).

## License MIT

The MIT License

Copyright 2015, Simon Degraeve

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
