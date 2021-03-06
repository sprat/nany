var test = require('tape-catch');
var dom = require('src/utilities/dom');

function createDOMNodes() {
    var parent = document.createElement('div');
    var child1 = document.createElement('div');
    var child2 = document.createElement('div');

    parent.className = 'parent';
    child1.className = 'child child1';
    child2.className = 'child child2';
    child1.innerHTML = '<b>child 1</b>';
    child2.innerHTML = '<b>child 2</b>';
    child1.setAttribute('data-num', '1');
    child2.setAttribute('data-num', '2');

    document.body.appendChild(parent);
    parent.appendChild(child1);
    parent.appendChild(child2);

    function remove() {
        document.body.removeChild(parent);
    }

    return {
        parent: parent,
        child1: child1,
        child2: child2,
        remove: remove
    };
}

test('utilities/dom: find', function (assert) {
    var nodes = createDOMNodes();

    assert.strictEqual(dom.find('.parent').node, nodes.parent, 'find child');
    assert.strictEqual(dom.find('.child1').node, nodes.child1, 'find descendant');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: findAll', function (assert) {
    var nodes = createDOMNodes();
    var children = dom.findAll('.child');

    assert.strictEqual(children.length, 2, 'findAll length');
    assert.strictEqual(children[0].node, nodes.child1, 'findAll child1');
    assert.strictEqual(children[1].node, nodes.child2, 'findAll child2');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.find', function (assert) {
    var nodes = createDOMNodes();
    var body = dom.Element(document.body);

    assert.strictEqual(body.find('.parent').node, nodes.parent, 'find child');
    assert.strictEqual(body.find('.child1').node, nodes.child1, 'find descendant');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.findAll', function (assert) {
    var nodes = createDOMNodes();
    var body = dom.Element(document.body);
    var children = body.findAll('.child');

    assert.strictEqual(children.length, 2, 'children length');
    assert.strictEqual(children[0].node, nodes.child1, 'child 1');
    assert.strictEqual(children[1].node, nodes.child2, 'child 2');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.parent', function (assert) {
    var nodes = createDOMNodes();
    var child1 = dom.Element(nodes.child1);

    assert.strictEqual(child1.parent().node, nodes.parent, 'parent');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.children', function (assert) {
    var nodes = createDOMNodes();
    var parent = dom.Element(nodes.parent);
    var children = parent.children();

    assert.strictEqual(children.length, 2, 'children length');
    assert.strictEqual(children[0].node, nodes.child1, 'child 1');
    assert.strictEqual(children[1].node, nodes.child2, 'child 2');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.firstChild', function (assert) {
    var nodes = createDOMNodes();
    var parent = dom.Element(nodes.parent);

    assert.strictEqual(parent.firstChild().node, nodes.child1, 'child 1');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.lastChild', function (assert) {
    var nodes = createDOMNodes();
    var parent = dom.Element(nodes.parent);

    assert.strictEqual(parent.lastChild().node, nodes.child2, 'child 2');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.text', function (assert) {
    var nodes = createDOMNodes();
    var child1 = dom.Element(nodes.child1);

    assert.strictEqual(child1.text(), 'child 1', 'text');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.html', function (assert) {
    var nodes = createDOMNodes();
    var child1 = dom.Element(nodes.child1);

    assert.strictEqual(child1.html(), '<b>child 1</b>', 'html');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.attr', function (assert) {
    var nodes = createDOMNodes();
    var child1 = dom.Element(nodes.child1);

    assert.strictEqual(child1.attr('data-num'), '1', 'attr');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.append', function (assert) {
    var nodes = createDOMNodes();
    var parent = dom.Element(nodes.parent);
    var div = document.createElement('div');

    parent.append(div);

    var children = parent.children();
    assert.strictEqual(children.length, 3, 'children length');
    assert.strictEqual(children[2].node, div, 'insert at the end');

    // cleanup
    nodes.remove();

    assert.end();
});

test('utilities/dom: Element.prepend', function (assert) {
    var nodes = createDOMNodes();
    var parent = dom.Element(nodes.parent);
    var div = document.createElement('div');

    parent.prepend(div);

    var children = parent.children();
    assert.strictEqual(children.length, 3, 'children length');
    assert.strictEqual(children[0].node, div, 'insert at the beginning');

    // cleanup
    nodes.remove();

    assert.end();
});
