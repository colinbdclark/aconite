/*
 * Aconite Readiness Notification Utilities
 * http://github.com/colinbdclark/aconite
 *
 * Copyright 2017, Colin Clark
 * Distributed under the MIT license.
 */

(function () {
    "use strict";

    fluid.defaults("aconite.readinessResponder", {
        gradeNames: "fluid.modelComponent",

        readinessEventName: "onReady",

        model: {
            unknownReadinessCounter: 0
        },

        modelListeners: {
            unknownReadinessCounter: {
                funcName: "aconite.readinessResponder.fireWhenReady",
                args: ["{that}", "{change}.value"],
                excludeSource: "init"
            }
        }
    });

    aconite.readinessResponder.fireWhenReady = function (that, unknownReadinessCounter) {
        if (unknownReadinessCounter === 0) {
            that.events[that.options.readinessEventName].fire();
        }
    };

    fluid.defaults("aconite.readinessNotifier", {
        gradeNames: "fluid.modelComponent",

        model: {
            unknownReadinessCounter: "{readinessResponder}.model.unknownReadinessCounter"
        },

        events: {
            onReady: null
        },

        listeners: {
            "onCreate.incrementCounter": {
                funcName: "aconite.readinessNotifier.incrementCounter",
                args: ["{that}"]
            },

            "onReady.decrementCounter": {
                funcName: "aconite.readinessNotifier.decrementCounter",
                args: ["{that}"]
            }
        }
    });

    aconite.readinessNotifier.incrementCounter = function (that) {
        that.applier.change("unknownReadinessCounter",
            that.model.unknownReadinessCounter + 1);
    };

    aconite.readinessNotifier.decrementCounter = function (that) {
        that.applier.change("unknownReadinessCounter",
            that.model.unknownReadinessCounter - 1);
    };
})();
