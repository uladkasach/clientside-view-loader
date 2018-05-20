var assert = require('assert');
var resource_loader_path = process.env.src_root + "/resource_loader.js";
var builder_path = process.env.src_root + "/builder.js";

describe('syntax', function(){
    it('should be loadable', async function(){
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
    })
})
describe('building', function(){
    it('it should be able to build a dom-only view',  async function(){
        // load resources
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_only");

        // create builder
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
        var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

        // build
        var dom = await builder.build();

        // make sure the content is expected
        assert.equal(dom.outerHTML, "<div>hello</div>");
    })
    it('should be able to generate while building', async function(){
        // load resources
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_generate");

        // create builder
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
        var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

        // build
        var dom = await builder.build();

        // make sure the content is expected
        assert.equal(dom.outerHTML, "<div>hello<img></div>");
    })
    it('should be able to hydrate while building', async function(){
        // load resources
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("dom_hydrate");

        // create builder
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
        var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

        // build
        var dom = await builder.build();

        // make sure the content is expected
        assert.equal(dom.outerHTML, "<div>hello</div>");
        assert.equal(typeof dom.awesome_action, "function", "a method should have been added to the dom element after hydration");
    })
})
return;
describe('serverside_rendering', function(){
    describe('render_location', function(){
        /*
            render location works with the clientside-view-server-side-renderer module to support serverside rendering.
            - when render_location = server:
                1. clientside-view-loader appends a unique identifier to the generated dom.
                    - unique_identifier = `view_id+generate_options+render_order_id`
                        - see https://github.com/uladkasach/clientside-view-loader/issues/3 for discussion of why
                    - e.g., `dom_element.setAttribute('serverside_rendering_identifier', unique_identifier)`
                2. clientside-view-loader then checks to see if the dom is rendered already (with the identifier).
                    - if already rendered, the dom was rendered on the server and only needs to be hydrated.
                    - if not already rendered, the dom needs to be fully rendered
                x. (meta step) - if render_location = server, the `hydrator.js` script must be defined by the view.
            - when render_location = client (by default):
                1. append promise_not_server_rendering to the dom loading chain so that it does not render on the server
        */
        it('should complain if the `hydrator` script is not found')
        it('should be able to create a unique identifier for a view.generate() request')
        it('should render a dom element with a unique id if not already rendered')
        it('should be able to find a dom element that has already been rendered on the server') // use unique id
        it('should not re-render a dom element that has already been rendered')
        it('should hydrate a dom element that has already been rendered')
    })
})
