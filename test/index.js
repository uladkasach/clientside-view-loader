process.env.src_root = __dirname + "/../src";
process.env.test_env_root = __dirname + "/_env"

/*
    load testing dependencies
*/
var jsdom = require("jsdom");
var xmlhttprequest = require("xmlhttprequest");
var assert = require("assert");
var Dynamic_Serial_Promise_All = require("dynamic-serial-promise-all");

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
            1. prevents redundent commands / speeds up loading
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
    describe('serverside_rendering', function(){
        it('should ask `window.content_rendered_manager` to `wait_for()` for every `load()` that is requested', async function(){
            /*
                this is nessesary, in `currently_rendering_on_server` mode only, so that we wait untill all async content is fully rendered.
            */
            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All(10);

            // build on server
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var build = await view_loader.load("dom_only");
            var dom = await build(null, "server");

            // check that promise content rendered was set
            var content_rendered = await window.content_rendered_manager.promise_all;
            assert.equal(content_rendered.length, 2, "we should find the build function and the dom that we were waiting for");

            // remove the window properties to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
    })
})
