# cmm-view-loader

[![npm](https://img.shields.io/npm/v/cmm-view-loader.svg?style=flat-square)](https://www.npmjs.com/package/cmm-view-loader)
[![npm](https://img.shields.io/npm/dm/cmm-view-loader.svg)](https://www.npmjs.com/package/cmm-view-loader)

This is a npm nodule for the front end ([a cmm module](https://github.com/uladkasach/clientside-module-manager)) built to simplify the loading of view elements into a web page.


### Installation
`npm install view-loader --save`


### Usage

A view element is is a DOM element, based in an html file `view.html`, which optionally requires a `view.css`.
`index.js` of the view will be given (`dom`) after all resources have loaded

#### full example
check out the `/test/env/` directory for a fully working example.

#### simple example

directory structure
```
a-cool-view/
    view.html
    index.js
project.html
```

a-cool-view/index.js
```js
    var builder = {
        initialize : function(dom){ // the initialize function is triggered by the view-loader module and passes the dom content of the `view.html` file

        },
        generate : function(options){

        },
    }

    module.exports = builder; // see github.com/uladkasach/clientside-module-manager for more information
```

a-cool-view/view.html
```html
<div>
    hello world!
</div>
```


project.html
```html
<script src = "/node_modules/clientside-module-manager/src/index.js"></script> <!-- defines require, promise_require, and cmm in global scope -->
<script>
    require("cmm-view-loader")
        .then((view)=>{
            view.load("a-cool-view").generate()
                .then((element)=>{
                    document.querySelector("body").appendChild(element);
                })
        })
</script>
```


#### example with functionality
```html
<script>
    require("cmm-view-loader")
        .then((view)=>{
            view.load("views/modal/login_signup").generate()
            .then((element)=>{
                document.querySelector("html").appendChild(element);
                element.show("login");  // functionality defined in /_views/modal/login_signup
            })
        })
</script>
```
