import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';
import PageNotFound from './components/PageNotFound.jsx';
import { Store } from './Store';
import UtFrontMiddleware from './middleware';
import { set, check } from './permissions';

export class UtFront extends React.Component {
    constructor(props) {
        super(props);
        this.store = Store(
            this.props.reducers,
            this.props.resetAction,
            UtFrontMiddleware(this.props.utBus).concat(this.props.middlewares),
            this.props.environment
        );
        this.history = syncHistoryWithStore(useRouterHistory(createHashHistory)(), this.store);
    }
    render() {
        return (
            <Provider store={this.store}>
                <Router history={this.history}>
                    {this.props.children}
                    <Route path='*' component={PageNotFound} />
                </Router>
            </Provider>
        );
    }
};

UtFront.propTypes = {
    children: React.PropTypes.object,
    utBus: React.PropTypes.object.isRequired,
    environment: React.PropTypes.string,
    reducers: React.PropTypes.object,
    resetAction: React.PropTypes.any,
    middlewares: React.PropTypes.array
};

UtFront.defaultProps = {
    children: {},
    environment: 'dev',
    reducers: {},
    middlewares: []
};

UtFront.childContextTypes = {
    language: React.PropTypes.string
};

export function PermissionCheck({children, utAction, deniedUtAction}) {
    if ((utAction && !check(utAction)) || (deniedUtAction && check(deniedUtAction))) {
        return (
            <span dangerouslySetInnerHTML={{__html: '<!-- not permitted -->'}} />
        );
    } else {
        return children;
    }
};

PermissionCheck.propTypes = {
    children: React.PropTypes.object,
    utAction: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    deniedUtAction: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
    ])
};

export const setPermissions = set;
