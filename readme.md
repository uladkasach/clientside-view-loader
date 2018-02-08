# clientside-view-loader

[![npm](https://img.shields.io/npm/v/clientside-view-loader.svg?style=flat-square)](https://www.npmjs.com/package/clientside-view-loader)
[![npm](https://img.shields.io/npm/dm/clientside-view-loader.svg)](https://www.npmjs.com/package/clientside-view-loader)

This is a npm nodule for the front end ([a cmm module](https://github.com/uladkasach/clientside-module-manager)) built to simplify the loading of view elements into a web page.


## Installation
`npm install clientside-view-loader --save`


## Example Usage

```js
require("clientside-view-loader")
    .then((view)=>{
        return view.load("views/modal/login_signup").generate()
    })
    .then((element)=>{
        document.querySelector("html").appendChild(element);
        element.show("login");  // functionality defined in /_views/modal/login_signup
    })
```
*note: this assumes you have already loaded the [clientside-module-manager](https://github.com/uladkasach/clientside-module-manager), for the `require()` functionality, into the window*


## Usage

A view element is is a DOM element, based in an html file `view.html`, which optionally requires a `view.css`.
`index.js` of the view will be given (`dom`) after all resources have loaded

### simple example

*directory structure*
```
a-cool-view/
    view.html
    index.js
project.html
```


*project.html*
```html
<script src = "/node_modules/clientside-module-manager/src/index.js"></script> <!-- defines require, promise_require, and cmm in global scope -->
<script>
    require("clientside-view-loader")
        .then((view)=>{
            view.load("a-cool-view").generate()
                .then((element)=>{
                    document.querySelector("body").appendChild(element);
                })
        })
</script>
```


*a-cool-view/view.html*
```html
<div>
    hello world!
</div>
```

*a-cool-view/index.js*
```js
var builder = { // this.dom is automatically appended on loading of this object
    generate : function(options){
        var element = this.dom.cloneNode(true); // clone the dom to build an elemenet, dont disturbe the original element

        // manipulate the element dom
        // attach element functionality

        return element;
    },
}

module.exports = builder; // see github.com/uladkasach/clientside-module-manager for more information
                          // builder is then cached to the view module
```



### example with functionality
```html
<script>
    require("clientside-view-loader")
        .then((view)=>{
            return view.load("views/modal/login_signup").generate()
        })
        .then((element)=>{
            document.querySelector("html").appendChild(element);
            element.show("login");  // functionality defined in /_views/modal/login_signup
        })
</script>
```


### extended example
check out the `/test/env/` directory for a fully working extended example.
