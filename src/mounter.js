var maquette = require('maquette');
var classNames = require('classnames');
var dom = require('./dom');
var styles = require('./mounter.css');
var h = maquette.h;

h.render = function (child) {
    if (child.render) {
        return child.render(h);
    }

    if (typeof child === 'function') {
        return child(h);
    }

    return child;
};

var empty = h('div', {
    styles: {
        display: 'none'
    }
});

function addStyle(vnode) {
    var properties = vnode.properties = vnode.properties || {};
    properties.class = classNames(properties.class, styles.mount);
    return vnode;
}

function Mounter() {
    // create a maquette projector for the rendering
    var projector = maquette.createProjector();

    // refresh all the components mounted by this mounter
    function scheduleRender() {
        projector.scheduleRender();
    }

    // method: append / insertBefore / replace / merge
    function mount(method, element, component) {
        // render the virtual DOM tree
        function renderTree() {
            var rendered = h.render(component);
            return rendered ? addStyle(rendered) : empty;
        }

        // unmount the component (does not restore the original node)
        function unmount() {
            projector.detach(renderTree);
        }

        // add the component to the projector
        projector[method](element.node, renderTree);

        // return the unmount function
        return unmount;
    }

    // append a component to a parent node
    function append(node, component) {
        return mount('append', dom.Element(node), component);
    }

    // prepend a component to a parent node
    function prepend(node, component) {
        return mount('insertBefore', dom.Element(node).firstChild(), component);
    }

    // replace a node by a component
    function replace(node, component) {
        return mount('replace', dom.Element(node), component);
    }

    return {
        append: append,
        prepend: prepend,
        replace: replace,
        scheduleRender: scheduleRender
    };
}

module.exports = Mounter;
