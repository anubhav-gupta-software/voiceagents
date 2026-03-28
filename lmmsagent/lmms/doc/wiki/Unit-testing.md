LMMS uses a unit test framework based on [Qt Test](https://doc.qt.io/qt-5/qtest-overview.html), a lightweight and useful test framework provided by Qt.

# Running the tests

To run the tests, you must first compile them.

Simply follow the same steps as for compiling LMMS. But, when it comes to compiling LMMS type the following command instead:

```
make tests
```

Then, type the following command to run the tests:

```
tests/tests
```

You should get an output similar to the following:

```
>> Will run 3 test suites
********* Start testing of ProjectVersionTest *********
Config: Using QtTest library 5.9.2, Qt 5.9.2 (x86_64-little_endian-lp64 shared (dynamic) release build; by GCC 4.8.4)
PASS   : ProjectVersionTest::initTestCase()
PASS   : ProjectVersionTest::ProjectVersionComparisonTests()
PASS   : ProjectVersionTest::cleanupTestCase()
Totals: 3 passed, 0 failed, 0 skipped, 0 blacklisted, 0ms
********* Finished testing of ProjectVersionTest *********
********* Start testing of RelativePathsTest *********
Config: Using QtTest library 5.9.2, Qt 5.9.2 (x86_64-little_endian-lp64 shared (dynamic) release build; by GCC 4.8.4)
PASS   : RelativePathsTest::initTestCase()
PASS   : RelativePathsTest::RelativePathComparisonTests()
PASS   : RelativePathsTest::cleanupTestCase()
Totals: 3 passed, 0 failed, 0 skipped, 0 blacklisted, 0ms
********* Finished testing of RelativePathsTest *********
********* Start testing of AutomationTrackTest *********
Config: Using QtTest library 5.9.2, Qt 5.9.2 (x86_64-little_endian-lp64 shared (dynamic) release build; by GCC 4.8.4)
PASS   : AutomationTrackTest::initTestCase()
PASS   : AutomationTrackTest::testClipLinear()
PASS   : AutomationTrackTest::testClipDiscrete()
PASS   : AutomationTrackTest::testClips()
PASS   : AutomationTrackTest::testLengthRespected()
PASS   : AutomationTrackTest::testInlineAutomation()
called Track::getClip( 0 ), but clip 0 doesn't exist
PASS   : AutomationTrackTest::testBBTrack()
PASS   : AutomationTrackTest::testGlobalAutomation()
PASS   : AutomationTrackTest::cleanupTestCase()
Totals: 9 passed, 0 failed, 0 skipped, 0 blacklisted, 2ms
********* Finished testing of AutomationTrackTest *********
<< 0 out of 3 test suites failed.
```

# Writing the tests
LMMS provides a class named `QTestSuite` for writing test cases. A test case should inherit `QTestSuite` and have its test cases declared as `private slots`. You can also add per-suite initialization/cleanup by implementing `initTestCase`/`cleanupTestCase` slots, and per-case equivalent by `init`/`cleanup`.

There are [several macros](https://doc.qt.io/qt-5/qtest.html#macros) for checking functionalities such as `QCOMPARE`, `QVERIFY`. They are needed to record failures.

You can find some good examples in `tests/src` directory. If you have any good ideas for new unit tests, please feel free to write one and open a pull request!

For further information, you may look at [Examples in Qt manual](https://doc.qt.io/qt-5/qttestlib-tutorial1-example.html).