wax = wax || {};
wax.mm = wax.mm || {};

// A layer connector for Modest Maps
//
// ### Required arguments
//
// * `base_url` first argument that can be a string for a single
// server or an array to hit multiple servers or CNAMEs.
// * `layername`
//
// ### Optional arguments
//
// * `filetype`: like `.jpeg` (default `.png`)
// * `zoomrange`: like [0, 10] (default [0, 18])
wax.mm.provider = function(options) {
    this.layerName = options.layerName;
    
    options.baseUrl = options.baseUrl || options.tiles;

    this.baseUrls = (typeof(options.baseUrl) == 'string') ?
            [options.baseUrl] : options.baseUrl;
    this.n_urls = this.baseUrls.length;
    this.filetype = options.filetype || '.png';
    this.zoomRange = options.zoomRange || [0, 18];
};

wax.mm.provider.prototype = {
    outerLimits: function() {
        return [
            new com.modestmaps.Coordinate(0,0,0).zoomTo(this.zoomRange[0]),
            new com.modestmaps.Coordinate(1,1,0).zoomTo(this.zoomRange[1])
        ];
    },
    getTileUrl: function(coord) {
        var server;
        coord = this.sourceCoordinate(coord);
        if (!coord) {
            return null;
        }

        var worldSize = Math.pow(2, coord.zoom);
        coord.row = Math.pow(2, coord.zoom) - coord.row - 1;
        if (this.n_urls === 1) {
            server = this.baseUrls[0];
        } else {
            server = this.baseUrls[parseInt(worldSize * coord.row + coord.column, 10) % this.n_urls];
        }
        var imgPath = ['1.0.0', this.layerName, coord.zoom, coord.column, coord.row].join('/');
        return server + imgPath + this.filetype;
    }
};

// Wax shouldn't throw any exceptions if the external it relies on isn't
// present, so check for modestmaps.
if (com && com.modestmaps) {
    com.modestmaps.extend(wax.mm.provider, com.modestmaps.MapProvider);
}
