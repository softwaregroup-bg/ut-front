var React = require('react/lib/ReactClass');
var PropTypes = require('react/lib/ReactPropTypes');
var _ = require('lodash');
var when = require('when');

window.isc.defineClass('RPCDataSource', 'RestDataSource');
window.isc.RPCDataSource.addProperties({
    dataFormat: 'json',
    transformRequest: function(request) {
        var data = {};
        this.Super('transformRequest', arguments);
        if (typeof this.defaultParams === 'string') {
            data = JSON.parse(this.defaultParams);
        } else {
            data = this.defaultParams;
        }
        data = _.assign({}, this.Super('transformRequest', arguments), data);
        request.dataProtocol = 'clientCustom';
        module.exports.request(this.dataURL + '.' + request.operationType, data)
            .then(function(result) {
                this.processResponse(request.requestId, {status: 0, data: (Array.isArray(result) && Array.isArray(result[0])) ? result[0] : result});
            }.bind(this))
            .catch(function(error) {
                window.isc.warn(error.errorPrint || error.message);
                if (request.operationType === 'fetch') {
                    this.processResponse(request.requestId, {status: 0, data: []});
                }
            }.bind(this));
        return data;
    }
});

module.exports = {
    createClass: function(spec) {
        return React.createClass(spec);
    },
    createClassFactory: function(spec) {
        var Class = React.createClass(spec);
        return function() {
            return Class;
        };
    },
    PropTypes: PropTypes,
    createElement: function(Type, props, children) {
        if (props && (props.type === 'button' || props.ut5Action)) {
            if (!this.checkPermission(props.ut5Action || props.action)) {
                return '';
            }
        }
        if (arguments.length > 2) {
            if (!props) {
                props = {};
            }
            var members = Array.prototype.slice.call(arguments, 2);
            switch (Type.Class) {
                case 'Window':
                    props.items = members;
                    break;
                default:
                    props.members = members;
                    break;
            }
        }
        props && Object.keys(props).forEach(function(prop) {
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

        var result = Type.create ? Type.create(props) : (new Type(props)).render();
        props && props.ref && ((props.$owner.refs && Object.isFrozen(props.$owner.refs)) || (!props.$owner.refs)) && (props.$owner.refs = {});
        props && props.ref && (props.$owner.refs[props.ref] = result);
        return result;
    },
    frontEnd: function() {
        return window.isc;
    },
    request: function(opcode, params) {
        if (navigator.onLine || this.bus.config.useAppOffline) {
            return this.bus.importMethod(opcode)(params)
                .catch(function(error) {
                    console.error(opcode, params, error);
                    if (module.exports.bus.config.identity && error.code === module.exports.bus.config.identity.errorCode) {
                        window.isc.warn((error.errorPrint || error.message) + ' Please relogin!', function() {
                            window.location.reload();
                        });
                        return when.reject(error);
                    } else {
                        return when.reject(error);
                    }
                });
        } else {
            return when.reject(new Error('This data not available while offline'));
        }
    },
    checkPermission: function(action) {
        if (Array.isArray(this.bus.config.permissions)) {
            if (Array.isArray(action)) {
                action.forEach(function(act) {
                    if (act && this.bus.config.permissions.indexOf(act) === -1) {
                        return false;
                    }
                }.bind(this));
            } else if (action && this.bus.config.permissions.indexOf(action) === -1) {
                return false;
            }
        }
        return true;
    },
    checkRights: function(items) {
        var permissions = [];
        if (items && Array.isArray(items)) {
            for (var key = 0, len = items.length; key < len; key += 1) {
                if (items[key] && ((items[key].ut5Action && !this.checkPermission(items[key].ut5Action)))) {
                    // items.splice(key, 1);
                } else if ((items[key].type === 'button' && !this.checkPermission(items[key].action))) {
                    // items.splice(key, 1);
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
        if (navigator.onLine || this.bus.config.useAppOffline || nameSpace === 'login') {
            this.bus.importMethod(nameSpace + '.ui.render')(this);
        } else {
            window.isc.warn('This data not available while offline');
        }
    },
    init: function(bus) {
        this.bus = bus;
    }
};
