var Tracker = (function () {

    var Tracker = function (options) {
        // this.ga = ga;
        option = options || {};
        this.debug = options.debug || false;
        this.timeout = options.timeout || 600;
        return this;
    };

    Tracker.prototype.send = function (type, post) {
        if (window.ga) {
            ga('send', type, post);
        }
        this._debug('send', type, post);
    }

    Tracker.prototype.event = function (category, action, label, value, callback) {
        var post = {
          eventCategory: category,
          eventAction: action,
          eventLabel: label,
          eventValue: value,
          hitCallback: this.callbackFallback(callback)
        }
        this.send('event', post);
    };

    Tracker.prototype.view = function (path, title, callback) {
        var post = {
            page: path || null,
            title: title || null,
            hitCallback: this.callbackFallback(callback)
        };
        this.send('pageview', post);
    };

    Tracker.prototype.callbackFallback = function (callback) {
        var self = this
          , is_done = false;
        if (typeof callback !== 'function') {
            return null;
        }
        setTimeout(function () {
            if (!is_done) {
                is_done = true;
                callback();
            }
        }, this.timeout);
        return function () {
            if (!is_done) {
                is_done = true;
                callback();
            }
        }
    };

    Tracker.prototype._debug = function () {
        if (this.debug && window.console && window.console.log) {
            window.console.log(arguments);
        }
    }

    return Tracker;

}());

var analytics = new Tracker();

// GOOD WAY
[].forEach.call(document.getElementsByClassName('external-track'), function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        analytics.view(link.dataset.track, null, function () { window.location.href = link.href; });
    });
});
