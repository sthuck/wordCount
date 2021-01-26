## running

npm run docker:pull
npm run docker:default
npm run build
npm run app:default

## quick overview

explanations/decisions:

## going with no orm

I mostly prefer not using an orm. ORMs can make it difficult to use all the features that sql provides. for example, the query in `addBulkWordCounts`. I am using a query builder library of course to protect from sql injections and provide some readability.

## Getting top X words

seemed like it's a good
