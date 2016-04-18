export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.method) {
            utBus
                .importMethod(action.method)(action.params)
                .then((r) => {
                    action.methodRequestState = 'finished';
                    action.response = 'ok';
                    action.responseDetails = r;
                    next(action);
                })
                .catch((e) => {
                    action.methodRequestState = 'finished';
                    action.response = 'error';
                    action.responseDetails = e;
                    next(action);
                });
            action.methodRequestState = 'requested';
        }
        return next(action);
    };

    const utBuslogger = (store) => (next) => (action) => {
        if (action.method) {
            // log the action
            return next(action);
        } else if (action.type === 'UT_LOG') {
            // log the action
            return action;
        }
        return next(action);
    };
    return [rpc, utBuslogger];
};
