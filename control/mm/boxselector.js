wax = wax || {};
wax.mm = wax.mm || {};

// Box Selector
// ------------
wax.mm.boxselector = function(map, opts) {
    var mouseDownPoint = null,
        MM = com.modestmaps,
        callback = ((typeof opts === 'function') ?
            opts :
            opts.callback),
        boxDiv,
        box,
        boxselector = {};

    function getMousePoint(e) {
        // start with just the mouse (x, y)
        var point = new MM.Point(e.clientX, e.clientY);
        // correct for scrolled document
        point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
        point.y += document.body.scrollTop + document.documentElement.scrollTop;

        // correct for nested offsets in DOM
        for (var node = map.parent; node; node = node.offsetParent) {
            point.x -= node.offsetLeft;
            point.y -= node.offsetTop;
        }
        return point;
    }

    function mouseDown(e) {
        if (!e.shiftKey) return;

        mouseDownPoint = getMousePoint(e);

        boxDiv.style.left = mouseDownPoint.x + 'px';
        boxDiv.style.top = mouseDownPoint.y + 'px';

        MM.addEvent(map.parent, 'mousemove', mouseMove);
        MM.addEvent(map.parent, 'mouseup', mouseUp);

        map.parent.style.cursor = 'crosshair';
        return MM.cancelEvent(e);
    }


    function mouseMove(e) {
        var point = getMousePoint(e);
        boxDiv.style.display = 'block';
        if (point.x < mouseDownPoint.x) {
            boxDiv.style.left = point.x + 'px';
        } else {
            boxDiv.style.left = mouseDownPoint.x + 'px';
        }
        if (point.y < mouseDownPoint.y) {
            boxDiv.style.top = point.y + 'px';
        } else {
            boxDiv.style.top = mouseDownPoint.y + 'px';
        }
        boxDiv.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
        boxDiv.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
        return MM.cancelEvent(e);
    }

    function mouseUp(e) {
        var point = getMousePoint(e),
            l1 = map.pointLocation(point),
            l2 = map.pointLocation(mouseDownPoint),
            // Format coordinates like mm.map.getExtent().
            extent = [
                new MM.Location(
                    Math.max(l1.lat, l2.lat),
                    Math.min(l1.lon, l2.lon)),
                new MM.Location(
                    Math.min(l1.lat, l2.lat),
                    Math.max(l1.lon, l2.lon))
            ];

        box = [l1, l2];
        callback(extent);

        MM.removeEvent(map.parent, 'mousemove', mouseMove);
        MM.removeEvent(map.parent, 'mouseup', mouseUp);

        map.parent.style.cursor = 'auto';
    }

    function drawbox(map, e) {
        if (!boxDiv || !box) return;
        var br = map.locationPoint(box[0]),
            tl = map.locationPoint(box[1]);

        boxDiv.style.display = 'block';
        boxDiv.style.height = 'auto';
        boxDiv.style.width = 'auto';
        boxDiv.style.left = Math.max(0, tl.x) + 'px';
        boxDiv.style.top = Math.max(0, tl.y) + 'px';
        boxDiv.style.right = Math.max(0, map.dimensions.x - br.x) + 'px';
        boxDiv.style.bottom = Math.max(0, map.dimensions.y - br.y) + 'px';
    }

    boxselector.add = function(map) {
        boxDiv = document.createElement('div');
        boxDiv.id = map.parent.id + '-boxselector-box';
        boxDiv.className = 'boxselector-box';
        map.parent.appendChild(boxDiv);

        MM.addEvent(map.parent, 'mousedown', mouseDown);
        map.addCallback('drawn', drawbox);
        return this;
    };

    boxselector.remove = function() {
        map.parent.removeChild(boxDiv);
        map.removeCallback('mousedown', drawbox);
    };

    return boxselector.add(map);
};
