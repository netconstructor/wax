## Changelog

### 2.1.6

* Fix for window margin offset calculation.
* Fix zoombox control in IE.

### 2.1.5

* Fixed Hash in FF 4.x

### 2.1.4

* Fixed Interaction in FF 3.6.x
* Optimized Modest Maps scrolling behavior on interactive maps
* Fixed OpenLayers compatibility bug between 2.9 and 2.10

### 2.1.3

* Fixing a touch javascript error.

### 2.1.1

* Overeager touch-events handling fixed.

### 2.1.0

* Leaflet compatibility - interaction control and documentation.
* New pushState-based hash manager, used by default.
* Interaction support on mobile devices, with fallback to
  teaser if full formatter isnt available.

### 2.0.0

* Stripped down the README, now references the manual.
* Renamed `build` to `dist` to avoid `npm` cleanup problems.
* Fix for interaction in Firefox with body margins.
* Added OpenLayers and Google to manual.
* Removed Google and Modest Maps embedder controls. Will return some day...
* All Modest Maps controls are flipped - instead of being extensions of the
  `com.modestmaps.Map` object, they are off of the `wax` object and are
  called with the map as the first argument and an options object as the second
* Modest Maps controls and provider moved from `wax.*` to `wax.mm.*`.
* Google control API changed from `wax.g.Controls` object to `wax.g.*`
  mirroring Modest Maps controls API.
* jQuery, jQuery-jsonp, and Underscore dependency removed
* `gridutil` now uses [reqwest](https://github.com/ded/reqwest) as its
  XMLHTTPRequest library.

#### 1.4.2

* Beta pointselector control.
* Make zoombox removable.

#### 1.4.1

* Tweaks to `boxselect` including removability.

#### 1.4.0

* Added `.boxselect(function())`

#### 1.3.0

* Added `.zoombox()` and `hash()` controls for Modest Maps.

#### 1.2.1

* Bug fixes for OpenLayers

#### 1.2.0

* Functions on the Google Maps `Controls` object are now lowercase.
* Changed `WaxProvider`'s signature: now takes an object of settings and supports multiple domains, filetypes and zoom restrictions.
* Changed `wax.g.MapType`'s signature: now accepts an object of settings in the same form as `WaxProvider`
* Modest Maps `.interaction()` now supports clicks, with the same `clickAction` setting as the OpenLayers version.
* Added large manual for usage.
* Fixed Modest Maps `.fullscreen()` sizing.
* Removed `/examples` directory: examples will be in manuals.
* Performance optimization of interaction code: no calculations are performed during drag events.

#### 1.1.0

* connector/mm: Added [Modest Maps](https://github.com/stamen/modestmaps-js) connector.
* control/mm: Added `.legend()`, `.interaction()`, `.fullscreen()`, and `.zoomer()` controls for Modest Maps.
* control/lib: Added `addedTooltip` event to `tooltip.js` to allow for external styling code.

#### 1.0.4

* connector/g: Hide error tiles and wrap on dateline.
* connector/g: Performance improvements.
* control/legend: Fix rerender bug.
* control/tooltip: `addedtooltip` event for binding/extending tooltip behavior. Subject to change.

#### 1.0.3

* Embedder functionality for Google Maps and OpenLayers.

#### 1.0.2

* Bug fixes for Firefox 3.

#### 1.0.1

* `make ext` added for downloading and installing external libraries needed to use examples.
* Bug fixes for legend, IE compatibility.

#### 1.0.0

* Initial release.
