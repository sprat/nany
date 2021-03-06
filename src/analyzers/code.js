var array = require('core-js/library/fn/array');
var decodeEntities = require('htmldec');
var zipObject = require('zip-object');
var dom = require('src/utilities/dom');

function decodeEnt(value) {
    if (typeof value === 'string') {
        value = decodeEntities(value);
    }
    return value;
}

// get the inline JS code from a document
function getInlineJS(doc) {
    var scripts = dom.findAll('script', doc);
    var sources = scripts.map(function (script) {
        return script.attr('src') ? '' : script.text();
    });
    return sources.join('\n');
}

// parses a string representation of a Javascript value
function evaluateJS(string) {
    // should be safe because we only pass code coming from the Nainwak game
    // pages, not from user input
    // TODO: but maybe we can make it safer?
    var value = eval(string);

    if (Array.isArray(value)) {
        return value.map(decodeEnt);
    } else {
        return decodeEnt(value);
    }
}

function buildObjectFromJS(js, regex) {
    var result = {};

    js.replace(regex, function (match, name) {
        var values = array.from(arguments).slice(2, arguments.length - 2);
        values = values.map(evaluateJS);
        result[name] = (values.length > 1) ? values : values[0];
    });

    return result;
}

function buildObjectsFromJSSequences(js, regex, keys) {
    var objects = [];

    // process all matches
    js.replace(regex, function (match, sequence) {
        var values = evaluateJS('[' + sequence + ']');
        var object = zipObject(keys, values);
        objects.push(object);
    });

    return objects;
}

module.exports = {
    getInlineJS: getInlineJS,
    evaluateJS: evaluateJS,
    buildObjectFromJS: buildObjectFromJS,
    buildObjectsFromJSSequences: buildObjectsFromJSSequences
};
