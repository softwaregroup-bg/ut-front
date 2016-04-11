import React from 'react';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Route } from 'react-router';
import PageNotFound from './components/PageNotFound.jsx';
import DevTools from './DevTools';
import { Store } from './Store';
import UtFrontMiddleware from './middleware';
import { set, check } from './permissions';

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        this.store = Store(
            this.props.reducers,
            UtFrontMiddleware(this.props.utBus).concat(this.props.middlewares),
            this.props.environment
        );
        this.history = syncHistoryWithStore(hashHistory, this.store);
    }
    render() {
        return (
            <Provider store={this.store}>
                <div>
                    <Router history={this.history}>
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

export class PermissionCheck extends React.Component {
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

PermissionCheck.propTypes = {
    children: React.PropTypes.object,
    utAction: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
    ])
};

export const setPermissions = set;
