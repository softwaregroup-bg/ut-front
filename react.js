var error = 'require(\'ut-front/react\') is deprecated,\nplease require(\'ut-front-smartclient/react\') instead';
if (typeof global.alert === 'function') {
    global.alert(error);
} else {
    throw new Error(error);
}
