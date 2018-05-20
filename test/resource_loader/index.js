var assert = require('assert');
var resource_loader_path = process.env.src_root + "/resource_loader.js";


describe('path finding', function(){
    it('should find components for regular path request',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        var path_to_components = process.env.test_env_root + "/custom_node_modules/default_path_view_module";
        var paths = await resource_loader.retreive_paths(path_to_components);
        assert.equal(paths.generate, path_to_components + "/generate.js");
        assert.equal(paths.hydrate, path_to_components + "/hydrate.js");
        assert.equal(paths.html, path_to_components + "/view.html");
    })
    it('should find component_root for regular path request',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        var path_to_components = process.env.test_env_root + "/custom_node_modules/default_path_view_module";
        var paths = await resource_loader.retreive_paths(path_to_components);
        var component_root_found = paths.generate.split("/").slice(0,-1).join("/"); // remove file name from path
        assert.equal(component_root_found, path_to_components);
    })
    it('should determine component_root is in module_root by default',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var module_name = "default_path_view_module";
        var paths = await resource_loader.retreive_paths(module_name);
        var component_root_found = paths.generate.split("/").slice(0,-1).join("/"); // remove file name from path
        assert.equal(component_root_found,  window.clientside_require.modules_root+"/"+module_name);
    })
    it('should determine component_root is defined by package_json.component',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var module_name = "defined_path_view_module";
        var paths = await resource_loader.retreive_paths(module_name);
        var component_root_found = paths.generate.split("/").slice(0,-1).join("/"); // remove file name from path
        assert.equal(component_root_found,  window.clientside_require.modules_root+"/"+module_name+"/src");
    })
})
describe('loading resources', function(){
    it('should only load dom for dom only view',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_only");
        assert.equal(typeof resources.dom, "object", "dom should be defined");
        assert.equal(resources.generate, false);
        assert.equal(resources.hydrate, false);
    })
    it('dom should be loaded accurately',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_only");
        assert.equal(typeof resources.dom, "object", "dom should be an object");
        assert.equal(resources.dom.innerHTML, "hello", "content should be expected");
    })
    it('should load generate if defined',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_generate_hydrate");
        assert.equal(typeof resources.generate, "function");
    })
    it('should load hydrate if defined',  async function(){
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_generate_hydrate");
        assert.equal(typeof resources.hydrate, "function");
    })
})
