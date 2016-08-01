import thunk from 'redux-thunk';

export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            action.methodRequestState = 'requested';
            next(action);
            return utBus.importMethod(action.method)(action.params)
                .then(result => {
                    action.result = result;
                })
                .catch(error => {
                    action.error = error;
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
