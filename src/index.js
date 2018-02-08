var view_loader = {
    load : function(path){
        // to load a view:
        /*
            1. load the view.html as the dom
            2. load the index.js as the compiler
                - TODO - enable retreival of more dependencies to load
                    - e.g., css, json, other js files
        */
        var promise_compiler = require(path+"/index.js");
        var promise_dom = require(path+"/view.html")
            .then((html)=>{
                var holder = document.createElement("div");
                holder.innerHTML = html;
                var dom = holder.childNodes[0];
                return dom;
            })
        var promise_to_initialize_compiler = Promise.all([promise_compiler, promise_dom])
            .then(([compiler, dom])=>{
                compiler.initialize(dom);
                return compiler;
            })
        promise_to_initialize_compiler.generate = function(){
            return this.then((compiler)=>{
                return compiler.generate();
            })
        }
        return promise_to_initialize_compiler;
    }
}
module.exports = view_loader;
