UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = ./node_modules/.bin/banner

dist: dist_setup dist/wax.ol.min.js dist/wax.g.min.js dist/wax.mm.min.js dist/wax.leaf.min.js lint

dist/wax.ol.min.js:
	cat build/header.js ext/reqwest.min.js lib/*.js control/lib/*.js control/ol/*.js > dist/wax.ol.js
	$(UGLIFYJS) dist/wax.ol.js > dist/wax.ol.min.js

dist/wax.g.min.js:
	cat build/header.js ext/reqwest.min.js lib/*.js control/lib/*.js control/g/*.js connectors/g/*.js > dist/wax.g.js
	$(UGLIFYJS) dist/wax.g.js > dist/wax.g.min.js

dist/wax.mm.min.js:
	cat build/header.js ext/reqwest.min.js lib/*.js control/lib/*.js control/mm/*.js connectors/mm/*.js > dist/wax.mm.js
	$(UGLIFYJS) dist/wax.mm.js > dist/wax.mm.min.js

dist/wax.leaf.min.js:
	cat build/header.js ext/reqwest.min.js lib/*.js control/lib/*.js control/leaf/*.js > dist/wax.leaf.js
	$(UGLIFYJS) dist/wax.leaf.js > dist/wax.leaf.min.js

dist_setup:
	mkdir dist
	mkdir build
	$(BANNER) package.json > build/header.js

clean:
	rm -rf dist
	rm -rf build

doc:
	./node_modules/.bin/docco control/mm/*.js

ext:
	-test ! -d ext && mkdir ext
	wget --no-check-certificate http://openlayers.org/api/2.10/OpenLayers.js -O ext/OpenLayers.js
	wget --no-check-certificate https://raw.github.com/CloudMade/Leaflet/master/dist/leaflet.js -O ext/leaflet.js
	wget --no-check-certificate https://raw.github.com/CloudMade/Leaflet/master/dist/leaflet.css -O ext/leaflet.css
	wget --no-check-certificate https://raw.github.com/CloudMade/Leaflet/master/dist/leaflet.ie.css -O ext/leaflet.ie.css
	wget --no-check-certificate https://github.com/stamen/modestmaps-js/raw/v0.17.0/modestmaps.min.js -O ext/modestmaps.min.js

lint:
	./node_modules/.bin/jshint control/lib/*.js control/mm/*.js control/leaf/*.js --config=jshint.json

.PHONY: ext doc clean
