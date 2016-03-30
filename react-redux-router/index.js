import React from 'react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

var store;
var history;

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        store = createStore(combineReducers({
            ...props.reducers,
            routing: routerReducer
        }));
        history = syncHistoryWithStore(browserHistory, store);
    }
    render() {
        return (
            <Provider store={store}>
            <div>
                <Router history={history}>
                    {this.props.children}
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
