var React = require('react/lib/ReactClass');
var _ = require('lodash');
var when = require('when');
var self;

module.exports = {
    createClass : function(spec) {
        return React.createClass(spec);
    },
    createElement : function(type, props, children) {
        if (props.type === 'button' || props.ut5Action) {
            if (!this.checkPermission(props.ut5Action || props.action)) {
                return '';
            }
        }
        if (arguments.length > 2) {
            if (!props) {
                props = {};
            }
            var members = Array.prototype.slice.call(arguments, 2);
            switch (type.Class) {
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
                    };
                }.bind(this))(props[prop]);
                delete props[prop];
            }
        }.bind(this));

        var result = type.create(props);
        props.ref && ((props.$owner.refs || (props.$owner.refs = {}))[props.ref] = result);
        return result;
    },
    frontEnd : function() {
        return window.isc;
    },
    request: function(opcode, params) {
        return this.bus.importMethod(opcode)(params)
            .catch(function(error) {
                console.log(opcode, params, error);
                if (self.bus.config.identity && error.code === self.bus.config.identity.errorCode) {
                    window.isc.warn((error.errorPrint || error.message) + ' Please relogin!', function() {
                        location.reload();
                    });
                } else {
                    return when.reject(error);
                }
            });
    },
    checkPermission: function(action) {
        if ( Array.isArray(this.bus.config.permissions) ) {
            if (action && this.bus.config.permissions.indexOf(action) === -1) {
                return false;
            }
        }
        return true;
    },
    checkRights: function(items){
        var permissions = [];
        if (items && Array.isArray(items)) {
            for (var key = 0, len = items.length; key < len; key++) {
                if ( items[key] && ((items[key].ut5Action && !this.checkPermission(items[key].ut5Action)) || (items[key].type === 'button' && !this.checkPermission(items[key].action))) ) {
                    //items.splice(key, 1);
                } else {
                    permissions.push(items[key]);
                }
            }
        } else {
            permissions = items;
        }
        return permissions;
    },
    openPage: function(nameSpace) {
        this.bus.importMethod(nameSpace + '.ui.render')(this);
    },
    init: function(bus) {
        self = this;
        this.bus = bus;
        window.isc.defineClass('RPCDataSource', 'RestDataSource');
        window.isc.RPCDataSource.addProperties({
            dataFormat:'json',
            transformRequest:function(request) {
                var data = {};
                this.Super('transformRequest', arguments);
                if (this.defaultParams) {
                    data = JSON.parse(this.defaultParams);
                }
                data = _.assign({}, this.Super('transformRequest', arguments), data);
                request.dataProtocol = 'clientCustom';
                self.request(this.dataURL + '.' + request.operationType, data)
                    .then(function(result) {
                        this.processResponse(request.requestId,{status:0,data:result});
                    }.bind(this))
                    .catch(function(error) {
                        window.isc.warn(error.errorPrint || error.message);
                        if(request.operationType == 'fetch') {
                            this.processResponse(request.requestId,{status:0,data:[]});
                        }
                    }.bind(this));
                return data;
            }
        });
    }
};
