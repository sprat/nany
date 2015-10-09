/* Development settings */
define(['require', 'utils/url'], function (require, urlUtils) {
    function fullUrl(path) {
        var relativeUrl = require.toUrl(path);
        return urlUtils.normalize(relativeUrl);
    }

    var scriptUrl = fullUrl('dist/nany.js'),
        cssUrl = fullUrl('dist/nany.css');

    return {
        channel: 'default',
        scriptUrl: scriptUrl,
        cssUrl: cssUrl
    };
});
