var Builder = function(dom, generate, hydrate){
    this.dom = dom;
    this.generate = generate;
    this.hydrate = hydrate;
}
Builder.prototype = {
    build : async function(options){
        // define readability constants
        var generate_is_defined = this.generate !== false;
        var hydrate_is_defined = this.hydrate !== false;

        // build
        var dom = this.dom.cloneNode(true); // 1. clone dom
        if(generate_is_defined) dom = await this.generate(dom, options) // 2. generate if defined
        if(hydrate_is_defined) dom = await this.hydrate(dom, options); // 3. hydrate if defined

        // return built dom
        return dom; // return the generated and hydrated dom
    }
}
module.exports = Builder;
