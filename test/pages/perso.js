var test = require('tape-catch'),
    path = require('path'),
    fs = require('fs'),
    helpers = require('../helpers'),
    page = require('../../lib/pages/perso'),
    html = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'perso.html'), 'utf8'),
    doc = helpers.parseHTMLDocument(html);


test('perso.analyze', function (assert) {
    var info = page.analyze(doc);

    /*
    [HosseGorgones] Palme
    Ami(e) des nains-béciles (des bêtes), Longueur de la barbe 68,06cm
    Armé de ton(ta) Tuba [perso]
    Quitte à taper un petit level, tapez Rêveur ! Gagnant de la palme d'or du meilleur nom de nain.
    Points de Vie   138/148 [109 +39]
    Force   4 [31 -27]
    Précision   310 [310 +0]
    Intelligence    112 [90 +22]
    Points d'Honneur    1 [0 +1]
    Points de Côté  13
    Points de Ridicule  1
    Points de Honte 0
    Points d'XP 5
    Nombre d'ennemis tués   16
    Nombre de morts 2
    Nombre de gifles données    186
    Nombre de gifles reçues 0
    Votre cible Nelson
    Cancre (nain-culte)
    Longueur de la barbe : 61,68cm
    Nombre de chasseurs 2 (Longueur moyenne de la barbe : 54,80cm)
    */

    // TODO: cible (nom, cote, point de cote, barbe), chasseurs (nombre, barbe)
    assert.deepEqual(info, {
        nom: 'Palme',
        image: '/images/avatar_guilde/fade976ec961a21e13af618e54476d1a5c285d7a.png',
        rang: 'Ami(e) des nains-béciles (des bêtes)',
        classe: 'brave',
        barbe: 68.06,
        description: "Quitte à taper un petit level, tapez Rêveur ! Gagnant de la palme d'or du meilleur nom de nain.",
        arme: 'Tuba',
        tag: {
            guilde: {
                nom: 'Gorgones',
                couleur: '#DA6400'
            },
            perso: 'Hosse',
            type: 1
        },
        vie: 138,
        vieTotal: 148,
        vieBase: 109,
        vieBonus: 39,
        force: 4,
        forceBase: 31,
        forceBonus: -27,
        precision: 310,
        precisionBase: 310,
        precisionBonus: 0,
        intelligence: 112,
        intelligenceBase: 90,
        intelligenceBonus: 22,
        honneur: 1,
        honneurBase: 0,
        honneurBonus: 1,
        cote: 13,
        ridicule: 1,
        honte: 0,
        xp: 5,
        tues: 16,
        morts: 2,
        giflesDonnees: 186,
        giflesRecues: 0,
        cible: {
            nom: 'Nelson',
            classe: 'sadique',
            rang: 'Cancre (nain-culte)',
            barbe: 61.68
        },
        chasseurs: {
            nombre: 2,
            barbe: 54.80
        }
    });
    assert.end();
});