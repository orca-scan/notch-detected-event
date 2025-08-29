/*!
 * notch-detected-event.js - v@version@
 * A cross-browser script to detect the existence of a device notch/cutout
 * https://github.com/orca-scan/notch-detected-event
 * @inspiration https://stackoverflow.com/questions/46318395/detecting-mobile-device-notch
 * @author Orca Scan <orcascan.com>
 * @license MIT
 */
(function (window, document) {
    'use strict';

    // check if the app is running in a Cordova environment
    if (window.cordova) {
        document.addEventListener('deviceready', function() {
            checkForNotch(1000); // 1 sec
        });
    }
            
    window.addEventListener('load', function() {
        checkForNotch(1000); // 1 sec
    });

    window.addEventListener('orientationchange', function() {
        checkForNotch(0); // 0 sec
    });

    document.addEventListener('resume', function() {
        checkForNotch(0); // 0 sec
    });

    /**
     * retrieves notch insets around mobile screen
     * 
     * @param {int} timeout - delay for load event listeners to get insets
     * @returns {Object} - insets object containing top, bottom, left and right inset properties
     */
    function checkForNotch(timeout) {

        // we need to wait before executing to allow layout to happen
        setTimeout(function() {

            // get the <html> element
            var root = document.documentElement;

            // add CSS variables so we can read them back
            if (window.cordova && cordova.platformId === 'android' && cordova.plugins && cordova.plugins.safearea) {
                // if using cordova and on android, then find safearea with plugin
                cordova.plugins.safearea.getInsets().then(function (insets) {
                    root.style.setProperty('--notch-top', (insets.top || 0) + "px");
                    root.style.setProperty('--notch-right', (insets.right || 0) + "px");
                    root.style.setProperty('--notch-bottom', (insets.bottom || 0) + "px");
                    root.style.setProperty('--notch-left', (insets.left || 0) + "px");
                }).catch(function () {
                    // fallback on env variables
                    root.style.setProperty('--notch-top', 'env(safe-area-inset-top)');
                    root.style.setProperty('--notch-right', 'env(safe-area-inset-right)');
                    root.style.setProperty('--notch-bottom', 'env(safe-area-inset-bottom)');
                    root.style.setProperty('--notch-left', 'env(safe-area-inset-left)');
                });
            } else {
                // ios devices use this
                root.style.setProperty('--notch-top', 'env(safe-area-inset-top)');
                root.style.setProperty('--notch-right', 'env(safe-area-inset-right)');
                root.style.setProperty('--notch-bottom', 'env(safe-area-inset-bottom)');
                root.style.setProperty('--notch-left', 'env(safe-area-inset-left)');
            }

            // get runtime styles
            var computedStyle = window.getComputedStyle(root);

            // read env values back and check if we have any values
            var hasNotch = [
                computedStyle.getPropertyValue('--notch-top') || '-1',
                computedStyle.getPropertyValue('--notch-right') || '-1',
                computedStyle.getPropertyValue('--notch-bottom') || '-1',
                computedStyle.getPropertyValue('--notch-left') || '-1'
            ]
            .map(parseInt)
            .filter(function(val) {
                return val > 0;
            })
            .length > 0;

            // only if we have a notch
            if (hasNotch) {
                // set <html data-notch="true"> to allow CSS to tweak the display
                root.setAttribute('data-notch', 'true');

                // fire global notch-detected event to let the UI know that happened
                window.dispatchEvent(new CustomEvent('notch-detected', { bubbles: true, cancelable: true }));
            }
        }, timeout);
    }

    // patch CustomEvent to allow constructor creation (IE/Chrome)
    if (typeof window.CustomEvent !== 'function') {

        window.CustomEvent = function (event, params) {

            params = params || { bubbles: false, cancelable: false, detail: undefined };

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

})(this, document);