import thunk from 'redux-thunk';
import immutable, {fromJS} from 'immutable';

/**
 * Convert action.params to plain js when action.params is immutable
 */
const cloneParams = (params) => {
    if (params instanceof immutable.Collection) {
        return params.toJS(); // no need to clone as toJS returns a new instance
    } else if (params instanceof Array) {
        return params.slice();
    } else {
        return Object.assign({}, params);
    }
};

const getCookies = () => document.cookie.split(';').map((c) => (c.split('='))).reduce((a, c) => {
    var key = c.shift().trim();
    a[key] = c.shift();
    return a;
}, {});

export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            var cookies = getCookies();
            var corsCookie = cookies['xsrf-token'];
            var importMethodParams = {};
            var $meta = fromJS({$http: {mtid: ((action.mtid === 'notification' && 'notification') || 'request')}});
            var methodParams = fromJS(cloneParams(action.params))
                .mergeDeep($meta);

            if (action.$http) {
                methodParams = methodParams.mergeDeep(fromJS({$http: action.$http}));
            }

            if (action.requestTimeout) {
                importMethodParams = Object.assign({}, importMethodParams, {timeout: action.requestTimeout});
            }
            action.methodRequestState = 'requested';
            next(action);

            if (action.abort) {
                action.methodRequestState = 'finished';
                return next(action);
            }
            if (corsCookie) {
                methodParams = methodParams.mergeDeep(fromJS({$http: {headers: {'x-xsrf-token': corsCookie}}}));
            }

            return utBus.importMethod(action.method, importMethodParams)(methodParams.toJS())
                .then(result => {
                    action.result = result;
                    return result;
                })
                .catch(error => {
                    // Display a friendlier message on connection lost
                    if (error.type === 'PortHTTP.Generic' && error.message === 'Unexpected end of JSON input') {
                        error.message = 'Network connection lost';
                        error.print = 'Network connection lost';
                    }
                    action.error = error;
                    return error;
                })
                .then(() => {
                    action.methodRequestState = 'finished';
                    return next(action);
                });
        }
        return next(action);
    };

    const utBuslogger = (store) => (next) => (action) => {
        if (action.method) {
            // TODO: log the action
            return next(action);
        } else if (action.type === 'UT_LOG') {
            // TODO: log the action
            return action;
        }
        return next(action);
    };

    return [thunk, rpc, utBuslogger];
};
