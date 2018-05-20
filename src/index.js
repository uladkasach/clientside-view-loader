var Builder = require('./builder.js');
var resource_loader = require("./resource_loader.js");

var view_loader = {
    load : function(request){
        /*
            promise to load the view and retreive the compiler
        */
        var promise_resources = resource_loader.load_resources(request);


        /*
            promse to define the build function
        */
        var promise_build_function = promise_resources
            .then((resources)=>{
                var builder = new Builder(resources.dom, resources.generate, resources.hydrate);
                var build = builder.build.bind(builder);
                return build;
            })


        /*
            append the .build() function to the promise returned by load to enable `.load().build()`
        */
        promise_build_function.build = function(options){
            return this.then((build)=>{
                return build(options);
            })
        }

        /*
            return promise that resolves with the build function
        */
        return promise_build_function;
    },


}
module.exports = view_loader;
