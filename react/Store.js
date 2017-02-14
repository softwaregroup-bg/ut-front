import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';
import reduxReset from 'redux-reset';
import { LOGOUT } from './actionTypes';

const resetStore = (reducer, resetAction) => {
    return (state, action) => {
        if (action.type) {
            switch (action.type) {
                case resetAction:
                    return reducer({}, action);
            }
        }
        return reducer(state, action);
    };
};

const enhancer = compose(
    window && window.devToolsExtension
        ? window.devToolsExtension({
            actionsFilter: (action) => {
                if (typeof action.type === 'symbol') {
                    const actionCopy = {...action}; // Don't change the original action
                    actionCopy.type = action.type.toString(); // DevTools doesn't work with Symbols
                    return actionCopy;
                }
                return action;
            }
        })
        : f => f
);

export function Store(reducers, resetAction, middlewares, environment) {
    const mixedReducers = combineReducers({
        routing: routerReducer,
        ...reducers
    });
    const store = compose(applyMiddleware(...middlewares), reduxReset(LOGOUT))(createStore);
    return store(resetStore(mixedReducers, resetAction), {}, enhancer);
};
