var Builder = function(dom, generate, hydrate, view_identifier){
    this.dom = dom;
    this.generate = generate;
    this.hydrate = hydrate;
    this.view_identifier = view_identifier;
    this.build_id_enumerator = 0;
}
Builder.prototype = {
    build : async function(options, render_location){
        /*
            note: we sepearate build and _build
                so that we can ask the server to wait for this build function if `currently_rendering_on_server`
            _build does the actual work
        */
        // define the function
        var promise_dom = this._build(options, render_location);

        // if `currently_rendering_on_server` is defined, ask `content_rendered_manager` to `wait_for` this promise
        var currently_rendering_on_server = window.root_window.currently_rendering_on_server === true; // if rendering on server, the root_window will have the property `currently_rendering_on_server` s.t. `currently_rendering_on_server==true`
        if(currently_rendering_on_server) window.root_window.content_rendered_manager.wait_for(promise_dom.catch(()=>{})); // note, .catch() at the end since build errors just mean that the build function has finished in this context

        // return the function
        return promise_dom;
    },
    _build : async function(options, render_location){
        // define readability constants
        var generate_is_defined = this.generate !== false;
        var hydrate_is_defined = this.hydrate !== false;
        var render_on_server = render_location == "server"; // otherwise, assume render on client
        var currently_rendering_on_server = window.root_window.currently_rendering_on_server === true; // if rendering on server, the root_window will have the property `currently_rendering_on_server` s.t. `currently_rendering_on_server==true`

        // if currently_rendering_on_server and render_on_server not requested, throw error to reject the promise this async function returns;
        //      i.e., notify that this dom will not be resolving
        if(!render_on_server && currently_rendering_on_server) throw new Error("Will not render client view on server. This rejection is on purpose.")

        // if render_on_server requested, generate a unique_identifier and check that it has not already been rendered
        if(render_on_server){
            var serverside_rendering_identifier = this.generate_unique_identifier(options); // generate unique id
            var dom = window.root_window.document.querySelector('[serverside_rendering_identifier="'+serverside_rendering_identifier+'"]');
        }
        var dom_found_rendered = (typeof dom != "undefined" && dom != null); // dom was found rendered if object is not undefined and not null

        // build
        if(!dom_found_rendered) var dom = this.dom.cloneNode(true); // 1. clone dom; dont create a new dom object if dom was already found rendered
        if(generate_is_defined && !dom_found_rendered) dom = await this.generate(dom, options) // 2. generate if defined; dont generate if dom was already found rendered
        if(hydrate_is_defined && !currently_rendering_on_server) dom = await this.hydrate(dom, options); // 3. hydrate if defined; dont hydrate if rendering on server

        // if render_on_server requested and the element was not already found rendered, attach the serverside_rendering_identifier to the newly rendered dom
        if(render_on_server && !dom_found_rendered){
            dom.setAttribute("serverside_rendering_identifier", serverside_rendering_identifier);
        }

        // if the dom was found rendered, attach the `rendered_on_server` attribute to true
        if(dom_found_rendered) dom.setAttribute('rendered_on_server', true);

        // return built dom
        return dom; // return the generated and hydrated dom
    },
    generate_unique_identifier : function(options){
        /*
            unique identifier is used for the hydration of server side rendered elements
                - upon building on the server, the server appends this id to the rendered element
                - upon building on the client, the client uses this id to find the rendered element that needs to be hydrated
        */
        var identifier = this.view_identifier + "-" + JSON.stringify(options) + "-" + this.build_id_enumerator;
        identifier = window.btoa(identifier); // encode to make it look better

        /*
            increment build_id_enumerator
        */
        this.build_id_enumerator += 1;

        /*
            return the result
        */
        return identifier;
    },
}
module.exports = Builder;
