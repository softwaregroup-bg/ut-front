var path = require('path');
var bus;
module.exports = {
    init: function(b){
        bus = b;
    },
    initRoutes: function() {
        bus.importMethod('internal.registerRequestHandler')({
            method: 'GET',
            path: '/s/sc/{p*}',
            handler: {
                directory: {
                    path: path.join(__dirname,'browser'),
                    listing: false,
                    index: true
                }
            }
        });
    }
}
