export default (utBus) => {
    const rpc = (store) => (next) => (action) => {
        if (action.rpc) {
            utBus
                .importMethod(action.rpc)(action.data)
                .then((r) => {
                    action.rpcRequestState = 'finished';
                    action.response = 'ok';
                    action.responseDetails = r;
                    next(action);
                })
                .catch((e) => {
                    action.rpcRequestState = 'finished';
                    action.response = 'error';
                    action.responseDetails = e;
                    next(action);
                });
            action.data = undefined;
            action.rpcRequestState = 'requested';
        }
        return next(action);
    };

    const utBuslogger = (store) => (next) => (action) => {
        if (action.rpc) {
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
