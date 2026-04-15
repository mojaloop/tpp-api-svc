# tpp-api-svc
The tpp-api-svc service handles HTTP Requests from the Mojaloop Third Party API

## Contribute Guideline

* [On Create New Feature](https://docs.mojaloop.io/community/standards/creating-new-features.html#creating-new-features)
* [Open a Pull Request](https://docs.mojaloop.io/community/standards/creating-new-features.html#open-a-pull-request-pr)


## Integration Test

In addition to unit tests, here is a quick step to run integration tests on the endpoints using ml-testing-toolkit to mock third party and DFSP requests

* For each enpoint, uncomment this line in src/domain/<endPointName.js>

```javascript
endpoint = 'http://mojaloop-testing-toolkit:4040/tpp' // FOR TESTING PURPOSES WITH TTK
```

* Run docker compose up --build in the terminal. This will launch ml-testing-toolkit and the tpp-api-svc
* Open http://localhost:9660 in your web browser
* From the right-hand navigation, select the "Test Runner" tab.
* In Test Runner, click "Collections Manager". Select "Import Folder".
* Navigate to your tpp-api-svc/docker/ml-testing-toolkit/testcases/collections/tpp-api-svc
* From there, you will see all available test endpoints that you can send a mock request to tpp-api-svc