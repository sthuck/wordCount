#Get Job status
curl --request GET \
  --url 'http://localhost:8080/job-status?jobId=49fd627a-890b-4126-b3cb-915fd230d3f9'

# get top 50 words
  curl --request GET \
  --url 'http://localhost:8080/top-50-words'

# get word statistics
  curl --request GET \
  --url 'http://localhost:8080/word-statistics?word=of'

# count words in simple string
  curl --request POST \
  --url http://localhost:8080/word-counter \
  --header 'Content-Type: application/json' \
  --data '{
	"string": "abc def ggh"
}	'

#count words in a file
curl --request POST \
  --url http://localhost:8080/word-counter \
  --header 'Content-Type: application/json' \
  --data '{
	"path": "big.txt"
}	'

#count words in url
curl --request POST \
  --url http://localhost:8080/word-counter \
  --header 'Content-Type: application/json' \
  --data '{
	"url": "https://raw.githubusercontent.com/nestjs/nest/master/Readme.md"
}	'

#count words - but missing file
curl --request POST \
  --url http://localhost:8080/word-counter \
  --header 'Content-Type: application/json' \
  --data '{
	"path": "big.txt2"
}	'

#invalid payload 
curl --request POST \
  --url http://localhost:8080/word-counter \
  --header 'Content-Type: application/json' \
  --data '{
	"file": "big.txt"
}	'