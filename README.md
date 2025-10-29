# FIYGE API test repo

## Setup

1. Clone the repository
```bash
git clone https://github.com/fiyge/fiyge_test_api.git
```

2. Navigate to the project directory
```bash
cd fiyge_test_api
```

3. Install dependencies
``` bash
npm install
```

4. Set environment variables for API_URL, USER_NAME and USER_PASSWORD by creating a `.env` file in the root directory with the following content:
```
API_URL=https://api.fiyge.com
USER_NAME=your_username
USER_PASSWORD=your_password
```

5. run the following command, `npm run fetch-models` will fetch the latest models from the API and create `src/models.json` file.
```bash
rm -rf src/models.json
npm run fetch-models
```

## Run all tests
To run the tests, use the following command:

```bash
./run-test.sh
```


```bash
npm test
```

## Run individual test
To run selected test(s) such as index, add, edit, view and delete, use the following command:

```bash
npm test add
```

or

```bash
npm test add view delete
```

## Reading test results
After running the tests, you can find the test results in the `jest_html_reporters.html`. Double-click the file to open it in your default web browser.

## Refetch model list
```bash
rm -rf src/models.json
npm run fetch-models
```

