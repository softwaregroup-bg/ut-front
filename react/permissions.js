var permissions = {data: []};

function matcher(required) {
    return !!~permissions.data.indexOf(required);
};

export const check = function(actions) {
    var _actions = Array.isArray(actions) ? actions : [actions];
    return _actions.filter(matcher).length === _actions.length;
};

export const set = function(list) {
    permissions = {data: []};
    permissions.data = list;
};