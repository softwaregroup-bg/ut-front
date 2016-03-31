var path = require('path');

module.exports = {
    start: function() {
        var self = this;
        return this && this.registerRequestHandler && this.registerRequestHandler([{
            method: 'GET',
            path: '/s/sc/{p*}',
            handler: {
                directory: {
                    path: path.join(__dirname, 'browser'),
                    listing: false,
                    index: true,
                    lookupCompressed: true
                }
            }
        }, {
            method: 'GET',
            path: '/s/sc/debug.html',
            handler: function(request, reply) {
                self.config['utfront.pack']({minifyJS: false, bundlingEnabled: false, packer: self.config.packer})
                    .then(function(pack) {
                        var html = '';
                        html = `<!doctype html>
                            <html lang="en">
                                <head>
                                    <meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                    <script type="text/javascript">
                                        global=window;
                                    </script>
                                    <title>UnderTree</title>
                                    <!--
                                    <link rel="stylesheet" type="text/css" href="css/ut5.css">
                                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
                                    -->
                                    ${pack.head}
                                </head>
                                <body class="ut5">
                                    ${pack.body}
                                </body>
                            </html>`;
                        if (pack.packer && pack.packer === 'webpack') {
                            html = `<!doctype html>
                                <html lang="en">
                                    <head>
                                        <meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
                                        <meta name="viewport" content="width=device-width, initial-scale=1">
                                        <script type="text/javascript">
                                            global=window;
                                        </script>
                                        <title>UnderTree</title>
                                        <!--
                                        <link rel="stylesheet" type="text/css" href="css/ut5.css">
                                        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
                                        -->
                                    </head>
                                    <body class="ut5">
                                        <div id="utApp"></div>
                                        <script src="/s/cache/index.js"></script>
                                    </body>
                                </html>`;
                        }
                        reply(html);
                    });
            }
        }]);
    }
};
