var extend = require('xtend/mutable');
var Dom = require('../dom');
var Analyzer = require('./analyzer');
var Calcul = require('../calcul');
var Popin = require('../popin');
var int = Analyzer.int;

var listNames = {
    bonnet: 'bonnet',  // objet sous le bonnet
    poser: 'inventaire',  // objet dans l'inventaire, on peut le poser
    ramasser: 'sol',  // objet au sol, on peut le ramasser
    encyclo: 'encyclo',  // objet dans l'encyclo
    fee: 'fee'  // quand on fait une recette ?
};

function analyze(js, context) {
    var regex = /mip\((.*)\);/ig;
    var keys = 'idtable,nomobjet,photoobjet,descriptionobjet,model,typeobjet,PAutiliser,portee,effet,recharg,PV,PVmax,PAreparer,dispo,PFobj,PPobj,PVobj,PIobj,collant,reparable,poussiere'.split(',');
    var objects = Analyzer.buildObjectsFromJSSequences(js, regex, keys);
    var lists = {};

    function getList(object) {
        var listName = listNames[object.model];
        var list = lists[listName];

        if (list === undefined) {
            list = lists[listName] = [];
        }

        return list;
    }

    objects.forEach(function (object) {
        var list = getList(object);
        list.push({
            id: object.idtable,
            nom: object.nomobjet,
            image: '/images/' + object.photoobjet,
            description: object.descriptionobjet,
            type: object.typeobjet.toLowerCase(),
            PAutiliser: int(object.PAutiliser),
            portee: int(object.portee),
            dommages: int(object.effet),
            rechargement: int(object.recharg),
            PV: int(object.PV),
            PVmax: int(object.PVmax),
            PAreparer: int(object.PAreparer),
            dispo: int(object.dispo),
            forceBonus: int(object.PFobj),
            precisionBonus: int(object.PPobj),
            intelligenceBonus: int(object.PIobj),
            vieBonus: int(object.PVobj),
            collant: object.collant === 'O',
            reparable: object.reparable === 'O',
            poussiere: int(object.poussiere)
        });
    });

    context.objets = context.objets || {};
    extend(context.objets, lists);

    // update the 'perso' bonus data according to the objects in 'inventaire'
    if (context.perso) {
        var bonuses = Calcul.bonusObjets(context.objets.inventaire);
        extend(context.perso, bonuses);
    }

    return lists;
}

function ObjetInfo(objet, perso) {
    var isArme = objet.type === 'arme';
    var degats = (isArme && perso) ? Calcul.degats(perso, objet) : undefined;

    function render(h) {
        if (degats) {
            return h('div.degats', 'Dégâts : entre ' + degats.minimum + ' et ' + degats.maximum);
        }
    }

    return {
        render: render
    };
}

function enhance(doc, objets, perso) {
    var mounter = Dom.Mounter();
    var imageElements = Dom.findAll('td.news-text img', doc);

    // add an advisor box on each title
    imageElements.forEach(function (image, index) {
        var objet = objets[index];
        var objetInfo = ObjetInfo(objet, perso);
        var popin = Popin('?', objetInfo);
        mounter.prepend(image.parent(), popin);
    });
}

module.exports = {
    analyze: analyze,
    enhance: enhance,
    ObjetInfo: ObjetInfo
};