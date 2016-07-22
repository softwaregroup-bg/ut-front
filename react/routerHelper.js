import map from 'lodash.map';
var routes = {};

export const registerRoute = (name) => {
    routes[name] = {
        r: {
            up: () => { return routes[routes[name].parrent].r; },
            path: (path) => { routes[name].path = path; return routes[name].r; },
            parrent: (parrent) => { routes[name].parrent = parrent; return routes[name].r; }
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

export const traceParrent = (list, parrent) => {
    if (parrent) {
        list.push(routes[parrent].path);
        if (routes[parrent].parrent) {
            return traceParrent(list, routes[parrent].parrent);
        }
    }
    return list;
};

export function getBreadcrumbs(name, result) {
    let currentBreadcrumb = routes[name];
    if (currentBreadcrumb) {
        if (currentBreadcrumb.parrent) {
            getBreadcrumbs(currentBreadcrumb.parrent, result);
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
}

export const getLink = (name, params) => {
    if (!routes[name]) {
        return;
    }
    var route = traceParrent([routes[name].path], routes[name].parrent)
        .reverse()
        .map((el) => {
            if (el.startsWith(':')) {
                return params[el.substr(1)] || '';
            }
            return el;
        });
    return route.join('/');
};
