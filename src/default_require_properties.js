module.exports = {
    load : function(path){
        return this.then((view_loader)=>{ return view_loader.load(path)});
    },
    generate : function(options){
        return this.then((compiler)=>{return compiler.generate(options)});
    }
}
