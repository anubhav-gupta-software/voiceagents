We use github's issue tracker for development. First off, click on the [issues link](https://github.com/LMMS/lmms/issues) on the right-hand side of this page (shaped like an exclamation point inscribed in a circle). Try searching to see if your issue has already been reported. If it hasn't, then continue on:

Filing a new bug
------

1. **Click "New Issue" and select a title**  
A title should be very brief, but should provide some context to easily identify one issue from another. Think: if you were trying to search for this issue on the tracker, what phrase would easily identify it?

2. **Fill in the report**  
Remember to be **concise**, but clear. Filing a proper bug report can save hours of developer time. A good report usually contains the following elements:

* **System Info**: List your operating system and version (e.g. "Windows 8.1 64-bit") and LMMS version (e.g. "LMMS 1.1.3" or "LMMS master" if you compiled LMMS from source within the past few days). If the issue affects audio output or input, list which audio interface you're using (e.g. SDL, ALSA, WinMM). This can be found by opening LMMS and navigating to Edit -> Settings and clicking on the speaker icon.

* **Description**: If your title doesn't explain the entirety of the issue, then use a paragraph to explain it in more detail.

* **Steps to reproduce**: List a sequence of steps that the developers can take to reliably reproduce your bug. Begin with "Start LMMS". After first finding your bug, experiment around to find the shortest sequence of steps that reproduces it before reporting it - this make it easier for us to narrow down the exact location of the issue.

* **Expected results**: Explain what you expected to happen as a result of performing the above steps (e.g. "Expected: The note's volume should have increased").

* **Actual results**: What *actually* happened after performing the steps? Example: "The note's volume briefly increased, but then immediately went silent."

Extra info to include in a report
------
If relevant, attach any screen shots that help illustrate the issue. These can be tremendously useful in making a report easier to understand.  

If your issue revolves around a specific project file or audio file, upload that somewhere and link to it. Be sure that the file is *easily* and *safely* downloadable (Downloading should not require one to create an account and the website hosting the download should not be a risk for viruses).  

If you were able to capture any useful output from the program (for example, a stack trace or a core dump after the program crashed), then attach that as well. For how to collect stack trace, [you can find it here.](https://github.com/LMMS/lmms/wiki/Debugging-LMMS) If the stack trace is brief (less than 30-40 lines), embed it directly in the post and enclose it between two sets of triple-backticks as below (this will make it render in an easily-readable format):

\`\`\`  
[insert stack trace here]  
\`\`\`  

Otherwise, upload the stack trace / core dump somewhere else and link to it *directly* (it should be viewable in a browser, one should not have to create an account to view it, etc). If you have a github account, the easiest thing to do is upload it as a [gist](https://gist.github.com/).

Example bug report
------
An example of a decent bug report is [#1875](https://github.com/LMMS/lmms/issues/1875)