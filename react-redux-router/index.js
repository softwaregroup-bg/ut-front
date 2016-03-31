import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { Route } from 'react-router';
import assign from 'lodash/object/assign';
import PageNotFound from './common/PageNotFound.jsx';

var store;
var history;

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        var reducers = {
            routing: routerReducer
        };

        if (Object.keys(props.reducers).length) {
            reducers = assign({}, reducers, props.reducers);
        }
        store = createStore(combineReducers(reducers));
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
                </div>
            </Provider>
        );
    }
};

UtFront.propTypes = {
    children: React.PropTypes.object,
    reducers: React.PropTypes.object
};
