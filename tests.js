/*global
    Nainwaklet, document, QUnit, jslint
 */
/*jslint
    devel: true
 */

(function () {
    'use strict';

    function loadUrl(assert, url, processResponse) {
        var done = assert.async(),
            random = Math.floor(Math.random() * 1000000),
            requestUrl = url + '?v=' + random,  // prevents caching
            options = {},
            getBody = function (body) {
                return body;
            };

        // HTML files: load as a document, but export to text just after
        // this solves encoding problems
        if (url.match(/\.html?$/)) {
            options = {responseType: 'document'};
            getBody = function (document) {
                return document.documentElement.outerHTML;
            };
        }

        Nainwaklet.testing.ajaxRequest(requestUrl, options, function (response) {
            if (response.status === 200) {
                try {
                    processResponse(getBody(response.body));
                } catch (e) {
                    assert.ok(false, e);
                }
            } else {
                assert.ok(false, 'Error while fetching url ' + url + ': ' + response.status);
            }
            done();
        });
    }

    /*
    QUnit.test('createApplication', function (assert) {
        assert.ok(Nainwaklet.createApplication, 'Nainwaklet should have an "createApplication" function');
    });
    */

    QUnit.test('pages', function (assert) {
        var pages = Nainwaklet.testing.pages;
        assert.ok(pages, 'Nainwaklet.pages available');
        assert.ok(pages.detect, 'Get page by name');
        assert.strictEqual(pages.getByUrl('http://www.nainwak.com/jeu/detect.php'), pages.detect, 'Get page by url');
    });

    QUnit.test('detect page', function (assert) {
        var detect = Nainwaklet.testing.pages.detect;

        loadUrl(assert, 'fixtures/detect.html', function (response) {
            var info = detect.analyze(response);

            console.log(info);
            assert.deepEqual(info.position, [13, 5], 'Position');
            assert.strictEqual(info.monde, 'Monde des sadiques', 'Monde');

            var nains = info.nains;
            assert.strictEqual(nains.length, 3, 'Nombre de nains');

            // TODO: add more tests about nains
            // ["33966", "avatar_guilde/41ddb8ad2c2be408e27352accf1cc0b6559466bb.png", "Le PheniX", '[Gnouille] [<span style="color:#91005D;">#!</span>]', "13799", "2", "Diablotin(e)", "0", "13", "5", "&quot;Le PheniX est un oiseau qui symbolise l&#039;immortalité et la résurrection.&quot; A quoi bon me tuer ?!?", "o", "", "0"];
            assert.deepEqual(nains[0], {
                id: 33966,
                nom: "Le PheniX",
                image: "http://www.nainwak.com/images/avatar_guilde/41ddb8ad2c2be408e27352accf1cc0b6559466bb.png",
                description: "\"Le PheniX est un oiseau qui symbolise l'immortalité et la résurrection.\" A quoi bon me tuer ?!?",
                position: [13, 5]
            }, 'Nain 1');

            // ["33924", "avatar/perso/dab064da974199a53f0e22527f901d523e8869b3.png", "Bourinain", '[G-NOUILLE<span style="color:#00C200;">#sNOUFFF</span>]', "10314", "2", "Cancre (nain-culte)", "0", "13", "5", "Description", "o", "", "0"];
            assert.deepEqual(nains[1], {
                id: 33924,
                nom: "Nainkomp'",
                image: "http://www.nainwak.com/images/avatar/perso/dab064da974199a53f0e22527f901d523e8869b3.png",
                description: "Description",
                position: [14, 5]
            }, 'Nain 2');

            // ["57588", "avatar/perso/a1d23b4611fd59736d6ef385c5f5c24cb3e5aca4.png", "pingu", '[LOVE-SKY]', "9645", "2", "Petit-gros (nain-gras)", "1", "13", "6", "je bois pour oublier mais j&#039;oublie d&#039;arreter...", "o", "", "0"];
            assert.deepEqual(nains[2], {
                id: 57588,
                nom: "pingu",
                image: "http://www.nainwak.com/images/avatar/perso/a1d23b4611fd59736d6ef385c5f5c24cb3e5aca4.png",
                description: "je bois pour oublier mais j'oublie d'arreter...",
                position: [13, 6]
            }, 'Nain 3');

            var objets = info.objets;
            assert.strictEqual(nains.length, 3, "Nombre d'objets");

            // [3613899, "objets/jouetkinder2_2.gif", "Surprise de Kine d&#039;Heure", 1, 13, 6, "INUTILE", 1271419];
            assert.deepEqual(objets[0], {
                id: 3613899,
                nom: "Surprise de Kine d'Heure",
                image: "http://www.nainwak.com/images/objets/jouetkinder2_2.gif",
                categorie: "INUTILE",
                position: [13, 6]
                //poussiere: 1271419
            }, 'Objet 1');

            //tabobjet[2] = [3613897, "objets/banane_sauteuse.gif", "Banane sauteuse", 1, 13, 6, "VEHICULE", 1271419];
            assert.deepEqual(objets[1], {
                id: 3613897,
                nom: "Banane sauteuse",
                image: "http://www.nainwak.com/images/objets/banane_sauteuse.gif",
                categorie: "VEHICULE",
                position: [13, 6]
                //poussiere: 1271419
            }, 'Objet 2');

            //tabobjet[3] = [3613896, "objets/naindiana.gif", "Panoplie de Naindiana Jones", 2, 13, 7, "RUNE", 1271419];
            assert.deepEqual(objets[2], {
                id: 3613896,
                nom: "Panoplie de Naindiana Jones",
                image: "http://www.nainwak.com/images/objets/naindiana.gif",
                categorie: "RUNE",
                position: [13, 7]
                //poussiere: 1271419
            }, 'Objet 3');
        });
    });

    QUnit.test('JSLint', function (assert) {
        function formatWarnings(analysis, source) {
            var sourceLines = source.split(/\r?\n/g),
                warnings = [];

            analysis.warnings.forEach(function (warning) {
                var str = '@ line ' + warning.line + ' column ' + warning.column + ': '
                        + warning.message + '\n'
                        + sourceLines[warning.line];
                warnings.push(str);
            });

            return warnings.join('\n\n');
        }

        function checkSource(url) {
            loadUrl(assert, url, function (source) {
                var analysis = jslint(source),
                    warnings = formatWarnings(analysis, source);

                assert.strictEqual(warnings, '', url);
            });
        }

        checkSource('nainwaklet.js');
        checkSource('tests.js');
    });
}());