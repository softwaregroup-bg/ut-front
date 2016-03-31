import { combineReducers, createStore, compose, applyMiddleware } from 'redux';
import assign from 'lodash/object/assign';
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

export function Store(reducers) {
    var mixedReducers = {
        routing: routerReducer
    };
    if (Object.keys(reducers).length) {
        mixedReducers = assign({}, mixedReducers, reducers);
    }

    return createStore(combineReducers(
        mixedReducers
    ), {}, enhancer);
};
