# clientside-view-loader

[![npm](https://img.shields.io/npm/v/clientside-view-loader.svg?style=flat-square)](https://www.npmjs.com/package/clientside-view-loader)
[![npm](https://img.shields.io/npm/dm/clientside-view-loader.svg)](https://www.npmjs.com/package/clientside-view-loader)

This is a npm nodule for the front end ([a clientside-require based module](https://github.com/uladkasach/clientside-module-manager)) built to simplify the loading of view elements into a web page.


## Installation
`npm install clientside-view-loader --save`


## Example

```js
load("clientside-view-loader")
    .then(view=>view.load("clientside-view-modal-login_signup").build()) // installable with `npm install clientside-view-modal-login_signup`
    .then((dom)=>{
        document.querySelector("html").appendChild(dom);
        dom.show("login");  // functionality attached to the dom element with `hydrate.js`
    })
```
*note: this assumes you have already loaded the [clientside-require](https://github.com/uladkasach/clientside-require), for the `load()` functionality, into the window*


## Usage

A view is created based on an html file, `view.html`, an optional `generate()` function defined in `generate.js`, and an optional `hydrate()` function defined in `hydrate.js`. `css` dependencies can also be easily loaded.


*example directory structure*

```
your-view/
    generate.js
    hydrate.js
    view.html
    styles.css
```

After defining all view components you wish to define, you can load the view by passing the path to the directory where the components are found to the view loader. The resolves with a build function:
```js
var path_to_components = "/your-view"
var promise_build_function = load('clientside-view-loader')
    .then(view=>view.load(path_to_components))
    .then(build=>...)
```

The build function takes the DOM generated from the `view.html` file, passes it through the `generate` function (if defined), passes the result to the `hydrate` function (if defined), and returns the result. Generally:
```js
var build = async function(options, render_location){
    var dom = dom.cloneNode(true); // 1. deep clone dom
    if(generate_is_defined) dom = generate(dom, options) // 2. generate if defined
    if(hydrate_is_defined) dom = hydrate(dom, options); // 3. hydrate if defined
    return dom; // return the generated and hydrated dom
}
```
*Note: the above is not the full build function but demonstrates the main logic.*

The `generate` function is used to build views dynamically. The `hydrate` function is used to append functionality to the rendered `dom` (e.g., `login_dom.show('signup')` or `cart_dom.update_item_count()`). `generate` and `hydrate` are explicitly separated to support server side rendering.

#### Server Side Rendering
Server side rendering is as simple as setting up a `proxy` server. By default the clientside-view-loader assumes that all modules should be rendered on the server if possible. To specifically exclude a view from being rendered on the server, set the `render_location` flag to "client". Example:
```js
view.load(path_to_components).build(options, "client");
```

Details on setting up the proxy server and server side rendering with clientside-view-loader can be found [here](https://github.com/uladkasach/clientside-view-serverside-renderer).

#### More Documentation
The most precise documentation will always be found in the `/test` directory. It has been written to facilitate readability. Please navigate it for more examples with verbal descriptions of what the module can do.

# Examples
coming soon

### extended examples
check out the `/test/env/` directory for fully working examples.


# Building a View Module
Typically it is best to build a working view before packaging the view as a reusable module. After you have a working `generate.js`, `view.html`, and optional `hydrate.js`, build a npm module that contains these files and list `clientside-view-loader` as a dependency.

After publishing the module and later installing it in a project you'd like to use it in, you will be able to load the view by module name. (e.g., `view.load("module_name").build()`
### package.json options
#### components
You can modify the directory in which the view-loader will search for your components by defining the `components` property in the package.json.
For example, if you want the view-loader to look for components in the directory "src", set `"components" : "src"`.

You can additionally tell the view-loader that the module does not have a `hydrate` or a `generate` script. This way, the loader will not spend time attempting to open the file and will not produce a 404 error in your console. This can be done by, for example, setting `"components" : { "generate" : false, "hydrate" : "path/to/hydrate"}`.

To do both,
```json
"components" : {
    "root" : "src",
    "generate" : false,
    "hydrate" : "path/to/hydrate"
}

```
