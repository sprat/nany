var applicationUrls = require('src/application-urls');
var nainwak = require('src/nainwak');
var styles = require('./bookmarklet.css');

function getHref(config) {
    var lines = [
        'javascript:(function(config) {',
        'var w=window, l=w.location, d=w.document, b=d.body, s;',
        'if (!' + nainwak.gameUrlRegex + '.test(l.href)) {',
        '  alert("Connectez-vous sur Nainwak puis cliquez sur « Jouer ! » avant d\'utiliser le Nany");',
        '  l.assign("' + nainwak.url + '");',
        '  return;',
        '}',
        's=d.createElement("script");',
        's.type="text/javascript";',
        's.src=config.scriptUrl;',
        's.charset="utf-8";',
        's.onload=function() {',
        '  Nany.runInGame(config);',
        '  b.removeChild(s);',
        '};',
        'b.appendChild(s);',
        '}(' + JSON.stringify(config) + '))'
    ];
    return lines.join('\n').replace(/\s+/g, ' ');
}

function Bookmarklet(config) {
    var label = 'Nany ' + config.name;
    config.scriptUrl = config.scriptUrl || applicationUrls.scriptUrl;

    function render(h) {
        return h('a', {
            class: styles.bookmarklet,
            href: getHref(config),
            title: label
        }, label);
    }

    return {
        render: render
    };
}

module.exports = Bookmarklet;
