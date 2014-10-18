(function () {
    "use strict";

    fluid.registerNamespace("aconite");

    fluid.defaults("aconite.fcpxmlParser", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],

        members: {
            xml: {
                expander: {
                    funcName: "aconite.fcpxmlParser.fetch",
                    args: ["{that}.options.xmlUrl", "{that}.events.onParse.fire"]
                }
            }
        },

        xmlUrl: null,

        assetUrlMap: {
            base: "",
            prefix: ""
        },

        events: {
            onParse: null,
            afterParsed: null
        },

        listeners: {
            onParse: {
                funcName: "aconite.fcpxmlParser.parse",
                args: ["{arguments}.0", "{that}.options.assetUrlMap", "{that}.events.afterParsed.fire"]
            }
        }
    });

    aconite.fcpxmlParser.fetch = function (xmlUrl, onXMLReady, onError) {
        jQuery.ajax({
            url: xmlUrl,
            method: "GET",
            success: function (data, textStatus, jqXHR) {
                onXMLReady(jQuery(data));
            },
            error: onError,
            dataType: "xml"
        });
    };

    aconite.fcpxmlParser.parse = function (fcpXML, assetUrlMap, afterParsed) {
        var clips = fcpXML.find("clip"),
            clipSequence = aconite.fcpxlParser.clipSpecs(clips);

        afterParsed(clipSequence);

        return clipSequence;
    };

    aconite.fcpxmlParser.clipSpecs = function (clips) {
        var clipSequence = [];

        fluid.each(clips, function (clip) {
            clip = jQuery(clip);

            var clipSpec = aconite.fcpxmlParser.clipSpec(clip);
            clipSpec.url = aconite.fcpxmlParser.getRelativeClipURL(clipSpec.src, assetUrlMap);
            clipSequence.push(clipSpec);
        });

        return clipSequence;
    };

    aconite.fcpxmlParser.clipSpec = function (clipEl) {
        var assetId = clipEl.find("video").attr("ref"),
            asset = fcpXML.find("asset#" + assetId),
            startAttr = clipEl.attr("start"),
            durAttr = clipEl.attr("duration");

        return {
            id: assetId,
            src: asset.attr("src"),
            inTime: aconite.fcpxmlParser.parse.dur(startAttr),
            duration: aconite.fcpxmlParser.parse.dur(durAttr)
        };
    };

    aconite.fcpxmlParser.getRelativeClipURL = function (src, assetUrlMap) {
        var urlBaseIdx = src.indexOf(assetUrlMap.base),
            relativeClipURL = assetUrlMap.prefix + src.substring(urlBaseIdx);

        return relativeClipURL;
    };

    aconite.fcpxmlParser.parse.dur = function (durString) {
        if (!durString) {
            return;
        }

        var durEquation = durString.substring(0, durString.length - 1),
            operands = durEquation.split("/");

        return operands.length > 1 ? operands[0] / operands[1] : operands[0];
    };

}());
