import thunk from 'redux-thunk';
import immutable from 'immutable';

export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            var cookies = document.cookie.split(';').map((c) => (c.split('='))).reduce((a, c) => {
                var key = c.shift().trim();
                a[key] = c.shift();
                return a;
            }, {});
            var corsCookie = cookies['xsrf-token'];
            action.methodRequestState = 'requested';
            next(action);

            // Convert action.params to plain js when action.params is immutable, but keeping the original params,
            // because some reducers require params to stay immutable.
            var actionParamsJS;
            if (action.params instanceof immutable.Collection) {
                actionParamsJS = action.params.toJS();
            }
            return utBus.importMethod(action.method)(Object.assign({}, actionParamsJS || action.params, (corsCookie ? {headers: {'x-xsrf-token': corsCookie}} : {})))
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
