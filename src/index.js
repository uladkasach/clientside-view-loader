var view_loader = {

    load : function(request){
        // to load a view:
        /*
            1. load the view.html as the dom
            2. load the index.js as the compiler
        */

        /*
            Retreive path to files - handling node_modules as well
                - Therefore, assume that if there is no "/" in the name that it is a node module.
                    - note, this disables relative paths to root directory view directories and requires abs path

        */
        if(request.indexOf("/") == -1){ // if no "/" present, this is a node module. load the dom and compiler as defined in the package.json
            var module_name = request;
            var promise_compiler_path = require(module_name, {resolve : "path"}); // request only the path of the module
            var promise_dom_path = promise_compiler_path // generate the dom path based on the path to the module embedded in compiler path
                .then((path)=>{
                    var module_root = path.substring(0, path.lastIndexOf("/")); // extract the dir from the path
                    return module_root + "/view.html";
                })
        } else { // else we're given an absolute or a relative path to the dir of the view.
            var promise_compiler_path = Promise.resolve(request + "/compiler.js");
            var promise_dom_path = Promise.resolve(request + "/view.html");
        }

        var promise_compiler = promise_compiler_path
            .then((path)=>{
                return require(path);
            })
        var promise_dom = promise_dom_path
            .then((path)=>{
                return require(path);
            })
            .then((html)=>{
                var holder = document.createElement("div");
                holder.innerHTML = html;
                var dom = holder.childNodes[0];
                return dom;
            })

        var promise_to_initialize_compiler = Promise.all([promise_compiler, promise_dom])
            .then(([compiler, dom])=>{
                if(compiler.generator_wrapped !== true){ // if generator has not already been wrapped
                    try { // try to wrap the generator function to inject the dom and standardize the output as a promise
                        var original_generator = compiler.generate;
                        compiler.generate = function(options){
                            var result = original_generator(dom.cloneNode(true), options) // 1. inject a dom clone directly into generator
                            return Promise.resolve(result);  // 2. wrap compiler function in a promise to make the output standard;
                        }
                        compiler.generator_wrapped = true;
                    } catch (err){ // catch errors if they occur; typically occures if the user did not define a generate function in the compiler.js
                        console.error(err);
                        console.warn("due to the above error, clientside-view-loader was not able to finalize the generate function for " + request)
                    }
                }
                return compiler;
            })
        promise_to_initialize_compiler.generate = function(){ // add .load().generate() functionality
            return this.then((compiler)=>{
                return compiler.generate();
            })
        }
        return promise_to_initialize_compiler;
    },



}
module.exports = view_loader;
