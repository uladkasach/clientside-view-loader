process.env.src_root = __dirname + "/../src";
process.env.test_env_root = __dirname + "/_env"

/*
    load testing dependencies
*/
var jsdom = require("jsdom");
var xmlhttprequest = require("xmlhttprequest");
var assert = require("assert");

/*
    provision environment to mimic browser environment
    - provision the window (specifically document & location)
        - provision the xmlhttprequest in the window as well
*/
global.window = new jsdom.JSDOM(``,{
    url: "file:///",
    resources: "usable", // load iframes and other resources
    runScripts : "dangerously", // enable loading of scripts - dangerously is fine since we are running code we wrote.
}).window;
window.XMLHttpRequest = xmlhttprequest.XMLHttpRequest; // append XMLHttpRequest to window

/*
    load the clientside_require module
*/
require("clientside-require"); // initializes clientside_require into the window global object

/*
    define constants
*/
var cache_path = process.env.src_root + "/cache.js";
var view_loader_path = process.env.src_root + "/index.js";

/*
    begin testing
*/
describe('resource_loader', function(){
    require('./resource_loader');
})
describe('builder', function(){
    require('./builder');
})
describe('load', function(){
    describe('syntax', function(){
        it('should initialize with clientside_require', async function(){
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
        })
    })
    describe('load', function(){
        it('should be able to load a view', async function(){
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var build = await view_loader.load("dom_only");
            assert.equal(typeof build, "function");
        })
        it('should be possible to build from load', async function(){
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var build = await view_loader.load("dom_only");
            var dom = await build();
            assert.equal(dom.outerHTML, "<div>hello</div>");
        })
    })
    describe('caching', function(){
        /*
            1. prevents redundent commands
            2. eliminates problems that arise from creating more than one 'builder' for the same object
                - critical for server side rendering in making the unique identifier
        */
        it('should be loadable', async function(){
            var cache = await window.clientside_require.asynchronous_require(cache_path);
        })
        it('should cache loaded views', async function(){
            var cache = await window.clientside_require.asynchronous_require(cache_path);
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var build = await view_loader.load("dom_only");
            assert.equal(typeof cache._cache["dom_only"], "object", "the cache should store a promise for the `dom_only` key");
        })
        it('should retreive the build function from cache for loaded views', async function(){
            var cache = await window.clientside_require.asynchronous_require(cache_path);
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var build = await view_loader.load("dom_only");
            var dom = await build();
            assert.equal(dom.outerHTML, "<div>hello</div>");
        })
    })
    describe('extra', function(){
        it('the promise should have the .build() functionality attached', async function(){
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var promise_build = view_loader.load("dom_only");
            assert.equal(typeof promise_build.build, "function", "promise_compiler.generate should be defined as a function")
        })
        it('should find that the .build() functionality passes options properly', async function(){
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var options = "option_data";
            var content = await view_loader.load("pass_options_back_module").build(options);
            assert.equal(content, options, "ensure the module returns the options");
        })
    })
})
