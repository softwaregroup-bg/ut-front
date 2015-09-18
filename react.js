var React = require('react');
var _ = require('lodash');
var self;
module.exports = {
    createClass : function(spec){
        return React.createClass(spec);
    },
    createElement : function(type, props, children){
        if (arguments.length > 2) {
            if (!props) {
                props = {};
            }
            var members = Array.prototype.slice.call(arguments, 2);
            switch(type.Class) {
                case 'Window':
                    props.items = members;
                    break;
                default:
                    props.members = members;
                    break;
            }
        }

        var result=type.create(props);
        props.ref && ((props.$owner.refs || (props.$owner.refs={}))[props.ref] = result);
        return result;
    },
    frontEnd : function() {
        return isc;
    },
    request: function( opcode, params ){
        return this.bus.importMethod(opcode)(params)
            .catch(function(error){
                if(error.code == '123') {
                    self.bus.importMethod('login.ui.render')(this);
                } else {
                    throw error;
                }
            });
    },
    openPage: function(nameSpace){
        this.bus.importMethod(nameSpace+'.ui.render')(this);
    },
    init: function(bus) {
        self = this;
        this.bus = bus;
        isc.defineClass("RPCDataSource", "RestDataSource");
        isc.RPCDataSource.addProperties({
            dataFormat:"json",
            transformRequest:function(request){
                var data = {};
                var params = this.Super("transformRequest", arguments);
                if(this.defaultParams) {
                    data = JSON.parse(this.defaultParams);
                }
                data = _.assign({}, this.Super("transformRequest", arguments), data);
                request.dataProtocol='clientCustom';
                self.request(this.dataURL+'.'+request.operationType, data).then(function(result){
                    this.processResponse(request.requestId,{status:0,data:result})
                }.bind(this));
                return data;
            }
        })
    }
}
