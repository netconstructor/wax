wax = wax || {};
wax.mm = wax.mm || {};

// ZoomBox
// -------
// An OL-style ZoomBox control, from the Modest Maps example.
wax.mm.zoombox = function(map, opts) {
    // TODO: respond to resize
    var zoombox = {},
        mm = com.modestmaps,
        drawing = false,
        box,
        mouseDownPoint = null;

    function getMousePoint(e) {
        // start with just the mouse (x, y)
        var point = new mm.Point(e.clientX, e.clientY);
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

    function mouseUp(e) {
        if (!drawing) return;

        drawing = false;
        var point = getMousePoint(e);

        var l1 = map.pointLocation(point),
            l2 = map.pointLocation(mouseDownPoint);

        map.setExtent([l1, l2]);

        box.style.display = 'none';
        mm.removeEvent(map.parent, 'mousemove', mouseMove);
        mm.removeEvent(map.parent, 'mouseup', mouseUp);

        map.parent.style.cursor = 'auto';
    }

    function mouseDown(e) {
        if (!(e.shiftKey && !this.drawing)) return;

        drawing = true;
        mouseDownPoint = getMousePoint(e);

        box.style.left = mouseDownPoint.x + 'px';
        box.style.top = mouseDownPoint.y + 'px';

        mm.addEvent(map.parent, 'mousemove', mouseMove);
        mm.addEvent(map.parent, 'mouseup', mouseUp);

        map.parent.style.cursor = 'crosshair';
        return mm.cancelEvent(e);
    }

    function mouseMove(e) {
        if (!drawing) return;

        var point = getMousePoint(e);
        box.style.display = 'block';
        if (point.x < mouseDownPoint.x) {
            box.style.left = point.x + 'px';
        } else {
            box.style.left = mouseDownPoint.x + 'px';
        }
        box.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
        if (point.y < mouseDownPoint.y) {
            box.style.top = point.y + 'px';
        } else {
            box.style.top = mouseDownPoint.y + 'px';
        }
        box.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
        return mm.cancelEvent(e);
    }

    zoombox.add = function(map) {
        // Use a flag to determine whether the zoombox is currently being
        // drawn. Necessary only for IE because `mousedown` is triggered
        // twice.
        box = document.createElement('div');
        box.id = map.parent.id + '-zoombox-box';
        box.className = 'zoombox-box';
        map.parent.appendChild(box);
        mm.addEvent(map.parent, 'mousedown', mouseDown);
    };

    zoombox.remove = function() {
        map.parent.removeChild(box);
        map.removeCallback('mousedown', mouseDown);
    };

    return zoombox.add(map);
};
