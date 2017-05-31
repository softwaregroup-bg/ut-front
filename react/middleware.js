import thunk from 'redux-thunk';

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

            return utBus.importMethod(action.method)(Object.assign({}, action.params, (corsCookie ? {headers: {'x-xsrf-token': corsCookie}} : {})))
                .then(result => {
                    action.result = result;
                    return result;
                })
                .catch(error => {
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
