var permissions = null;
var cache = {};

export const check = function(actions) {
    if (!Array.isArray(actions)) {
        actions = [actions];
    }

    for (let i = 0; i < actions.length; i++) {
        let action = actions[i];
        let value = cache[action];

        if (value === undefined) {
            let has = cache[action] = permissions.test(action);
            if (has) {
                return true;
            }
        } else if (value === true) {
            return true;
        }
    }

    return false;
};

export const set = function(list) {
    cache = {};
    permissions = new RegExp(list.map(function(permission) {
        return permission.actionId.replace('%', '(.+?)');
    }).join('|'));
};
