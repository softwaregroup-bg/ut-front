import map from 'lodash.map';
var routes = {};

export const registerRoute = (name) => {
    routes[name] = {
        r: {
            up: () => { return routes[routes[name].parent].r; },
            path: (path) => { routes[name].path = path; return routes[name].r; },
            parent: (parent) => { routes[name].parent = parent; return routes[name].r; }
        }
    };
    return routes[name].r;
};

export const getRoute = (name) => {
    if (!routes[name]) {
        throw new Error('No such path name');
    }
    return routes[name].path;
};

export const traceParent = (list, parent) => {
    if (parent) {
        if (!routes[parent] || !routes[parent].path) {
            throw new Error(`Missing or incorrect "parent": ${parent}`);
        }
        list.push(routes[parent].path);
        if (routes[parent].parent) {
            return traceParent(list, routes[parent].parent);
        }
    }
    return list;
};

export const getLink = (name, paramsOrigin) => {
    let params = Object.assign({}, paramsOrigin);
    if (!routes[name]) {
        return;
    }
    var route = traceParent([routes[name].path], routes[name].parent)
        .reverse()
        .map((el) => {
            if (el.startsWith(':')) {
                let k = el.substr(1);
                let v = params[k] || '';
                delete params[k];
                return v;
            }
            return el;
        });
    let path = route.join('/');
    if (params) {
        Object.keys(params)
            .sort((a, b) => {
                return a.length < b.length;
            })
            .reduce((prev, key) => {
                let part = prev.split(`:${key}`);
                if (part.length === 2) {
                    path = part.join(params[key]);
                }
                return path;
            }, path);
    }
    return path;
};

export function getBreadcrumbs(name, result) {
    let currentBreadcrumb = routes[name];
    if (currentBreadcrumb) {
        if (currentBreadcrumb.parent) {
            getBreadcrumbs(currentBreadcrumb.parent, result);
        }

        let currentPath = currentBreadcrumb.path;
        if (currentPath[0] !== ':') {
            if (currentPath[0] === '/') currentPath.substring(1, currentPath.length);
            result.push({name: currentPath, path: name});
        }
        return;
    }

    result.push({name: 'No breadcrumbs found', path: name});
}

export function getBreadcrumbsString(name) {
    let breadcrumbs = [];
    getBreadcrumbs(name, breadcrumbs);
    let breadcrumbsString = map(breadcrumbs, 'name').join('/');
    return breadcrumbsString;
};
