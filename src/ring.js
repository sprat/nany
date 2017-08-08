var xhr = require('xhr');
var serializeHTML = require('print-html');
var httpHeaders = require('./http-headers');
var Button = require('./widgets/button');
var Window = require('./widgets/window');
var styles = require('./ring.css');
var log = require('./log');

/* Ring class */
function Ring(config, storage, refreshUI) {
    var updateUrl = config.updateUrl;
    var loginUrl = config.loginUrl;

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
        refreshUI();
    }

    function logout() {
        // remove authorization
        storage.set(authKey, undefined);

        // update out state
        enabled = false;

        // update the UI
        refreshUI();
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

    // login button
    var loginButton = Button('Connexion');
    loginButton.clicked.add(function () {
        // open the login window
        loginWindow.open(loginUrl);
    });

    // logout button
    var logoutButton = Button('Déconnexion');
    logoutButton.clicked.add(function () {
        logout();
    });

    function getAuthorization() {
        return storage.get(authKey);
    }

    function send(page, doc, date, analysis, joueur) {
        if (!enabled) {
            log('No update sent: disabled');
            return;
        }

        var retryAfterDate = retryAfterDates[page.url];
        if (retryAfterDate && date < retryAfterDate) {
            log('No update sent: rate-limit reached');
            return;
        }

        var data = {
            url: page.url,
            type: page.type,
            raw: serializeHTML(doc),
            contenu: analysis,
            date: date,
            joueur: joueur.nom
        };

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

            if (status === 401) {  // TODO: what about 403?
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
        var button;
        if (loginUrl) {
            button = enabled ? logoutButton : loginButton;
        }

        return h('div', { class: styles.ring }, [
            h('p', 'Ring: mise à jour ' + enabledWord),
            button ? button.render(h) : ''
        ]);
    }

    return {
        send: send,
        render: render
    };
}

module.exports = Ring;
