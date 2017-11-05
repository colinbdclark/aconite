Aconite
=======

What is Aconite?
----------------

Aconite is a framework for creative video processing on the web.
It is an early-stage project developed by Colin Clark, and probably isn't yet suitable
for use unless you're particularly adventurous and community-minded.

Building and Testing Aconite
----------------------------

### How to Build Aconite

You'll need Grunt installed globally if you don't already have it. Here's how:

    npm install -g grunt-cli

To download all of Aconite's dependencies and build it, run the following commands:

    npm install
    grunt

### Running Aconite's Test Suite

Aconite's test suite can be run in all available browsers using Testem. You'll need to have it installed globally if you don't already. Here's how:

    npm install testem -g

Then, Testem can run the whole test suite on all the browsers installed on your computer. Just run:

    npm test

Alternatively, if you'd like to only run the tests in one browser, you can open the test suite ``tests/unit/all-tests.html`` file by hand in your browser.
