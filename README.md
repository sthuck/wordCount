## running

needs docker
./start.sh

## quick overview

explanations/decisions:

## going with no orm

I mostly prefer not using an orm. ORMs can make it difficult to use all the features that sql provides. for example, the query in `addBulkWordCounts`. I am using a query builder library of course to protect from sql injections and provide some readability.

## Getting top X words

seemed like it's a good

## assumption I made along the way

- parsing is very simple, I assume I only get simple text files
