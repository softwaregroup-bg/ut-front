import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';

const enhancer = compose(
    window && window.devToolsExtension
        ? window.devToolsExtension({
            actionsFilter: (action) => {
                if (typeof action.type === 'symbol') {
                    action.type = action.type.toString();
                }
                return action;
            }
        })
        : f => f
);

export function Store(reducers, middlewares, environment) {
    const mixedReducers = {
        routing: routerReducer,
        ...reducers
    };
    const store = applyMiddleware(...middlewares)(createStore);
    return store(combineReducers(mixedReducers), {}, enhancer);
};
