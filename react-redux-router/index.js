import React from 'react';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Route } from 'react-router';
import PageNotFound from './components/PageNotFound.jsx';
import DevTools from './DevTools';
import Store from './Store';

var store;
var history;

export class UtFront extends React.Component {
    constructor(props) {
        super(props);

        store = Store(props.reducers);
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
