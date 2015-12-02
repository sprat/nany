/*global require:true */
/*exported require */
var require = {
    //urlArgs: 'cachebust=' + (new Date()).getTime(),  // prevents caching
    baseUrl: 'js',
    paths: {
        'require': 'vendor/require',
        'text': 'vendor/text',
        'pubnub': 'vendor/pubnub',
        'tinyemitter': 'vendor/tinyemitter'
    },
    shim: {
        'pubnub': {
            exports: 'PUBNUB'
        },
        'tinyemitter': {
            exports: 'E'
        }
    },
    packages: ['nany', 'nany/nainwak']
};
