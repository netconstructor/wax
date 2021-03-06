wax = wax || {};
wax.mm = wax.mm || {};

// Legend Control
// --------------
// The Modest Maps version of this control is a very, very
// light wrapper around the `/lib` code for legends.
wax.mm.legend = function(options) {
    options = options || {};
    var l, // parent legend
        legend = {};

    legend.add = function() {
        l = wax.legend()
            .content(options.legend || '');
        return this;
    };

    legend.element = function() {
        return l.element();
    };

    legend.appendTo = function(elem) {
        wax.util.$(elem).appendChild(l.element());
        return this;
    };

    return legend.add();
};
