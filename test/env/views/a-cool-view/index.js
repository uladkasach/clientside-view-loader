var builder = {
    initialize : function(dom){ // the initialize function is triggered by the view-loader module and passes the dom content of the `view.html` file
        this.dom = dom; // save the dom to the object
    },
    generate : function(options){
        var element = this.dom.cloneNode(true); // clone the dom to build an elemenet, dont disturbe the original element

        // manipulate the element dom
        // attach element functionality

        return element;
    },
}

module.exports = builder; // see github.com/uladkasach/clientside-module-manager for more information
                          // builder is then cached to the view module
