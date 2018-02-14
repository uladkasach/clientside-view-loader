module.exports = {
    load : function(path){
        var load_promise = this.then((view_loader)=>{ return view_loader.load(path)}) // define `view_loader.load()` to the view_loader promise
        load_promise.generate = function(options){ return this.then((compiler)=>{return compiler.generate(options)})}; // define view_loader.load().generate() to the promise
        return load_promise;
    }, 
}
