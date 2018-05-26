var Builder = require('./builder.js');
var resource_loader = require("./resource_loader.js");
var cache = require("./cache.js");

var view_loader = {
    load : function(request){
        /*
            determine if request is already in cache
                - note, request REQUIRES absolute paths and not relative paths
                    - this eliminates caching complexity (does not need to resolve absolute path)
                    - this eliminates relative path complexity (we do not need to forward the relative_path_root of the script that called the load function)
        */
        var promise_build_in_cache = cache.find(request);
        if(typeof promise_build_in_cache == "object") return promise_build_in_cache; // if found, return it; if not, we continue

        /*
            promise to load the view and retreive the compiler
        */
        var promise_resources = resource_loader.load_resources(request);

        /*
            promse to define the build function
        */
        var promise_build_function = promise_resources
            .then((resources)=>{
                var builder = new Builder(resources.dom, resources.generate, resources.hydrate, request);
                var build = builder.build.bind(builder);
                return build;
            })

        /*
            append the .build() function to the promise returned by load to enable `.load().build()`
        */
        promise_build_function.build = function(options, render_location, dom_to_hydrate){
            return this.then((build)=>{
                return build(options, render_location, dom_to_hydrate);
            })
        }

        /*
            store the promise_build_function in cache
        */
        cache.set(request, promise_build_function);

        /*
             if `currently_rendering_on_server` is defined,
                ask `content_rendered_manager` to `wait_for` this promise
        */
        var currently_rendering_on_server = window.root_window.currently_rendering_on_server === true; // if rendering on server, the root_window will have the property `currently_rendering_on_server` s.t. `currently_rendering_on_server==true`
        if(currently_rendering_on_server) window.root_window.content_rendered_manager.wait_for(promise_build_function.catch(()=>{})); // note, .catch() at the end since build errors just mean that the build function has finished in this context


        /*
            return promise that resolves with the build function
        */
        return promise_build_function;
    },
}
module.exports = view_loader;
