import thunk from 'redux-thunk';

export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            action.methodRequestState = 'requested';

            // This is to prevent circular references (and potential memory leak): action -> promise -> action
            // "As of 2012, all modern browsers ship a mark-and-sweep garbage-collector"
            // However, we can't rely on the user that he doesn't use browser with reference-counting garbage-collector
            const resultAction = {
                result: undefined,
                error: undefined,
                ...action
            };

            action.promise = utBus
                .importMethod(action.method)(action.params)
                .then(result => {
                    resultAction.result = result;
                })
                .catch(error => {
                    resultAction.error = error;
                })
                .then(() => {
                    resultAction.methodRequestState = 'finished';
                    return next(resultAction);
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
