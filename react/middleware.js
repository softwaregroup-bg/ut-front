import thunk from 'redux-thunk';
import immutable from 'immutable';

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

export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            var cookies = document.cookie.split(';').map((c) => (c.split('='))).reduce((a, c) => {
                var key = c.shift();
                a[key] = c.shift();
                return a;
            }, {});
            var corsCookie = cookies['xsrf-token'];
            action.methodRequestState = 'requested';
            next(action);

            if (action.abort) {
                action.methodRequestState = 'finished';
                return Promise.resolve(next(action));
            }
            var methodParams = cloneParams(action.params);
            if (corsCookie) {
                methodParams = Object.assign(methodParams, { headers: { 'x-xsrf-token': corsCookie } });
            }
            return utBus.importMethod(action.method)(methodParams)
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
        return Promise.resolve(next(action));
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
