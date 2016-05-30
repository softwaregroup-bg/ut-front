import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';
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
        this.history = syncHistoryWithStore(useRouterHistory(createHashHistory)({ queryKey: false }), this.store);
    }
    getChildContext() {
        return {
            translate: (text, language) => {
                if (!this.props.translations || !this.props.translations[text]) {
                    return text;
                }
                return this.props.translations[text];
            },
            money: function(amount, currency, locale) {
                if (!currency) currency = 'EUR';
                if (!locale) locale = 'en-UK';
                return new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 2
                }).format(amount);
            },
            date: function(date, locale) {
                if (!locale) locale = 'en-UK';
                return new Intl.DateTimeFormat(locale, {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                }).format(new Date(date));
            },
            numberThousands: function(num) {
                return num.toString().replace(/\B(?=(\d{3})+\b)/g, ',');
            }
        };
    }
    render() {
        return (
            <Provider store={this.store}>
                <div>
                    <Router history={this.history}>
                        {this.props.children}
                        <Route path='*' component={PageNotFound} />
                    </Router>
                    {this.props.environment !== 'production' ? <DevTools /> : ''}
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
    middlewares: React.PropTypes.array,
    translations: React.PropTypes.object
};

UtFront.defaultProps = {
    children: {},
    environment: 'dev',
    reducers: {},
    middlewares: []
};

UtFront.childContextTypes = {
    language: React.PropTypes.string,
    translate: React.PropTypes.func,
    money: React.PropTypes.func,
    date: React.PropTypes.func,
    numberThousands: React.PropTypes.func
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
