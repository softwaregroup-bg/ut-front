var lasso = require('lasso');
lasso.configure({
        'plugins': [
            'lasso-require',
            'lasso-jsx',
            'lasso-marko',
            'lasso-minify-js'
        ],
        'outputDir': 'static',
        'fingerprintsEnabled': false,
        'minify': true,
        'resolveCssUrls': true,
        'bundlingEnabled': true,
        'bundles': []
    }
);
lasso.lassoPage({
        name: 'impl-test',
        dependencies: [
            'require: sax',
            'require: ut-bus',
            'require: ut-port-http',
            'require: ut-port-script',
            'require: ut-run',
            'require-run: impl-test/browser'
        ]
    },
    function (err, lassoPageResult) {
        if (err) {
            console.log(err);
            return;
        }

        var headHtml = lassoPageResult.getHeadHtml();
        // headHtml will contain something similar to the following:
        // <link rel="stylesheet" type="text/css" href="static/my-page-169ab5d9.css">

        var bodyHtml = lassoPageResult.getBodyHtml();
        // bodyHtml will contain something similar to the following:
        //  <script type="text/javascript" src="static/my-page-2e3e9936.js"></script>
    });
