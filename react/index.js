import React from 'react';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Route } from 'react-router';
import PageNotFound from './components/PageNotFound.jsx';
import DevTools from './DevTools';
import { Store } from './Store';
import UtFrontMiddlewares from './Middlewares';

var store;
var history;

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        this.init();
    }
    init() {
        if (!store) {
            store = Store(this.props.reducers, UtFrontMiddlewares(this.props.utBus).concat(this.props.middlewares || []), this.props.environment);
            history = syncHistoryWithStore(hashHistory, store);
        }
    }
    getChildContext() {
        return {utBus: this.props.utBus};
    }
    render() {
        return (
            <Provider store={store}>
                <div>
                    <Router history={history}>
                        {this.props.children}
                        <Route path='*' component={PageNotFound}/>
                    </Router>
                    {this.props.environment !== 'production' ? <DevTools/> : ''}
                </div>
            </Provider>
        );
    }
};

UtFront.propTypes = {
    children: React.PropTypes.object,
    utBus: React.PropTypes.object,
    environment: React.PropTypes.string,
    reducers: React.PropTypes.object,
    middlewares: React.PropTypes.array
};

UtFront.childContextTypes = {
    utBus: React.PropTypes.object
};
