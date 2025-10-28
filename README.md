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

## Run all tests
To run the tests, use the following command:

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

