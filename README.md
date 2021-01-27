# Running

needs docker
./start.sh

you can view example HTTP requests in example-curl.sh

# Quick overview

Using node.js streams to read the data.
Tried to structure code in a way that changes in the persistency layer or in the logic of processing streams could be done easily.
Using MySQL - When reading words from stream, we save only every ~1000 words or so.
Counting words is done in an async way, you submit a request, you get jobId back. You can then check jobId later to see if it succeeds.

# explanations/decisions:

## issues with this design

- a user has to busy-wait to get notified if his job succeeded or failed, could be amended by using stuff like AWS SNS, kafka, or asking the user to provide a callback http url

- not super reliable, a user can check if his job failed mid-stream, not much he can do about it. Counting it again fom the start, will result in inaccuracies in data. Solutions to this:

  - report to user on which word we failed (let's say after 10000 words), allow to submit job with option to start from a certain word. But still, this won't help if the machine crashed and didn't manage to persist job state.

  - using kafka or SQS to manage a queue of requests, and mini requests, which is the original request split into chunks.

- **I assume it will be used to parse newspapers, documents, books, and such. Meaning it will by mostly valid english words**. There are roughly 40,000 common english words. So in theory you won't end up with more than 100,000 rows
  If this assumptions is false, across time, db table will get bigger for data that is mostly not useful.

## going with no orm

I mostly prefer not using an orm. ORMs can make it difficult to use all the features that sql provides. for example, the query in `addBulkWordCounts`. I am using a query builder library of course to protect from sql injections and provide some readability.

## Getting top X words

seemed like it's a "related" feature worth implementing. Done by just adding an index to mysql table.
Adding index has the underlying assumption that this "top words" query is more "important" then write performance, as index hurts write performance.
If this is not the case, the index shouldn't be added. Instead, other solutions could be suggested, like computing it periodically (not real time) on a read only replica.

## some more assumption I made along the way

- parsing is very simple, I assume I only get simple text, no cleaning of symbols
- words are not longer than 255 chars
