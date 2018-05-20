var resource_loader = {
    load_resources : async function(request){
        /*
            derive the paths to the compiler and html
        */
        var paths = await this.retreive_paths(request)

        /*
            retreive load the components
                - define promises and THEN wait for each one (this enables them to load in parallel)
                - ensure that generate and hydrate are OPTIONALLY loaded (i.e., dont complain if they dont exist)
        */
        var promise_dom = this.retreive_dom_from_html_path(paths.html);
        var promise_generate = load(paths.generate, {log_loading_errors:false}).catch(err=>false); // if cant load, return false
        var promise_hydrate = load(paths.hydrate, {log_loading_errors:false}).catch(err=>false); // if cant load, return false
        var dom = await promise_dom;
        var generate = await promise_generate;
        var hydrate = await promise_hydrate;

        // return resources
        return {
            generate : generate,
            hydrate : hydrate,
            dom : dom,
        }
    },


    /*
        path finding methods
    */
    retreive_paths : async function(request){
        /*
            retreive path to files - handling node_modules as well
                - Therefore, assume that if there is no "/" in the name that it is a node module.
        */

        // define `components_root`
        if(request.indexOf("/") == -1){ // if no "/" present, this is a node module. load the dom and compiler as defined in the package.json
            // define module basic info
            var module_name = request;
            var module_root_path = window.clientside_require.modules_root + "/" + module_name;

            // retreive package_json contents
            var package_json_path = module_root_path +  "/package.json"; // derive where to expect the package.json file
            var package_json = await load(package_json_path); // retreive the package_json contents

            // derive components root based on packagejson
            var component_root = module_root_path; // by default its in module_root_path
            if(typeof package_json.components == "string") component_root += "/" + package_json.components; // and the default can be modified by package_json.components
        } else { // else we're given an absolute or a relative path to the dir of the view.
            var component_root = request;
        }

        // determine paths to `generate`, `hydrate`, and `compiler` based on `components_root`
        var paths = {
            generate : component_root + "/generate.js",
            hydrate : component_root + "/hydrate.js",
            html : component_root + "/view.html",
        }

        //return paths
        return paths;
    },

    /*
        dom creation methods
    */
    retreive_dom_from_html_path : async function(html_path){
        var html = await load(html_path) // retreive html
        var dom = this.convert_html_into_dom(html); // convert html to dom
        return dom;
    },

    convert_html_into_dom : function(html){
        var holder = window.document.createElement("div");
        holder.innerHTML = html;
        var dom = holder.childNodes[0];
        return dom;
    },
}
module.exports = resource_loader;
