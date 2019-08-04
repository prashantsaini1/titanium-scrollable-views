
$.index.open();

function add() {
    $.scrollWidget.add([Ti.UI.createView(), Ti.UI.createView(), Ti.UI.createView()], ["#a00", '#0a0', '#aa0'], true);
}

function remove() {
    $.scrollWidget.remove(0);
    $.scrollWidget.remove(0);
    $.scrollWidget.remove(0); 
}

// master