/*!
  * Reqwest! A x-browser general purpose XHR connection manager
  * copyright Dustin Diaz 2011
  * https://github.com/ded/reqwest
  * license MIT
  */
!function(window){function serial(a){var b=a.name;if(a.disabled||!b)return"";b=enc(b);switch(a.tagName.toLowerCase()){case"input":switch(a.type){case"reset":case"button":case"image":case"file":return"";case"checkbox":case"radio":return a.checked?b+"="+(a.value?enc(a.value):!0)+"&":"";default:return b+"="+(a.value?enc(a.value):!0)+"&"}break;case"textarea":return b+"="+enc(a.value)+"&";case"select":return b+"="+enc(a.options[a.selectedIndex].value)+"&"}return""}function enc(a){return encodeURIComponent(a)}function reqwest(a,b){return new Reqwest(a,b)}function init(o,fn){function error(a){o.error&&o.error(a),complete(a)}function success(resp){o.timeout&&clearTimeout(self.timeout)&&(self.timeout=null);var r=resp.responseText;switch(type){case"json":resp=eval("("+r+")");break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp),o.success&&o.success(resp),complete(resp)}function complete(a){o.complete&&o.complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort(),error()},o.timeout)),this.request=getRequest(o,success,error)}function setType(a){if(/\.json$/.test(a))return"json";if(/\.jsonp$/.test(a))return"jsonp";if(/\.js$/.test(a))return"js";if(/\.html?$/.test(a))return"html";if(/\.xml$/.test(a))return"xml";return"js"}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function getRequest(a,b,c){if(a.type!="jsonp"){var f=xhr();f.open(a.method||"GET",typeof a=="string"?a:a.url,!0),setHeaders(f,a),f.onreadystatechange=readyState(f,b,c),a.before&&a.before(f),f.send(a.data||null);return f}var d=doc.createElement("script"),e=getCallbackName(a);window[e]=generalCallback,d.type="text/javascript",d.src=a.url,d.async=!0,d.onload=function(){a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(d)},head.insertBefore(d,topScript)}function generalCallback(a){lastValue=a}function getCallbackName(a){var b=a.jsonpCallback||"callback";if(a.url.substr(-(b.length+2))==b+"=?"){var c="reqwest_"+uniqid++;a.url=a.url.substr(0,a.url.length-1)+c;return c}var d=new RegExp(b+"=([\\w]+)");return a.url.match(d)[1]}function setHeaders(a,b){var c=b.headers||{};c.Accept="text/javascript, text/html, application/xml, text/xml, */*",c["X-Requested-With"]=c["X-Requested-With"]||"XMLHttpRequest";if(b.data){c["Content-type"]="application/x-www-form-urlencoded";for(var d in c)c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d],!1)}}function readyState(a,b,c){return function(){a&&a.readyState==4&&(twoHundo.test(a.status)?b(a):c(a))}}var twoHundo=/^20\d$/,doc=document,byTag="getElementsByTagName",topScript=doc[byTag]("script")[0],head=topScript.parentNode,xhr="XMLHttpRequest"in window?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")},uniqid=0,lastValue;Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serialize=function(a){var b=a[byTag]("input"),c=a[byTag]("select"),d=a[byTag]("textarea");return(v(b).chain().toArray().map(serial).value().join("")+v(c).chain().toArray().map(serial).value().join("")+v(d).chain().toArray().map(serial).value().join("")).replace(/&$/,"")},reqwest.serializeArray=function(a){for(var b=this.serialize(a).split("&"),c=0,d=b.length,e=[],f;c<d;c++)b[c]&&(f=b[c].split("="))&&e.push({name:f[0],value:f[1]});return e};var old=window.reqwest;reqwest.noConflict=function(){window.reqwest=old;return this},window.reqwest=reqwest}(this)// Instantiate objects based on a JSON "record". The record must be a statement
// array in the following form:
//
//     [ "{verb} {subject}", arg0, arg1, arg2, ... argn ]
//
// Each record is processed from a passed `context` which starts from the
// global (ie. `window`) context if unspecified.
//
// - `@literal` Evaluate `subject` and return its value as a scalar. Useful for
//   referencing API constants, object properties or other values.
// - `@new` Call `subject` as a constructor with args `arg0 - argn`. The
//   newly created object will be the new context.
// - `@call` Call `subject` as a function with args `arg0 - argn` in the
//   global namespace. The return value will be the new context.
// - `@chain` Call `subject` as a method of the current context with args `arg0
//   - argn`. The return value will be the new context.
// - `@inject` Call `subject` as a method of the current context with args
//   `arg0 - argn`. The return value will *not* affect the context.
// - `@group` Treat `arg0 - argn` as a series of statement arrays that share a
//   context. Each statement will be called in serial and affect the context
//   for the next statement.
//
// Requirements:
//
// - Underscore.js
// - jQuery @TODO: only used for $.browser check. Could probably be removed.
//
// Usage:
//
//     var gmap = ['@new google.maps.Map',
//         ['@call document.getElementById', 'gmap'],
//         {
//             center: [ '@new google.maps.LatLng', 0, 0 ],
//             zoom: 2,
//             mapTypeId: [ '@literal google.maps.MapTypeId.ROADMAP' ]
//         }
//     ];
//     wax.Record(gmap);
var wax = wax || {};
wax.Record = function(obj, context) {
    var getFunction = function(head, cur) {
        var ret = _.reduce(head.split('.'), function(part, segment) {
            return [part[1] || part[0], part[1] ? part[1][segment] : part[0][segment]];
        }, [cur || window, null]);
        if (ret[0] && ret[1]) {
            return ret;
        } else {
            throw head + ' not found.';
        }
    };
    var makeObject = function(fn_name, args) {
        var fn_obj = getFunction(fn_name),
            obj;
        args = args.length ? wax.Record(args) : [];

        // real browsers
        if (Object.create) {
            obj = Object.create(fn_obj[1].prototype);
            fn_obj[1].apply(obj, args);
        // lord have mercy on your soul.
        } else {
            switch (args.length) {
                case 0: obj = new fn_obj[1](); break;
                case 1: obj = new fn_obj[1](args[0]); break;
                case 2: obj = new fn_obj[1](args[0], args[1]); break;
                case 3: obj = new fn_obj[1](args[0], args[1], args[2]); break;
                case 4: obj = new fn_obj[1](args[0], args[1], args[2], args[3]); break;
                case 5: obj = new fn_obj[1](args[0], args[1], args[2], args[3], args[4]); break;
                default: break;
            }
        }
        return obj;
    };
    var runFunction = function(fn_name, args, cur) {
        var fn_obj = getFunction(fn_name, cur);
        var fn_args = args.length ? wax.Record(args) : [];
        // @TODO: This is currently a stopgap measure that calls methods like
        // `foo.bar()` in the context of `foo`. It will probably be necessary
        // in the future to be able to call `foo.bar()` from other contexts.
        if (cur && fn_name.indexOf('.') === -1) {
            return fn_obj[1].apply(cur, fn_args);
        } else {
            return fn_obj[1].apply(fn_obj[0], fn_args);
        }
    };
    var isKeyword = function(string) {
        return _.isString(string) && (_.indexOf([
            '@new',
            '@call',
            '@literal',
            '@chain',
            '@inject',
            '@group'
        ], string.split(' ')[0]) !== -1);
    };
    var altersContext = function(string) {
        return _.isString(string) && (_.indexOf([
            '@new',
            '@call',
            '@chain'
        ], string.split(' ')[0]) !== -1);
    };
    var getStatement = function(obj) {
        if (_.isArray(obj) && obj[0] && isKeyword(obj[0])) {
            return {
                verb: obj[0].split(' ')[0],
                subject: obj[0].split(' ')[1],
                object: obj.slice(1)
            };
        }
        return false;
    };

    var i,
        fn = false,
        ret = null,
        child = null,
        statement = getStatement(obj);
    if (statement) {
        switch (statement.verb) {
        case '@group':
            for (i = 0; i < statement.object.length; i++) {
                ret = wax.Record(statement.object[i], context);
                child = getStatement(statement.object[i]);
                if (child && altersContext(child.verb)) {
                    context = ret;
                }
            }
            return context;
        case '@new':
            return makeObject(statement.subject, statement.object);
        case '@literal':
            fn = getFunction(statement.subject);
            return fn ? fn[1] : null;
        case '@inject':
            return runFunction(statement.subject, statement.object, context);
        case '@chain':
            return runFunction(statement.subject, statement.object, context);
        case '@call':
            return runFunction(statement.subject, statement.object, null);
        }
    } else if (obj !== null && typeof obj === 'object') {
        var keys = _.keys(obj);
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            obj[key] = wax.Record(obj[key], context);
        }
        return obj;
    } else {
        return obj;
    }
};
//     Underscore.js 1.1.6
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.1.6';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects implementing `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (_.isNumber(obj.length)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial && index === 0) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) return breaker;
    });
    return result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = slice.call(arguments, 1);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, obj) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };


  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
  // that does not equal itself.
  _.isNaN = function(obj) {
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();
// Wax GridUtil
// ------------

// Wax header
var wax = wax || {};

wax.util = {
    // From Bonzo
    offset: function(el) {
        var width = el.offsetWidth;
        var height = el.offsetHeight;
        var top = el.offsetTop;
        var left = el.offsetLeft;

        while (el = el.offsetParent) {
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return {
            top: top,
            left: left,
            height: height,
            width: width
        };
    },
    // From underscore, minus funcbind for now.
    bind: function(func, obj) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        return func.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
      };
    }
};

// Request
// -------
// Request data cache. `callback(data)` where `data` is the response data.
wax.request = {
    cache: {},
    locks: {},
    promises: {},
    get: function(url, callback) {
        // Cache hit.
        if (this.cache[url]) {
            return callback(this.cache[url]);
        // Cache miss.
        } else {
            this.promises[url] = this.promises[url] || [];
            this.promises[url].push(callback);
            // Lock hit.
            if (this.locks[url]) return;
            // Request.
            var that = this;
            this.locks[url] = true;
            reqwest({
                url: url + '?callback=grid',
                type: 'jsonp',
                jsonpCallback: 'callback',
                success: function(data) {
                    that.locks[url] = false;
                    that.cache[url] = data;
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url]);
                    }
                },
                error: function() {
                    that.locks[url] = false;
                    that.cache[url] = null;
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url]);
                    }
                }
            });
        }
    }
};

// GridInstance
// ------------
// GridInstances are queryable, fully-formed
// objects for acquiring features from events.
wax.GridInstance = function(grid_tile, formatter) {
    this.grid_tile = grid_tile;
    this.formatter = formatter;
    this.tileRes = 4;
};

// Resolve the UTF-8 encoding stored in grids to simple
// number values.
// See the [utfgrid section of the mbtiles spec](https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md)
// for details.
wax.GridInstance.prototype.resolveCode = function(key) {
  if (key >= 93) key--;
  if (key >= 35) key--;
  key -= 32;
  return key;
};

wax.GridInstance.prototype.getFeature = function(x, y, tile_element, options) {
  if (!(this.grid_tile && this.grid_tile.grid)) return;

  // IE problem here - though recoverable, for whatever reason
  var offset = wax.util.offset(tile_element);
  var tileX = offset.left;
  var tileY = offset.top;

  if (Math.floor((y - tileY) / this.tileRes) > 256 ||
    Math.floor((x - tileX) / this.tileRes) > 256) return;

  var key = this.grid_tile.grid[
     Math.floor((y - tileY) / this.tileRes)
  ].charCodeAt(
     Math.floor((x - tileX) / this.tileRes)
  );

  key = this.resolveCode(key);

  // If this layers formatter hasn't been loaded yet,
  // download and load it now.
  if (this.grid_tile.keys[key]) {
    return this.formatter.format(
      options,
      this.grid_tile.data[this.grid_tile.keys[key]]
    );
  }
};

// GridManager
// -----------
// Generally one GridManager will be used per map.
wax.GridManager = function() {
    this.grid_tiles = {};
    this.key_maps = {};
    this.formatters = {};
    this.locks = {};
};

// Get a grid - calls `callback` with either a `GridInstance`
// object or false. Behind the scenes, this calls `getFormatter`
// and gets grid data, and tries to avoid re-downloading either.
wax.GridManager.prototype.getGrid = function(url, callback) {
    var that = this;
    that.getFormatter(that.formatterUrl(url), function(f) {
        if (!f) return callback(false);

        wax.request.get(that.tileDataUrl(url), function(t) {
            callback(new wax.GridInstance(t, f));
        });
    });
};

// Create a cross-browser event object
wax.GridManager.prototype.makeEvent = function(evt) {
  return {
    target: evt.target || evt.srcElement,
    pX: evt.pageX || evt.clientX,
    pY: evt.pageY || evt.clientY,
    evt: evt
  };
};

// Simplistically derive the URL of the grid data endpoint from a tile URL
wax.GridManager.prototype.tileDataUrl = function(url) {
  return url.replace(/(\.png|\.jpg|\.jpeg)(\d*)/, '.grid.json');
};

// Simplistically derive the URL of the formatter function from a tile URL
wax.GridManager.prototype.formatterUrl = function(url) {
  return url.replace(/\d+\/\d+\/\d+\.\w+/, 'layer.json');
};

// Request and save a formatter, passed to `callback()` when finished.
wax.GridManager.prototype.getFormatter = function(url, callback) {
  var that = this;
  // Formatter is cached.
  if (typeof this.formatters[url] !== 'undefined') {
    callback(this.formatters[url]);
    return;
  } else {
    wax.request.get(url, function(data) {
        if (data && data.formatter) {
            that.formatters[url] = new wax.Formatter(data);
        } else {
            that.formatters[url] = false;
        }
        callback(that.formatters[url]);
    });
  }
};

// Formatter
// ---------
wax.Formatter = function(obj) {
    // Prevent against just any input being used.
    if (obj.formatter && typeof obj.formatter === 'string') {
        try {
            // Ugly, dangerous use of eval.
            eval('this.f = ' + obj.formatter);
        } catch (e) {
            // Syntax errors in formatter
            if (console) console.log(e);
        }
    } else {
        this.f = function() {};
    }
};

// Wrap the given formatter function in order to
// catch exceptions that it may throw.
wax.Formatter.prototype.format = function(options, data) {
    try {
        return this.f(options, data);
    } catch (e) {
        if (console) console.log(e);
    }
};
// Wax Legend
// ----------

// Wax header
var wax = wax || {};

wax.Legend = function(context, container) {
    this.context = context;
    this.container = container || $('<div class="wax-legends"></div>')[0];
    this.legends = {};
    $(this.context).append(this.container);
};

wax.Legend.prototype.render = function(urls) {
    $('.wax-legend', this.container).hide();

    var render = wax.util.bind(function(url, content) {
        if (!content) {
            this.legends[url] = false;
        } else if (this.legends[url]) {
            this.legends[url].show();
        } else {
            this.legends[url] = $("<div class='wax-legend'></div>").append(content);
            this.container.append(this.legends[url]);
        }
    }, this);
    var renderLegend = function(data) {
        if (data && data.legend) render(url, data.legend);
    };
    for (var i = 0; i < urls.length; i++) {
        var url = this.legendUrl(urls[i]);
        wax.request.get(url, renderLegend);
    }
};

wax.Legend.prototype.legendUrl = function(url) {
    return url.replace(/\d+\/\d+\/\d+\.\w+/, 'layer.json');
};

// TODO: rewrite without underscore
_.mixin({
    melt: function(self, func, obj) {
        func.apply(obj, [self, obj]);
        return self;
    }
});
// Requires: jQuery
//
// Wax GridUtil
// ------------

// Wax header
var wax = wax || {};
wax.tooltip = {};

// Get the active tooltip for a layer or create a new one if no tooltip exists.
// Hide any tooltips on layers underneath this one.
wax.tooltip.getToolTip = function(feature, context, index, evt) {
    // var tooltip = $(context).children('div.wax-tooltip-' +
    //     index +
    //     ':not(.removed)');

    // if (tooltip.size() === 0) {
    tooltip = document.createElement('div');
    tooltip.className = 'wax-tooltip wax-tooltip-' + index;
    tooltip.innerHTML = feature;

        // if (!$(context).triggerHandler('addedtooltip', [tooltip, context, evt])) {
             context.appendChild(tooltip);
        // }
    // }

    // for (var i = (index - 1); i > 0; i--) {
    //     var fallback = $('div.wax-tooltip-' + i + ':not(.removed)');
    //     if (fallback.size() > 0) {
    //         fallback.addClass('hidden').hide();
    //     }
    // }
    return tooltip;
};

// Expand a tooltip to be a "popup". Suspends all other tooltips from being
// shown until this popup is closed or another popup is opened.
wax.tooltip.click = function(feature, context, index) {
    var tooltip = wax.tooltip.getToolTip(feature, context, index);
    var close = document.createElement('a');
    close.href = '#close';
    close.className = 'close';
    close.innerHTML = 'Close';
    close.addListener('click', function() {
        tooltip.parentNode.removeChild(tooltip);
        return false;
    });
    tooltip.className += ' wax-popup';
    tooltip.innerHTML = feature;
    tooltip.appendChild(close);
};

// Show a tooltip.
wax.tooltip.select = function(feature, context, layer_id, evt) {
    if (!feature) return;

    wax.tooltip.getToolTip(feature, context, layer_id, evt);
    context.style.cursor = 'pointer';
};

// Hide all tooltips on this layer and show the first hidden tooltip on the
// highest layer underneath if found.
wax.tooltip.unselect = function(feature, context, layer_id, evt) {
    context.style.cursor = 'default';
    /*
    if (layer_id) {
        $('div.wax-tooltip-' + layer_id + ':not(.wax-popup)')
            .remove();
    } else {
        $('div.wax-tooltip:not(.wax-popup)')
            .remove();
    }
    */

    // TODO: remove

    // $('div.wax-tooltip:first')
    //     .removeClass('hidden')
    //     .show();

    // $(context).triggerHandler('removedtooltip', [feature, context, evt]);
};
// Wax: Box Selector
// -----------------
wax = wax || {};

wax.boxselector = function(map, opts) {
    var mouseDownPoint = null;

    var callback = (typeof opts === 'function') ?
        opts :
        opts.callback;

    var boxselector = {
        add: function(map) {
            this.containerDiv = document.createElement('div');
            this.containerDiv.id = map.parent.id + '-zoombox';
            this.containerDiv.className = 'boxselector-box-container';
            this.containerDiv.style.width =  map.dimensions.x + 'px';
            this.containerDiv.style.height = map.dimensions.y + 'px';

            this.boxDiv = document.createElement('div');
            this.boxDiv.id = map.parent.id + '-boxselector-box';
            this.boxDiv.className = 'boxselector-box';
            this.containerDiv.appendChild(this.boxDiv);
            map.parent.appendChild(this.containerDiv);

            com.modestmaps.addEvent(this.containerDiv, 'mousedown', this.mouseDown());
            map.addCallback('drawn', this.drawbox());
        },
        remove: function() {
            this.containerDiv.parentNode.removeChild(this.containerDiv);
            map.removeCallback('mousedown', this.drawbox());
        },
        getMousePoint: function(e) {
            // start with just the mouse (x, y)
            var point = new com.modestmaps.Point(e.clientX, e.clientY);
            // correct for scrolled document
            point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
            point.y += document.body.scrollTop + document.documentElement.scrollTop;

            // correct for nested offsets in DOM
            for (var node = map.parent; node; node = node.offsetParent) {
                point.x -= node.offsetLeft;
                point.y -= node.offsetTop;
            }
            return point;
        },
        mouseDown: function() {
            return this._mouseDown = this._mouseDown || wax.util.bind(function(e) {
                if (e.shiftKey) {
                    mouseDownPoint = this.getMousePoint(e);

                    this.boxDiv.style.left = mouseDownPoint.x + 'px';
                    this.boxDiv.style.top = mouseDownPoint.y + 'px';

                    com.modestmaps.addEvent(map.parent, 'mousemove', this.mouseMove());
                    com.modestmaps.addEvent(map.parent, 'mouseup', this.mouseUp());

                    map.parent.style.cursor = 'crosshair';
                    return com.modestmaps.cancelEvent(e);
                }
            }, this);
        },
        mouseMove: function(e) {
            return this._mouseMove = this._mouseMove || wax.util.bind(function(e) {
                var point = this.getMousePoint(e);
                this.boxDiv.style.display = 'block';
                if (point.x < mouseDownPoint.x) {
                    this.boxDiv.style.left = point.x + 'px';
                } else {
                    this.boxDiv.style.left = mouseDownPoint.x + 'px';
                }
                this.boxDiv.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
                if (point.y < mouseDownPoint.y) {
                    this.boxDiv.style.top = point.y + 'px';
                } else {
                    this.boxDiv.style.top = mouseDownPoint.y + 'px';
                }
                this.boxDiv.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
                return com.modestmaps.cancelEvent(e);
            }, this);
        },
        mouseUp: function() {
            return this._mouseUp = this._mouseUp || wax.util.bind(function(e) {
                var point = boxselector.getMousePoint(e);

                var l1 = map.pointLocation(point),
                    l2 = map.pointLocation(mouseDownPoint);

                // Format coordinates like mm.map.getExtent().
                var extent = [
                    new com.modestmaps.Location(
                        Math.max(l1.lat, l2.lat),
                        Math.min(l1.lon, l2.lon)),
                    new com.modestmaps.Location(
                        Math.min(l1.lat, l2.lat),
                        Math.max(l1.lon, l2.lon))
                ];

                this.box = [l1, l2];
                callback(extent);

                com.modestmaps.removeEvent(map.parent, 'mousemove', this.mouseMove());
                com.modestmaps.removeEvent(map.parent, 'mouseup', this.mouseUp());

                map.parent.style.cursor = 'auto';

                return com.modestmaps.cancelEvent(e);
            }, this);
        },
        drawbox: function() {
            return this._drawbox = this._drawbox || wax.util.bind(function(map, e) {
                if (this.boxDiv) {
                    this.boxDiv.style.display = 'block';
                    this.boxDiv.style.height = 'auto';
                    this.boxDiv.style.width = 'auto';
                    var br = map.locationPoint(this.box[0]);
                    var tl = map.locationPoint(this.box[1]);
                    this.boxDiv.style.left = Math.max(0, tl.x) + 'px';
                    this.boxDiv.style.top = Math.max(0, tl.y) + 'px';
                    this.boxDiv.style.right = Math.max(0, map.dimensions.x - br.x) + 'px';
                    this.boxDiv.style.bottom = Math.max(0, map.dimensions.y - br.y) + 'px';
                }
            }, this);
        }
    };

    return boxselector.add(map);
};
// Wax: Embedder Control
// -------------------

// namespacing!
if (!com) {
    var com = { };
    if (!com.modestmaps) {
        com.modestmaps = { };
    }
}

com.modestmaps.Map.prototype.embedder = function(options) {
    options = options || {};
    if ($('#' + this.el + '-script').length) {
      $(this.parent).prepend($('<input type="text" class="embed-src" />')
        .css({
            'z-index': '9999999999',
            'position': 'relative'
        })
        .val("<div id='" + this.el + "-script'>" + $('#' + this.el + '-script').html() + '</div>'));
    }
    return this;
};
// Wax: Fullscreen
// -----------------
// A simple fullscreen control for Modest Maps
wax = wax || {};

// Add zoom links, which can be styled as buttons, to a `modestmaps.Map`
// control. This function can be used chaining-style with other
// chaining-style controls.
wax.fullscreen = function(map, opts) {

    var fullscreen = {
        state: 1, // minimized

        // Modest Maps demands an absolute height & width, and doesn't auto-correct
        // for changes, so here we save the original size of the element and
        // restore to that size on exit from fullscreen.
        add: function(map) {
            this.a = document.createElement('a');
            this.a.className = 'wax-fullscreen';
            this.a.href = '#fullscreen';
            this.a.innerHTML = 'fullscreen';
            map.parent.appendChild(this.a);
            this.a.addEventListener('click', this.click(map), false);
            return this;
        },

        click: function(map) {
            return this._click = this._click || wax.util.bind(function(e) {
                if (e) e.preventDefault();

                if (this.state) {
                    this.smallSize = [map.parent.offsetWidth, map.parent.offsetHeight];
                    map.parent.className += ' wax-fullscreen-map';
                    map.setSize(
                        map.parent.offsetWidth,
                        map.parent.offsetHeight);
                } else {
                    map.parent.className = map.parent.className.replace('wax-fullscreen-map', '');
                    map.setSize(
                        this.smallSize[0],
                        this.smallSize[1]);
                }
                this.state = !this.state;
            }, this);
        }
    };

    return fullscreen.add(map);
};
// Wax: Geocoder
// -------------
//
// Requires: jQuery, jquery-jsonp

// namespacing!
var wax = wax || {};

var geocoders = {
    mapquest: function(opts) {
        return function(location, callback) {
            $.jsonp({
                url: 'http://platform.beta.mapquest.com/geocoding/v1/address',
                data: {
                  key: opts.key,
                  location: location
                },
                callbackParameter: 'callback',
                context: this,
                success: function(data) {
                    // TODO: simplify
                    if (data.results && data.results.length && data.results[0].locations) {
                        callback(null, data.results[0].locations[0].latLng);
                    }
                },
                error: function() {
                    callback('Geocoding service could not be reached.');
                }
            });
        };
    }
};

wax.geocoder = function(map, opts) {
    var MM = com.modestmaps;

    this.geocoder = {
        geocode: function(location) {
            opts.geocoder(location, function(err, point) {
                if (!err) opts.success(new MM.Location(point.lat, point.lon));
            });
        }
    };
    return this;
};
// Wax: Hash
wax = wax || {};

// Ripped from underscore.js
// Internal function used to implement `_.throttle` and `_.debounce`.
var limit = function(func, wait, debounce) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var throttler = function() {
      timeout = null;
      func.apply(context, args);
    };
    if (debounce) clearTimeout(timeout);
    if (debounce || !timeout) timeout = setTimeout(throttler, wait);
  };
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time.
var throttle = function(func, wait) {
  return limit(func, wait, false);
};

// A basic manager dealing only in hashchange and `location.hash`.
// This **will interfere** with anchors, so a HTML5 pushState
// implementation will be prefered.
var locationHash = {
  stateChange: function(callback) {
    window.addEventListener('hashchange', function() {
      callback(location.hash);
    }, false);
  },
  getState: function() {
    return location.hash;
  },
  pushState: function(state) {
    location.hash = state;
  }
};

wax.hash = function(map, options) {
    var s0, // cached location.hash
        lat = 90 - 1e-8, // allowable latitude range
        map;

    var hash = {
        map: this,
        parser: function(s) {
            var args = s.split('/').map(Number);
            if (args.length < 3 || args.some(isNaN)) {
                return true; // replace bogus hash
            } else if (args.length == 3) {
                map.setCenterZoom(new com.modestmaps.Location(args[1], args[2]), args[0]);
            }
        },
        add: function(map) {
            options.manager.getState() ?
                hash.stateChange(options.manager.getState()) :
                hash.initialize() && hash.move();
            map.addCallback('drawn', throttle(hash.move, 500));
            options.manager.stateChange(hash.stateChange);
        },
        formatter: function() {
            var center = map.getCenter(),
                zoom = map.getZoom(),
                precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
            return '#' + [zoom.toFixed(2),
              center.lat.toFixed(precision),
              center.lon.toFixed(precision)].join('/');
        },
        move: function() {
            var s1 = hash.formatter();
            if (s0 !== s1) {
                s0 = s1;
                options.manager.pushState(s0); // don't recenter the map!
            }
        },
        stateChange: function(state) {
            if (state === s0) return; // ignore spurious hashchange events
            if (hash.parser((s0 = state).substring(1))) {
              hash.move(); // replace bogus hash
            }
        },
        // If a state isn't present when you initially load the map, the map should
        // still get a center and zoom level.
        initialize: function() {
            if (options.defaultCenter) map.setCenter(options.defaultCenter);
            if (options.defaultZoom) map.setZoom(options.defaultZoom);
        }
    };
    return hash.add(map);
};
wax = wax || {};

// A chaining-style control that adds
// interaction to a modestmaps.Map object.
//
// Takes an options object with the following keys:
//
// * `callbacks` (optional): an `out`, `over`, and `click` callback.
//   If not given, the `wax.tooltip` library will be expected.
// * `clickAction` (optional): **full** or **location**: default is
//   **full**.
wax.interaction = function(map, options) {
    var MM = com.modestmaps;
    options = options || {};
    // Our GridManager (from `gridutil.js`). This will keep the
    // cache of grid information and provide friendly utility methods
    // that return `GridTile` objects instead of raw data.
    var interaction = {
        modifyingEvents: ['zoomed', 'panned', 'centered',
            'extentset', 'resized', 'drawn'],

        waxGM: new wax.GridManager(),

        // This requires wax.Tooltip or similar
        callbacks: options.callbacks || {
            out: wax.tooltip.unselect,
            over: wax.tooltip.select,
            click: wax.tooltip.click
        },

        clickAction: options.clickAction || 'full',

        add: function() {
            for (var i = 0; i < this.modifyingEvents.length; i++) {
                map.addCallback(this.modifyingEvents[i], this.clearMap);
            }
            MM.addEvent(map.parent, 'mousemove', this.onMove());
            MM.addEvent(map.parent, 'mousedown', this.mouseDown());
            return this;
        },

        // Search through `.tiles` and determine the position,
        // from the top-left of the **document**, and cache that data
        // so that `mousemove` events don't always recalculate.
        getTileGrid: function() {
            // TODO: don't build for tiles outside of viewport
            var zoom = map.getZoom();
            // Calculate a tile grid and cache it, by using the `.tiles`
            // element on this map.
            return this._getTileGrid || (this._getTileGrid =
                (function(t) {
                    var o = [];
                    for (var key in t) {
                        if (key.split(',')[0] == zoom) {
                            var offset = wax.util.offset(t[key]);
                            o.push([offset.top, offset.left, t[key]]);
                        }
                    }
                    return o;
                })(map.tiles));
        },

        clearTileGrid: function(map, e) {
            this._waxGetTileGrid = null;
        },

        getTile: function(evt) {
            var tile;
            var grid = this.getTileGrid();
            for (var i = 0; i < grid.length; i++) {
                if ((grid[i][0] < evt.pageY) &&
                   ((grid[i][0] + 256) > evt.pageY) &&
                    (grid[i][1] < evt.pageX) &&
                   ((grid[i][1] + 256) > evt.pageX)) {
                    tile = grid[i][2];
                    break;
                }
            }
            return tile || false;
        },

        clearTimeout: function() {
            if (this.clickTimeout) {
                window.clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
                return true;
            } else {
                return false;
            }
        },

        onMove: function(evt) {
            return this._onMove = this._onMove || wax.util.bind(function(evt) {
                var tile = this.getTile(evt);
                if (tile) {
                    this.waxGM.getGrid(tile.src, wax.util.bind(function(g) {
                        if (g) {
                            var feature = g.getFeature(evt.pageX, evt.pageY, tile, {
                                format: 'teaser'
                            });
                            // This and other Modest Maps controls only support a single layer.
                            // Thus a layer index of **0** is given to the tooltip library
                            if (feature) {
                                if (feature && this.feature !== feature) {
                                    this.feature = feature;
                                    this.callbacks.out(feature, map.parent, 0, evt);
                                    this.callbacks.over(feature, map.parent, 0, evt);
                                } else if (!feature) {
                                    this.feature = null;
                                    this.callbacks.out(feature, map.parent, 0, evt);
                                }
                            } else {
                                this.feature = null;
                                this.callbacks.out({}, map.parent, 0, evt);
                            }
                        }
                    }, this));
                }
            }, this);
        },

        mouseDown: function(evt) {
            return this._mouseDown = this._mouseDown || wax.util.bind(function(evt) {
                // Ignore double-clicks by ignoring clicks within 300ms of
                // each other.
                if (this.clearTimeout()) {
                    return;
                }
                // Store this event so that we can compare it to the
                // up event
                this.downEvent = evt;
                MM.addEvent(map.parent, 'mouseup', this.mouseUp());
            }, this);
        },

        mouseUp: function() {
            return this._mouseUp = this._mouseUp || wax.util.bind(function(evt) {
                MM.removeEvent(map.parent, 'mouseup', this.mouseUp());
                // Don't register clicks that are likely the boundaries
                // of dragging the map
                var tol = 4; // tolerance
                if (Math.round(evt.pageY / tol) === Math.round(this.downEvent.pageY / tol) &&
                    Math.round(evt.pageX / tol) === Math.round(this.downEvent.pageX / tol)) {
                    // Contain the event data in a closure.
                    this.clickTimeout = window.setTimeout(wax.util.bind(function() { this.click()(evt); }, this), 300);
                }
            }, this);
        },

        click: function(evt) {
            return this._onClick = this._onClick || wax.util.bind(function(evt) {
                var tile = this.getTile(evt);
                if (tile) {
                    this.waxGM.getGrid(tile.src, wax.util.bind(function(g) {
                        if (g) {
                            var feature = g.getFeature(evt.pageX, evt.pageY, tile, {
                                format: this.clickAction
                            });
                            if (feature) {
                                switch (this.clickAction) {
                                    case 'full':
                                        this.callbacks.click(feature, this.parent, 0, evt);
                                        break;
                                    case 'location':
                                        window.location = feature;
                                        break;
                                }
                            }
                        }
                    }, this));
                }
            }, this);
        }
    };

    // Ensure chainability
    return interaction.add(map);
};
// Wax: Legend Control
// -------------------
// Requires:
//
// * modestmaps
// * wax.Legend

// namespacing!
wax = wax || {};

// The Modest Maps version of this control is a very, very
// light wrapper around the `/lib` code for legends.
wax.legend = function(map, options) {
    options = options || {};
    var legend = {
        add: function() {
            this.legend = new wax.Legend(map.parent, options.container);
            this.legend.render([
                map.provider.getTileUrl({
                    zoom: 0,
                    column: 0,
                    row: 0
                })
            ]);
        }
    };
    return legend.add(map);
};
wax = wax || {};

wax.mobile = {
};
// Wax: Point Selector
// -----------------

// namespacing!
wax = wax || {};

wax.pointselector = function(map, opts) {
    var mouseDownPoint = null,
        mouseUpPoint = null,
        tolerance = 5,
        MM = com.modestmaps,
        locations = [];

    var callback = (typeof opts === 'function') ?
        opts :
        opts.callback;

    // Create a `com.modestmaps.Point` from a screen event, like a click.
    var makePoint = function(e) {
        var point = new MM.Point(e.clientX, e.clientY);
        // correct for scrolled document
        point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
        point.y += document.body.scrollTop + document.documentElement.scrollTop;

        // and for the document
        point.x -= parseFloat(MM.getStyle(document.documentElement, 'margin-left'));
        point.y -= parseFloat(MM.getStyle(document.documentElement, 'margin-top'));

        // correct for nested offsets in DOM
        for (var node = map.parent; node; node = node.offsetParent) {
            point.x -= node.offsetLeft;
            point.y -= node.offsetTop;
        }
        return point;
    };

    var pointselector = {
        // Attach this control to a map by registering callbacks
        // and adding the overlay
        add: function(map) {
            this.overlayDiv = document.createElement('div');
            this.overlayDiv.id = map.parent.id + '-boxselector';
            this.overlayDiv.className = 'pointselector-box-container';
            this.overlayDiv.style.width = map.dimensions.x + 'px';
            this.overlayDiv.style.height = map.dimensions.y + 'px';
            map.parent.appendChild(this.overlayDiv);
            MM.addEvent(this.overlayDiv, 'mousedown', pointselector.mouseDown);
            map.addCallback('drawn', pointselector.drawPoints);
            return this;
        },
        deletePoint: function(location, e) {
            if (confirm('Delete this point?')) {
                // TODO: indexOf not supported in IE
                location.pointDiv.parentNode.removeChild(location.pointDiv);
                locations.splice(locations.indexOf(location), 1);
                callback(pointselector.cleanLocations(locations));
            }
        },
        drawPoints: function() {
            var offset = new MM.Point(0, 0);
            for (var i = 0; i < locations.length; i++) {
                var point = map.locationPoint(locations[i]);
                if (!locations[i].pointDiv) {
                    locations[i].pointDiv = document.createElement('div');
                    locations[i].pointDiv.className = 'wax-point-div';
                    locations[i].pointDiv.style.position = 'absolute';
                    locations[i].pointDiv.style.display = 'block';
                    // TODO: avoid circular reference
                    locations[i].pointDiv.location = locations[i];
                    // Create this closure once per point
                    MM.addEvent(locations[i].pointDiv, 'mouseup', (function selectPointWrap(e) {
                        var l = locations[i];
                        return function(e) {
                            MM.removeEvent(map.parent, 'mouseup', pointselector.mouseUp);
                            pointselector.deletePoint(l, e);
                        };
                    })());
                    this.overlayDiv.appendChild(locations[i].pointDiv);
                }
                locations[i].pointDiv.style.left = point.x + 'px';
                locations[i].pointDiv.style.top = point.y + 'px';
            }
        },
        mouseDown: function(e) {
            mouseDownPoint = makePoint(e);
            MM.addEvent(map.parent, 'mouseup', pointselector.mouseUp);
        },
        addLocation: function(location) {
            locations.push(location);
            pointselector.drawPoints();
        },
        // Remove the awful circular reference from locations.
        // TODO: This function should be made unnecessary by not having it.
        cleanLocations: function(locations) {
            var o = [];
            for (var i = 0; i < locations.length; i++) {
                o.push(new MM.Location(locations[i].lat, locations[i].lon));
            }
            return o;
        },
        mouseUp: function(e) {
            if (!mouseDownPoint) return;
            mouseUpPoint = makePoint(e);
            if (MM.Point.distance(mouseDownPoint, mouseUpPoint) < tolerance) {
                pointselector.addLocation(map.pointLocation(mouseDownPoint));
                callback(pointselector.cleanLocations(locations));
            }
            mouseDownPoint = null;
            MM.removeEvent(map.parent, 'mouseup', pointselector.mouseUp);
        }
    };

    return pointselector.add(map);
};
// Wax: ZoomBox
// -----------------
// An OL-style ZoomBox control, from the Modest Maps example.

wax = wax || {};

wax.zoombox = function(map, opts) {
    // TODO: respond to resize
    var mouseDownPoint = null;

    var zoombox = {
        add: function(map) {
            this.boxDiv = document.createElement('div');
            this.boxDiv.id = map.parent.id + '-zoombox';
            this.boxDiv.className = 'zoombox-box-container';
            this.boxDiv.style.width =  map.dimensions.x + 'px';
            this.boxDiv.style.height = map.dimensions.y + 'px';

            this.box = document.createElement('div');
            this.box.id = map.parent.id + '-zoombox-box';
            this.box.className = 'zoombox-box';
            this.boxDiv.appendChild(this.box);

            com.modestmaps.addEvent(this.boxDiv, 'mousedown', this.mouseDown());
            map.parent.appendChild(this.boxDiv);
        },
        remove: function() {
            this.boxDiv.parentNode.removeChild(this.boxDiv);
            map.removeCallback('mousedown', this.mouseDown);
        },
        getMousePoint: function(e) {
            // start with just the mouse (x, y)
            var point = new com.modestmaps.Point(e.clientX, e.clientY);
            // correct for scrolled document
            point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
            point.y += document.body.scrollTop + document.documentElement.scrollTop;

            // correct for nested offsets in DOM
            for (var node = map.parent; node; node = node.offsetParent) {
                point.x -= node.offsetLeft;
                point.y -= node.offsetTop;
            }
            return point;
        },
        mouseDown: function() {
            return this._mouseDown = this._mouseDown || wax.util.bind(function(e) {
                if (e.shiftKey) {
                    mouseDownPoint = this.getMousePoint(e);

                    this.box.style.left = mouseDownPoint.x + 'px';
                    this.box.style.top = mouseDownPoint.y + 'px';

                    com.modestmaps.addEvent(map.parent, 'mousemove', this.mouseMove());
                    com.modestmaps.addEvent(map.parent, 'mouseup', this.mouseUp());

                    map.parent.style.cursor = 'crosshair';
                    return com.modestmaps.cancelEvent(e);
                }
            }, this);
        },
        mouseMove: function(e) {
            return this._mouseMove = this._mouseMove || wax.util.bind(function(e) {
                var point = this.getMousePoint(e);
                this.box.style.display = 'block';
                if (point.x < mouseDownPoint.x) {
                    this.box.style.left = point.x + 'px';
                } else {
                    this.box.style.left = mouseDownPoint.x + 'px';
                }
                this.box.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
                if (point.y < mouseDownPoint.y) {
                    this.box.style.top = point.y + 'px';
                } else {
                    this.box.style.top = mouseDownPoint.y + 'px';
                }
                this.box.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
                return com.modestmaps.cancelEvent(e);
            }, this);
        },
        mouseUp: function(e) {
            return this._mouseUp = this._mouseUp || wax.util.bind(function(e) {
                var point = this.getMousePoint(e);

                var l1 = map.pointLocation(point),
                    l2 = map.pointLocation(mouseDownPoint);

                map.setExtent([l1, l2]);

                this.box.style.display = 'none';
                com.modestmaps.removeEvent(map.parent, 'mousemove', this.mouseMove());
                com.modestmaps.removeEvent(map.parent, 'mouseup', this.mouseUp());

                map.parent.style.cursor = 'auto';

                return com.modestmaps.cancelEvent(e);
            }, this);
        }
    };

    return zoombox.add(map);
};
// Wax: Zoom Control
// -----------------

// namespacing!
if (!com) {
    var com = { };
    if (!com.modestmaps) {
        com.modestmaps = { };
    }
}

// Add zoom links, which can be styled as buttons, to a `modestmaps.Map`
// control. This function can be used chaining-style with other
// chaining-style controls.
com.modestmaps.Map.prototype.zoomer = function() {
    var map = this;
    var zoomin = document.createElement('a');
    zoomin.innerHTML = '+';
    zoomin.href = '#';
    zoomin.className = 'zoomer zoomin';
    zoomin.addEventListener('click', function(e) {
        com.modestmaps.cancelEvent(e);
        map.zoomIn();
    }, false);
    this.parent.appendChild(zoomin);

    var zoomout = document.createElement('a');
    zoomout.innerHTML = '-';
    zoomout.href = '#';
    zoomout.className = 'zoomer zoomout';
    zoomout.addEventListener('click', function(e) {
        com.modestmaps.cancelEvent(e);
        map.zoomOut();
    }, false);
    this.parent.appendChild(zoomout);

    this.addCallback('drawn', function(map, e) {
        if (map.coordinate.zoom === map.provider.outerLimits()[0].zoom) {
            zoomout.className = 'zoomer zoomout zoomdisabled';
        } else if (map.coordinate.zoom === map.provider.outerLimits()[1].zoom) {
            zoomin.className = 'zoomer zoomin zoomdisabled';
        } else {
            zoomin.className = 'zoomer zoomin';
            zoomout.className = 'zoomer zoomout';
        }
    });
    return this;
};
// namespacing!
if (!com) {
    var com = { };
    if (!com.modestmaps) {
        com.modestmaps = { };
    }
}

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
// 
com.modestmaps.WaxProvider = function(options) {
    this.layerName = options.layerName;
    this.baseUrls = (typeof(options.baseUrl) == 'string') ?
            [options.baseUrl] : options.baseUrl;
    this.n_urls = this.baseUrls.length;
    this.filetype = options.filetype || '.png';
    this.zoomRange = options.zoomRange || [0, 18];
};

com.modestmaps.WaxProvider.prototype = {
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

com.modestmaps.extend(com.modestmaps.WaxProvider, com.modestmaps.MapProvider);
