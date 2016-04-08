import React from 'react';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Route } from 'react-router';
import PageNotFound from './components/PageNotFound.jsx';
import DevTools from './DevTools';
import { Store } from './Store';
import UtFrontMiddlewares from './Middlewares';
import { set, check } from './permissions';

var store;
var history;

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        store = Store(
            this.props.reducers,
            UtFrontMiddlewares(this.props.utBus).concat(this.props.middlewares),
            this.props.environment
        );
        history = syncHistoryWithStore(hashHistory, store);
    }
    getChildContext() {
        return { utBus: this.props.utBus };
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
    utBus: React.PropTypes.object.isRequired,
    environment: React.PropTypes.string,
    reducers: React.PropTypes.object,
    middlewares: React.PropTypes.array
};

UtFront.defaultProps = {
    children: {},
    environment: 'dev',
    reducers: {},
    middlewares: []
};

UtFront.childContextTypes = {
    utBus: React.PropTypes.object
};

export class PermitionCheck extends React.Component {
    render() {
        if (this.props && this.props.utAction && !check(this.props.utAction)) {
            return (
                <div dangerouslySetInnerHTML={{__html: '<!-- not permitted -->'}}></div>
            );
        } else {
            return this.props.children;
        }
    }
};

PermitionCheck.propTypes = {
    children: React.PropTypes.object,
    utAction: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
    ])
};

export const setPermissions = set;
