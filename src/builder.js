var Builder = function(dom, generate, hydrate){
    this.dom = dom;
    this.generate = generate;
    this.hydrate = hydrate;
}
Builder.prototype = {
    build : function(options){
        // define readability constants
        var generate_is_defined = this.generate !== false;
        var hydrate_is_defined = this.hydrate !== false;

        // build
        var dom = this.dom.cloneNode(true); // 1. clone dom
        if(generate_is_defined) dom = this.generate(dom, options) // 2. generate if defined
        if(hydrate_is_defined) dom = this.hydrate(dom, options); // 3. hydrate if defined

        // normalize result
        var promise_dom = Promise.resolve(dom); // 4. wrap the result in a promise to standardize that every .build is async

        // return built dom
        return promise_dom; // return the generated and hydrated dom
    }
}
module.exports = Builder;
