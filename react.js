var React = require('react');

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
        Object.keys(props).forEach(function(prop) {
            if (prop.endsWith('_action')) {
                props[prop.slice(0, -7)] = (function(action) {
                    var bus = this.bus;
                    var busMethod = bus.importMethod(action);
                    return function() {
                        return busMethod.call(bus, {
                            action: action,
                            params: arguments,
                            target: function() {
                                return this;
                            }.bind(this)
                        });
                    }
                }.bind(this))(props[prop]);
                delete props[prop];
            }
        }.bind(this));

        var result=type.create(props);
        props.ref && ((props.$owner.refs || (props.$owner.refs={}))[props.ref] = result);
        return result;
    },
    frontEnd : function() {
        return isc;
    },
    init: function(bus) {
        this.bus = bus;
        isc.defineClass("RPCDataSource", "RestDataSource");
        isc.RPCDataSource.addProperties({
            dataFormat:"json",
            transformRequest:function(request){
                var data=this.Super("transformRequest", arguments);
                request.dataProtocol='clientCustom';
                bus.importMethod(this.dataURL+'.'+request.operationType)(data).then(function(result){
                    this.processResponse(request.requestId,{status:0,data:result})
                }.bind(this));
                return data;
            }
        })
    }
}
