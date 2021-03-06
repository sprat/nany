var assign = require('core-js/library/fn/object/assign');
var xhr = require('xhr');
var Window = require('src/window');
var httpHeaders = require('src/utilities/http-headers');
var log = require('src/utilities/log');
var styles = require('./ring.css');

/* Ring class */
function Ring(config, storage, scheduleRender) {
    // read config
    var updateUrl = config.updateUrl;
    if (!updateUrl) {
        throw 'The ring configuration should specify an updateUrl';
    }
    var loginUrl = config.loginUrl;
    var monitoredPages = config.pages || ['detect', 'invent', 'perso', 'even', 'encyclo'];

    // authorization key in storage
    var authKey = 'ring:authorization';

    // update enabled?
    var enabled = !loginUrl || !!getAuthorization();

    // store the retry after dates for each page type
    var retryAfterDates = {};

    function login(authorization) {
        // add authorization
        storage.set(authKey, authorization);

        // update our state
        enabled = true;

        // update the UI
        scheduleRender();
    }

    function logout() {
        // remove authorization
        storage.set(authKey, undefined);

        // update out state
        enabled = false;

        // update the UI
        scheduleRender();
    }

    // login window
    var loginWindow = Window();
    loginWindow.messageReceived.add(function (authorization, origin) {
        // close the login window
        loginWindow.close();

        // check origin
        if (origin !== loginWindow.initialOrigin) {
            log('Invalid origin in authorization message, should match the loginUrl one');
            return;
        }

        log('Authorization: ' + authorization);
        login(authorization);
    });

    function openLoginWindow() {
        loginWindow.open(loginUrl);
    }

    function getAuthorization() {
        return storage.get(authKey);
    }

    function isPageMonitored(page) {
        return monitoredPages.indexOf(page.type) > -1;
    }

    function processPage(page, analysis, joueur) {
        if (!isPageMonitored(page)) {
            log('No update sent: page not monitored');
            return;
        }

        if (!enabled) {
            log('No update sent: updates disabled');
            return;
        }

        var retryAfterDate = retryAfterDates[page.url];
        if (retryAfterDate && analysis.date < retryAfterDate) {
            log('No update sent: rate-limit reached');
            return;
        }

        var data = {
            url: page.url,
            type: page.type,
            joueur: joueur.nom
        };

        assign(data, analysis);

        var options = {
            url: updateUrl,
            method: 'POST',
            headers: {
                // This header is set to tell the server that we are calling it
                // from a XHR request. In that case, it must not send a
                // "WWW-Authenticate: Basic" header back to us since we can't
                // handle it properly cross-browser.
                'X-Requested-With': 'XMLHttpRequest'
            },
            json: data
        };

        var authorization = getAuthorization();
        if (authorization) {
            options.headers['Authorization'] = authorization;
        }

        log('Sending an update to ' + updateUrl);

        xhr(options, function (error, response) {
            var status = response.statusCode;
            var isOk = (status >= 200 && status < 300);
            var label = isOk ? 'OK' : 'FAIL';
            log(label + ' (' + status + ')');

            if ((status === 401) || (status === 403)) {
                logout();  // remove invalid authorization
                return;
            }

            // handle rate-limiting header
            var retryAfterDate = httpHeaders.getRetryAfter(response.headers);
            retryAfterDates[page.url] = retryAfterDate;
        });
    }

    function render(h) {
        var enabledWord = enabled ? 'activée' : 'désactivée';

        var button = '';
        if (loginUrl) {
            if (enabled) {
                button = h('button', { key: logout, onclick: logout }, 'Déconnexion');
            } else {
                button = h('button', { key: openLoginWindow, onclick: openLoginWindow }, 'Connexion');
            }
        }

        return h('div', { class: styles.ring }, [
            h('p', 'Ring: mise à jour ' + enabledWord),
            button
        ]);
    }

    return {
        processPage: processPage,
        render: render
    };
}

module.exports = Ring;
