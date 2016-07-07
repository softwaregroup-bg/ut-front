import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';
import thunk from 'redux-thunk';

const enhancer = compose(
    applyMiddleware(thunk),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
);

export function Store(reducers, middlewares, environment) {
    const mixedReducers = {
        routing: routerReducer,
        ...reducers
    };
    const store = applyMiddleware(...middlewares)(createStore);
    return store(combineReducers(mixedReducers), {}, enhancer);
};
