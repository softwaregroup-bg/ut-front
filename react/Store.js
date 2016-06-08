import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import assign from 'lodash.assign';
import { routerReducer } from 'react-router-redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import DevTools from './DevTools';

const enhancer = compose(
    applyMiddleware(thunk),
    DevTools.instrument(),
    persistState(
        window.location.href.match(
            /[?&]debug_session=([^&#]+)\b/
        )
    )
);

export function Store(reducers, middlewares, environment) {
    var mixedReducers = {
        routing: routerReducer
    };
    if (Object.keys(reducers).length) {
        mixedReducers = assign({}, mixedReducers, reducers);
    }

    var store = applyMiddleware.apply(null, middlewares)(createStore);
    if (environment === 'production') {
        return store(combineReducers(mixedReducers), {});
    } else {
        return store(combineReducers(mixedReducers), {}, enhancer);
    }
};
