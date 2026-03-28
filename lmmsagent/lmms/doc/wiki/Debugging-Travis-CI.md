
1. Get the API token using the CLI and send a POST request to `/job/:job_id/debug` replacing the `TOKEN` and `JOB_ID` values below:

   ```bash
   #! /usr/bin/env bash  curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "Travis-API-Version: 3" \
      -H "Authorization: token <TOKEN>" \
      -d '{ "quiet": true }' \
      https://api.travis-ci.org/job/<JOB_ID>/debug 
   ```

   * The `Job ID` is displayed in the build log after expanding "Build system information".

2. Head back to the web UI and in the log of your job you should see the following lines to connect to the VM:

   ```
   Setting up debug tools.
   Preparing debug sessions.
   Use the following SSH command to access the interactive debugging environment:
   ssh ukjiuCEkxBBnRAe32Y8xCH0zj@foo.bar.com
   ```

3. Connect from your computer using SSH into the interactive session, and once you're done, just type exit and your build will terminate.

   * **Note:** Please consider removing the build log after you've finished debugging.

4. Finally, once in the SSH session, these bash functions will come in handy to run the different phases in your build: https://docs.travis-ci.com/user/running-build-in-debug-mode/#Things-to-do-once-you-are-inside-the-debug-VM