wax = wax || {};
wax.g = wax.g || {};

// Attribution
// -----------
// Attribution wrapper for Google Maps.
wax.g.attribution = function(options) {
    options = options || {};
    var a, // internal attribution control
        attribution = {};

    attribution.element = function() {
        return a.element();
    };

    attribution.appendTo = function(elem) {
        wax.util.$(elem).appendChild(a.element());
        return this;
    };

    attribution.init = function() {
        a = wax.attribution();
        a.set(options.attribution);
        a.element().className = 'wax-attribution wax-g';
        return this;
    };

    return attribution.init();
};
