var assert = require('assert');
var resource_loader_path = process.env.src_root + "/resource_loader.js";
var builder_path = process.env.src_root + "/builder.js";
var Dynamic_Serial_Promise_All = require("dynamic-serial-promise-all");

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
    it('should be able to handle async generate', async function(){
        // load resources
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("async_generate");

        // create builder
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
        var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

        // build
        var dom = await builder.build();

        // make sure the content is expected
        assert.equal(dom.outerHTML, "<div>hello<img></div>");
    })
    it('should be able to handle async hydrate', async function(){
        // load resources
        var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
        window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
        var resources = await resource_loader.load_resources("async_hydrate");

        // create builder
        var Builder = await window.clientside_require.asynchronous_require(builder_path);
        var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

        // build
        var dom = await builder.build();

        // make sure the content is expected
        assert.equal(typeof dom.awesome_action, "function", "a method should have been added to the dom element after hydration");
    })
})
describe('serverside_rendering', function(){
    describe('render_location', function(){
        /*
            render location works with the clientside-view-server-side-renderer module to support serverside rendering.
            - when render_location = server:
                1. clientside-view-loader appends a unique identifier to the generated dom.
                    - unique_identifier = `view_id+generate_options+render_order_id`
                        - see https://github.com/uladkasach/clientside-view-loader/issues/3 for discussion of why
                    - e.g., `dom_element.setAttribute('ssr-identifier', unique_identifier)`
                2. clientside-view-loader then checks to see if the dom is rendered already (with the identifier).
                    - if already rendered, the dom was rendered on the server and only needs to be hydrated.
                    - if not already rendered, the dom needs to be fully rendered
            - when render_location = client (by default):
                1. append promise_not_server_rendering to the dom loading chain so that it does not render on the server
        */
        it('should be able to create a unique identifier for a build request', async function(){
            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(null, null, null, 'an_awesome_view');
            var unique_identifier = builder.generate_unique_identifier();
        })
        it('should create unique identifiers even if view and options are identical', async function(){
            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(null, null, null, 'an_awesome_view');
            var unique_identifier_one = builder.generate_unique_identifier();
            var unique_identifier_two = builder.generate_unique_identifier();
            assert.notEqual(unique_identifier_one, unique_identifier_two);
        })
        it('should render a dom element with a unique id if not already rendered - for server side', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');
            assert.equal(typeof dom.getAttribute("ssr-identifier"), "string", "ssr-identifier should be a string");

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should render a dom element on the server by default', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null);

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');
            assert.equal(typeof dom.getAttribute("ssr-identifier"), "string", "ssr-identifier should be a string");

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should not produce a ssr-identifier if not currently_rendering_on_server', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // build
            var dom = await builder.build(null);

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div>hello</div>');
            assert.equal(dom.getAttribute("ssr-identifier"), null, "ssr-identifier should be null");
        })
        it('should be able to find a dom element that has already been rendered', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');
            assert.equal(typeof dom.getAttribute("ssr-identifier"), "string", "ssr-identifier should be a string");

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // get the identifier
            var ssr_identifier = dom.getAttribute("ssr-identifier");

            // search for the element
            var found_dom = window.document.querySelector("[ssr-identifier='"+ssr_identifier+"']");

            // assert element is the same
            assert.equal(dom, found_dom);

            // clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
            dom.remove();
        })
        it('should be able to find a dom element that has already been rendered - build method on client', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');
            assert.equal(typeof dom.getAttribute("ssr-identifier"), "string", "ssr-identifier should be a string");

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // get the identifier
            var ssr_identifier = dom.getAttribute("ssr-identifier");

            // reset the builders build_id_enumerator
            builder.build_id_enumerator = 0;

            // define we are now again on client
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;

            // build again - we should find the already made element and not have rendered it again
            var found_dom = await builder.build(null, "server");

            // check that dom are equal
            assert.equal(dom.getAttribute('rendered_on_server'), "true", "should be defined as rendered on server");
            assert.equal(dom, found_dom); // the objects should be equal

            // remove the element from dom to conclude the test
            dom.remove();
        })
        it('should not re-render a dom element that has already been rendered', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // modify the dom - we will check that this modification persists
            dom.className = "modification";

            // reset the builders build_id_enumerator
            builder.build_id_enumerator = 0;

            // define we are now again on client
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;

            // build again - we should find the already made element and not have rendered it again
            var found_dom = await builder.build(null, "server");

            // assert that it was not re-rendered
            assert.equal(dom.className, "modification", "class name should have remained") // if we re-render it, the classname would have dissapeared

            // remove the element from dom to conclude the test
            dom.remove();
        })
        it('should not re-generate a dom element that has already been rendered', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_generate");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello<img></div>');

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // reset the builders build_id_enumerator
            builder.build_id_enumerator = 0;

            // define we are now again on client
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;

            // build again - we should find the already made element and not have rendered it again
            var found_dom = await builder.build(null, "server");

            // assert that it was not re-generated
            assert.equal(dom.querySelectorAll("img").length, 1, "there should only be one image"); // if regenerated, then two image elements would be provided
            assert.equal(dom.outerHTML, '<div rendered_on_server="true">hello<img></div>');

            // remove the element from dom to conclude the test
            dom.remove();
        })
        it('should not hydrate a dom that is being built on the server', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_hydrate");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello</div>');
            assert.equal(typeof dom.awesome_action, "undefined", "the method attached to the dom during hydration should not have been attached");

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should hydrate a dom that has already been rendered, on the client', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_hydrate");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            /*
                generate on "server"
            */
            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(typeof dom.awesome_action, "undefined", "the method attached to the dom during hydration should not have been attached");

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // change environment to client
            window.currently_rendering_on_server = null; // not currently_rendering_on_server
            window.content_rendered_manager = null;
            builder.build_id_enumerator = 0; // restart the build_id_enumerator

            /*
                hydrate on "client"
            */
            // build
            var dom = await builder.build(null, "server");

            // check that it was hydrated
            assert.equal(typeof dom.awesome_action, "function", "a method should have been added to the dom element after hydration");

            // clean environment
            dom.remove();
        })
        it('should not build views on the server that are ment to be rendered on the client', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            try {
                var dom = await builder.build(null, "client");
                throw new Error("should not have reached here");
            } catch(err) {
                assert.equal(err.message, "Will not render client view on server. This rejection is on purpose.")
            }

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should have `content_rendered_manager.wait_for()` each build() request if `currently_rendering_on_server`', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("dom_only");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All(10);

            // build on server
            var dom = await builder.build(null, "server");

            // build on client
            try{ var dom = await builder.build(null, "client"); } catch(err){}

            // check that promise content rendered was set
            var content_rendered = await window.content_rendered_manager.promise_all;
            assert.equal(content_rendered.length, 2, "we should find exactly two dom's that we were waiting for");

            // remove the window properties to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should be able to .build in a .generate on the server', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("build_in_generate");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello<div ssr-identifier="L3Zhci93d3cvZ2l0L01vcmUvY2xpZW50c2lkZS12aWV3LWxvYWRlci90ZXN0L19lbnYvY3VzdG9tX25vZGVfbW9kdWxlcy9kb21fb25seS1udWxsLTA=" ssr-view_identifier="/var/www/git/More/clientside-view-loader/test/_env/custom_node_modules/dom_only" ssr-build_options="bnVsbA==">hello</div></div>');

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
        })
        it('should be able to find rendered dom for views .built in a .generate', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("build_in_generate_hydration");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello<div ssr-identifier="L3Zhci93d3cvZ2l0L01vcmUvY2xpZW50c2lkZS12aWV3LWxvYWRlci90ZXN0L19lbnYvY3VzdG9tX25vZGVfbW9kdWxlcy9kb21faHlkcmF0ZS1udWxsLTA=" ssr-view_identifier="/var/www/git/More/clientside-view-loader/test/_env/custom_node_modules/dom_hydrate" ssr-build_options="bnVsbA==">hello</div></div>');

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // change environment to client
            window.currently_rendering_on_server = null; // not currently_rendering_on_server
            window.content_rendered_manager = null;
            builder.build_id_enumerator = 0; // restart the build_id_enumerator

            // build again - we should find the already made element and not have rendered it again
            var found_dom = await builder.build(null, "server");
            assert.equal(dom.outerHTML, '<div rendered_on_server="true">hello<div rendered_on_server="true">hello</div></div>');

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
            dom.remove();
        })
        it('should be able to hydrate server rendered views .built in a .generate', async function(){
            // load resources
            var resource_loader = await window.clientside_require.asynchronous_require(resource_loader_path);
            window.clientside_require.modules_root = process.env.test_env_root + "/custom_node_modules"; // define new modules root
            var resources = await resource_loader.load_resources("build_in_generate_hydration");

            // create builder
            var Builder = await window.clientside_require.asynchronous_require(builder_path);
            var builder = new Builder(resources.dom, resources.generate, resources.hydrate);

            // define that we are rendering on server
            window.currently_rendering_on_server = true;
            window.content_rendered_manager = new Dynamic_Serial_Promise_All();

            // build
            var dom = await builder.build(null, "server");

            // make sure the content is expected
            assert.equal(dom.outerHTML, '<div ssr-identifier="dW5kZWZpbmVkLW51bGwtMA==" ssr-view_identifier="undefined" ssr-build_options="bnVsbA==">hello<div ssr-identifier="L3Zhci93d3cvZ2l0L01vcmUvY2xpZW50c2lkZS12aWV3LWxvYWRlci90ZXN0L19lbnYvY3VzdG9tX25vZGVfbW9kdWxlcy9kb21faHlkcmF0ZS1udWxsLTA=" ssr-view_identifier="/var/www/git/More/clientside-view-loader/test/_env/custom_node_modules/dom_hydrate" ssr-build_options="bnVsbA==">hello</div></div>');

            // attach the dom to the document
            window.document.body.appendChild(dom);

            // change environment to client
            window.currently_rendering_on_server = null; // not currently_rendering_on_server
            window.content_rendered_manager = null;
            builder.build_id_enumerator = 0; // restart the build_id_enumerator

            // build again - we should find the already made element and not have rendered it again
            var found_dom = await builder.build(null, "server");
            assert.equal(dom.outerHTML, '<div rendered_on_server="true">hello<div rendered_on_server="true">hello</div></div>');

            // make sure the child dom is hydrated
            var found_child_dom = found_dom.querySelector("div");
            assert.equal(typeof found_child_dom.awesome_action, "function", "a method should have been added to the dom element after hydration");

            // remove the window property to clean up after test
            window.currently_rendering_on_server = null;
            window.content_rendered_manager = null;
            dom.remove();
        })
    })
})
