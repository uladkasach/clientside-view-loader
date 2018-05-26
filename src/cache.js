module.exports = {
    _cache : {}, // the actual data store
    find : function(identifier){
        var result = this._cache[identifier];
        if(typeof result == "undefined") return false;
        return result;
    },
    set : function(identifier, data){
        this._cache[identifier] = data;
    },
    reset : function(){
        this._cache = {}
    }
}
