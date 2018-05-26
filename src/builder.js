var promise_view_loader = load("./index.js"); // TODO - when clientside_require can deal with cyclical dependencies, change this to require
var Builder = function(dom, generate, hydrate, view_identifier){
    this.dom = dom;
    this.generate = generate;
    this.hydrate = hydrate;
    this.view_identifier = view_identifier;
    this.build_id_enumerator = 0;
}
Builder.prototype = {
    build : async function(options, render_location, dom_to_hydrate){
        // normalize options
        if(typeof options == "undefined") options = null;

        /*
            note: we sepearate build and _build
                so that we can ask the server to wait for this build function if `currently_rendering_on_server`
            _build does the actual work
        */
        // define the function
        var promise_dom = this._build(options, render_location, dom_to_hydrate);

        // if `currently_rendering_on_server` is defined, ask `content_rendered_manager` to `wait_for` this promise
        var currently_rendering_on_server = window.root_window.currently_rendering_on_server === true; // if rendering on server, the root_window will have the property `currently_rendering_on_server` s.t. `currently_rendering_on_server==true`
        if(currently_rendering_on_server) window.root_window.content_rendered_manager.wait_for(promise_dom.catch(()=>{})); // note, .catch() at the end since build errors just mean that the build function has finished in this context

        // return the function
        return promise_dom;
    },
    _build : async function(options, render_location, dom){
        // define reused constants
        var encoded_options = window.btoa(JSON.stringify(options));

        // define readability constants
        var generate_is_defined = this.generate !== false;
        var hydrate_is_defined = this.hydrate !== false;
        var render_on_server = !(render_location == "client"); // if not on client, assume render on server
        var hydrate_provided_dom = render_location === "hydrate"; // defined if we should be hydrating a child node
        var currently_rendering_on_server = window.root_window.currently_rendering_on_server === true; // if rendering on server, the root_window will have the property `currently_rendering_on_server` s.t. `currently_rendering_on_server==true`

        // if currently_rendering_on_server and render_on_server not requested, throw error to reject the promise this async function returns;
        //      i.e., notify that this dom will not be resolving
        if(!render_on_server && currently_rendering_on_server) throw new Error("Will not render client view on server. This rejection is on purpose.")

        // if render_on_server requested, generate a unique_identifier and check that it has not already been rendered
        if(render_on_server){
            this.build_id_enumerator += 1; // enumerate build ids
            var query_string = '[ssr-enumerator="'+this.build_id_enumerator+'"][ssr-view_identifier="'+this.view_identifier+'"][ssr-build_options="'+encoded_options+'"]';
            if(!hydrate_provided_dom) var dom = window.root_window.document.querySelector(query_string); // try to find dom element; if hydrate_provided_dom, no need to look
        }
        var dom_found_rendered = (typeof dom != "undefined" && dom != null); // dom was found rendered if object is not undefined and not null

        // if rendered_on_server, hydrate any rendered view elements that are inside of this view;
        if(dom_found_rendered){
            var rendered_children = dom.querySelectorAll('[ssr-enumerator]');
            for(let child of rendered_children) await this.hydrate_rendered_child(child, dom);
        }

        // build
        if(!dom_found_rendered) var dom = this.dom.cloneNode(true); // 1. clone dom; dont create a new dom object if dom was already found rendered
        if(generate_is_defined && !dom_found_rendered) dom = await this.generate(dom, options) // 2. generate if defined; dont generate if dom was already found rendered
        if(hydrate_is_defined && !currently_rendering_on_server) dom = await this.hydrate(dom, options); // 3. hydrate if defined; dont hydrate if rendering on server

        // if render_on_server requested and the element was not already found rendered, attach the ssr-enumerator, ssr-view_identifier, and ssr-build_options to the newly rendered dom
        if(render_on_server && !dom_found_rendered && currently_rendering_on_server){ // only attach dom id if currently_rendering_on_server
            dom.setAttribute("ssr-enumerator", this.build_id_enumerator);
            dom.setAttribute("ssr-view_identifier", this.view_identifier);
            dom.setAttribute("ssr-build_options", encoded_options);
        }

        // if the dom was found rendered, attach the `rendered_on_server` attribute to true
        if(dom_found_rendered) dom.setAttribute('rendered_on_server', true);

        // if the dom was found rendered, remove the ssr-* attributes
        if(dom_found_rendered){
            dom.removeAttribute("ssr-enumerator");
            dom.removeAttribute("ssr-view_identifier");
            dom.removeAttribute("ssr-build_options");
        }

        // return built dom
        return dom; // return the generated and hydrated dom
    },
    hydrate_rendered_child : async function(child){
        var build_enumerator = child.getAttribute('ssr-enumerator');
        if(build_enumerator == null) return; // if build_enumerator is now null, then one of the child views was the parent of this child as well and hydrated it
        var view_identifier = child.getAttribute('ssr-view_identifier');
        var build_options_encoded = child.getAttribute('ssr-build_options');
        var build_options_string = window.atob(build_options_encoded);
        var build_options = JSON.parse(build_options_string);
        var view_loader = await promise_view_loader;
        await view_loader.load(view_identifier).build(build_options, "hydrate", child); // run build to hydrate the element
    },
}
module.exports = Builder;
