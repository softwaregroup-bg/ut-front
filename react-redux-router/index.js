import React from 'react';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { persistState } from 'redux-devtools';
import { Route } from 'react-router';
import assign from 'lodash/object/assign';
import PageNotFound from './common/PageNotFound.jsx';
import DevTools from './DevTools';

var store;
var history;
const enhancer = compose(
    applyMiddleware(thunk),
    DevTools.instrument(),
    persistState(
        window.location.href.match(
            /[?&]debug_session=([^&#]+)\b/
        )
    )
);

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        var reducers = {
            routing: routerReducer
        };

        if (Object.keys(props.reducers).length) {
            reducers = assign({}, reducers, props.reducers);
        }
        store = createStore(combineReducers(
            reducers
        ), {}, enhancer);
        history = syncHistoryWithStore(hashHistory, store);
    }
    render() {
        return (
            <Provider store={store}>
                <div>
                    <Router history={history}>
                        {this.props.children}
                        <Route path='*' component={PageNotFound}/>
                    </Router>
                    <DevTools/>
                </div>
            </Provider>
        );
    }
};

UtFront.propTypes = {
    children: React.PropTypes.object,
    reducers: React.PropTypes.object
};
