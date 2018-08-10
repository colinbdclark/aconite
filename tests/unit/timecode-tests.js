/*
 * Aconite Timecode Tests
 *
 * Copyright 2016, Colin Clark
 * Licensed under the MIT and GPL 3 licenses.
 */

/*global require, aconite*/

var fluid = fluid || require("infusion"),
    jqUnit = jqUnit || require("node-jqunit");

(function () {
    "use strict";

    var QUnit = fluid.registerNamespace("QUnit");

    fluid.registerNamespace("aconite.tests.time");

    aconite.tests.time.assertExpectedException = function (actual, expected, message) {
        var actualMessage = actual.message,
            expectedMessageFragment = expected.messageFragment,
            isExpectedException = actualMessage.indexOf(expectedMessageFragment) > -1;

        QUnit.ok(isExpectedException, message);
    };

    aconite.tests.time.handleTestException = function (e, testSpec) {
        if (testSpec.expected.type === "aconite.tests.time.exceptionExpected") {
            aconite.tests.time.assertExpectedException(e, testSpec.expected,
                testSpec.message);
        } else {
            throw e;
        }
    };

    aconite.tests.time.valueExceptionTester = function (testSpec, testFn) {
        try {
            testFn(testSpec);
        } catch (e) {
            aconite.tests.time.handleTestException(e, testSpec);
        }
    };

    aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION = {
        type: "aconite.tests.time.exceptionExpected",
        messageFragment: "Timecodes must be in the format 'hh:mm:ss' or 'hh:mm:ss:ff'."
    };

    aconite.tests.time.INVALID_TIMECODE_SEGMENT_EXCEPTION = {
        type: "aconite.tests.time.exceptionExpected",
        messageFragment: "Error while parsing timecode string. Invalid"
    };

    aconite.tests.time.timeSegmentValidationTestToExceptionTransformer = function (testSpecs, exceptionType) {
        return fluid.transform(testSpecs, function (testSpec) {
            var togo = fluid.copy(testSpec);
            togo.expected = exceptionType;
            return togo;
        });
    };

    aconite.tests.time.valueTester = function (testSpec, testBody) {
        testBody(testSpec);
    };

    aconite.tests.time.runTestCase = function (testCase) {
        QUnit.test(testCase.name, function () {
            QUnit.expect(testCase.testSpecs.length);
            fluid.each(testCase.testSpecs, function (testSpec) {
                fluid.invokeGlobalFunction(testCase.tester, [testSpec, testCase.testBody]);
            });
        });
    };

    aconite.tests.time.runTestSuite = function (testCases) {
        fluid.each(testCases, aconite.tests.time.runTestCase);
    };

    aconite.tests.time.timeSegmentValidationTestSpecs = [
        {
            value: 0,
            expected: true,
            message: "Zero"
        },
        {
            value: 1,
            expected: true,
            message: "One"
        },
        {
            value: Number.MAX_VALUE,
            expected: true,
            message: "Maximum number value"
        },
        {
            value: -1,
            expected: false,
            message: "Negative number"
        },
        {
            value: Infinity,
            expected: false,
            message: "Infinity value"
        },
        {
            value: "cat",
            expected: false,
            message: "String value"
        },
        {
            value: NaN,
            expected: false,
            message: "NaN value"
        },
        {
            value: null,
            expected: false,
            message: "null value"
        },
        {
            value: undefined,
            expected: false,
            message: "undefined value"
        },
        {
            value: true,
            expected: false,
            message: "boolean true value"
        },
        {
            value: false,
            expected: false,
            message: "boolean false value"
        }
    ];

    aconite.tests.time.inTimeTestSpecs = [
        {
            timeSpec: {
                inTime: "00:00:00:00"
            },
            expected: 0,
            message: "Zero timecode should be parsed correctly"
        },
        {
            timeSpec: {
                inTime: "00:00:00:12",
                frameRate: 24
            },
            expected: 0.5,
            message: "The frame rate should be taken into account when specified"
        },
        {
            timeSpec: {
                inTime: "00:00:00:12"
            },
            expected: 0.4,
            message: "The frame rate should default to 30 fps when not specified"
        },
        {
            timeSpec: {
                inTime: 0
            },
            expected: 0,
            message: "Zero seconds should be passed through as-is"
        },
        {
            timeSpec: {
                inTime: "cat"
            },
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "An invalid time code should throw an exception"
        }
    ];

    aconite.tests.time.outTimeTestSpecs = [
        {
            timeSpec: {
                inTime: 0,
                outTime: "00:00:01"
            },
            expected: 1,
            message: "Zero inTime, one second time code outTime"
        },
        {
            timeSpec: {
                inTime: 0.5,
                outTime: 0.5,
                frameRate: 24
            },
            expected: 0.5,
            message: "outTime in seconds"
        },
        {
            timeSpec: {
                inTime: 10,
                outTime: "00:01:11:15"
            },
            expected: 71.5,
            message: "Frame-accurate outTime time code, default 30 fps frame rate."
        },
        {
            timeSpec: {
                inTime: 10,
                duration: "00:01:11:15"
            },
            expected: 81.5,
            message: "Frame-accurate duration time code, default 30 fps frame rate."
        },
        {
            timeSpec: {
                inTime: 0.5,
                duration: "00:00:10:12",
                frameRate: 24
            },
            expected: 11,
            message: "Frame-accurate duration time code, 24 fps frame rate."
        },
        {
            timeSpec: {
                inTime: 10,
                outTime: "cat"
            },
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "An invalid time code should throw an exception"
        }
    ];

    aconite.tests.time.INVALID_TIMECODE_TYPE_EXCEPTION = {
        type: "aconite.tests.time.exceptionExpected",
        messageFragment: "An invalid 'timecode' argument was specified. Expected string or number."
    };

    aconite.tests.time.parseTimecodeTestSpecs = [
        {
            timecode: "00:00:00",
            frameRate: undefined,
            expected: 0,
            message: "hh:mm:ss all zero, no explicit frame rate"
        },
        {
            timecode: "00:00:00:15",
            frameRate: undefined,
            expected: 0.5,
            message: "hh:mm:ss:ff, 15 frames, default to 30 fps"
        },
        {
            timecode: "00:00:00:15",
            frameRate: 24,
            expected: 0.625,
            message: "hh:mm:sss:ff, 15 frames, explict 24 fps"
        },
        {
            timecode: "01:10:99:15",
            frameRate: 30,
            expected: 4299.5,
            message: "All supported segments specified as > 0"
        },
        {
            timecode: {},
            frameRate: 30,
            expected: NaN,
            message: "Invalid data type (Object) returns NaN"
        },
        {
            timecode: true,
            frameRate: 30,
            expected: NaN,
            message: "Invalid data type (Boolean) returns NaN"
        },
        {
            timecode: null,
            frameRate: 18,
            expected: NaN,
            message: "Invalid data type (null) returns NaN"
        },
        {
            timecode: undefined,
            frameRate: 29.97,
            expected: NaN,
            message: "Invalid data type (undefined) returns NaN"
        },
        {
            timecode: 27.25,
            frameRate: 24,
            expected: 27.25,
            message: "Numbers pass through untouched"
        },
        {
            timecode: NaN,
            expected: NaN,
            message: "NaN passes through"
        },
        {
            timecode: 27.25,
            frameRate: 30,
            expected: 27.25,
            message: "Numbers pass through untouched, frameRate has no impact on return"
        },
        {
            timecode: "00:00:00:15;25",
            frameRate: 30,
            expected: {
                type: "aconite.tests.time.exceptionExpected",
                messageFragment: "Drop frame timecodes are not currently supported."
            },
            message: "Drop frame time codes result in a not supported exception"
        },
        {
            timecode: "cat",
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "Totally malformed messages throw a validation exception"
        },
        {
            timecode: "cat",
            frameRate: 18,
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "Totally malformed messages throw a validation exception, frameRate has no impact"
        },
        {
            timecode: "00:00",
            frameRate: 18,
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "Two-segment timecode should throw a validation exception"
        },
        {
            timecode: "00:00:00:00:00:00",
            frameRate: 18,
            expected: aconite.tests.time.TIMECODE_VALIDATION_EXCEPTION,
            message: "Six-segment timecode should throw a validation exception"
        },
        {
            timecode: "0000000:0001:0001:0000",
            frameRate: 18,
            expected: 61,
            message: "Oddly padded timecodes should generously be accepted"
        },
        {
            timecode: "00:00:01.25:15",
            frameRate: 30,
            expected: 1.75,
            message: "Decimal valued-segments should be tolerantly accepted."
        }
    ];

    aconite.tests.time.timeFragmentTestSpecs = [
        {
            timeSpec: {
                outTime: "00:00:01:00"
            },
            expected: "",
            message: "Time spec with no inTime or duration returns and empty fragment"
        },
        {
            timeSpec: {
                inTime: "00:01:00:00",
                outTime: NaN
            },
            expected: "#t=60",
            message: "Time spec with invalid (NaN) out time returns a fragment with only an inTime"
        },
        {
            timeSpec: {
                inTime: "00:00:01:00",
                outTime: "00:00:02:15"
            },
            expected: "#t=1,2.5",
            message: "Time spec with frame-accurate in and out times"
        },
        {
            timeSpec: {
                duration: 10
            },
            expected: "#t=0,10",
            message: "Time spec with only a duration specified as a Number"
        },
        {
            timeSpec: {
                duration: "00:01:00:00"
            },
            expected: "#t=0,60",
            message: "Time spec with only a duration specified as a timecode"
        },
        {
            timeSpec: {
                inTime: 10,
                outTime: 20
            },
            expected: "#t=10,20",
            message: "Time spec with in and out times specified as Numbers"
        },
        {
            timeSpec: {
                inTime: "00:01:00:15",
                outTime: "00:02:00:12",
                frameRate: 24
            },
            expected: "#t=60.625,120.5",
            message: "Time spec with both in and out times specified as frame-accurate timecodes, at 24 fps"
        }
    ];

    aconite.tests.time.testSuite = [
        {
            name: "aconite.time.isValidTimeSegment",
            testSpecs: aconite.tests.time.timeSegmentValidationTestSpecs,
            tester: "aconite.tests.time.valueTester",
            testBody: function (testSpec) {
                var actual = aconite.time.isValidTimeSegment(testSpec.value);
                QUnit.equal(actual, testSpec.expected, testSpec.message);
            }
        },
        {
            name: "aconite.time.throwIfInvalidTimeSegment",
            testSpecs: aconite.tests.time.timeSegmentValidationTestToExceptionTransformer(
                aconite.tests.time.timeSegmentValidationTestSpecs,
                aconite.tests.time.INVALID_TIMECODE_SEGMENT_EXCEPTION),
            tester: "aconite.tests.time.valueExceptionTester",
            testBody: function (testSpec) {
                aconite.time.throwIfInvalidTimeSegment(testSpec.value);
                QUnit.ok(testSpec.expected, testSpec.message);
            }
        },
        {
            name: "aconite.time.inTime",
            testSpecs: aconite.tests.time.inTimeTestSpecs,
            tester: "aconite.tests.time.valueExceptionTester",
            testBody: function (testSpec) {
                var actual = aconite.time.inTime(testSpec.timeSpec.inTime, testSpec.timeSpec.frameRate);
                QUnit.equal(actual, testSpec.expected, testSpec.message);
            }
        },
        {
            name: "aconite.time.outTime",
            testSpecs: aconite.tests.time.outTimeTestSpecs,
            tester: "aconite.tests.time.valueExceptionTester",
            testBody: function (testSpec) {
                var actual = aconite.time.outTime(testSpec.timeSpec, testSpec.timeSpec.inTime);
                QUnit.equal(actual, testSpec.expected, testSpec.message);
            }
        },
        {
            name: "aconite.time.parseTimecode",
            testSpecs: aconite.tests.time.parseTimecodeTestSpecs,
            tester: "aconite.tests.time.valueExceptionTester",
            testBody: function (testSpec) {
                var actual = aconite.time.parseTimecode(testSpec.timecode, testSpec.frameRate);
                if (isNaN(testSpec.expected)) {
                    QUnit.ok(isNaN(actual), testSpec.message);
                } else {
                    QUnit.equal(actual, testSpec.expected, testSpec.message);
                }
            }
        },
        {
            name: "aconite.time.timeFragment",
            testSpecs: aconite.tests.time.timeFragmentTestSpecs,
            tester: "aconite.tests.time.valueExceptionTester",
            testBody: function (testSpec) {
                var actual = aconite.time.timeFragment(testSpec.timeSpec);
                QUnit.equal(actual, testSpec.expected, testSpec.message);
            }
        }
    ];

    aconite.tests.time.runTestSuite(aconite.tests.time.testSuite);
})();
