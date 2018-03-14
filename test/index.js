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
    begin testing
*/
describe('basic', function(){
    it('should initialize', function(){
        require(process.env.src_root + "/index.js");
    })
    it('should initialize with clientside_require', async function(){
        var view_loader_path = process.env.src_root + "/index.js";
        var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
    })
})
describe('load', function(){
    describe('path finding', function(){
        it('should be able to find non-module paths',  async function(){
            var view_loader_path = process.env.src_root + "/index.js";
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            var paths = await view_loader.retreive_paths(process.env.test_env_root + "/custom_node_modules/default_path_view_module");
            assert.equal(paths.compiler, process.env.test_env_root + "/custom_node_modules/default_path_view_module/compiler.js");
        })
        it('should determine content_root is in module_root by default',  async function(){
            var view_loader_path = process.env.src_root + "/index.js";
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var paths = await view_loader.retreive_paths("default_path_view_module");
            assert.equal(paths.compiler,  window.clientside_require.modules_root  +  "/default_path_view_module/compiler.js");
        })
        it('should determine content_root is in directory of compiler if defined with `main`',  async function(){
            var view_loader_path = process.env.src_root + "/index.js";
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var paths = await view_loader.retreive_paths("defined_path_view_module");
            assert.equal(paths.compiler, window.clientside_require.modules_root + "/defined_path_view_module/src/compiler.js");
        })
        it('should throw error if `main` does not define a compiler.js',  async function(){
            var view_loader_path = process.env.src_root + "/index.js";
            var view_loader = await window.clientside_require.asynchronous_require(view_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            try {
                var paths = await view_loader.retreive_paths("non_compiler_defined_path_view_module");
                throw new Error("an error should have been thrown");
            } catch (error){
                assert.equal(error.message, "view module main must be `compiler.js` - invalid module")
            }
        })
    })
    describe('loading', function(){
        it('should throw error if compiler file does not exist')
        it('should throw error if compiler does not have a generate function')
        it('should throw error if html file does not exist')
        it('should load compiler and view for a package')
        it('should wrap compilers generate function to inject dom_clone')
     })
    describe('extra', function(){
        it('should have the .generate() functionality attached')
    })
})
