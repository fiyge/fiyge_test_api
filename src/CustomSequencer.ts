const TestSequencer = require('@jest/test-sequencer').default;
import {Test} from 'jest-runner';

class CustomSequencer extends TestSequencer {
    sort(tests: Array<Test>) {
        const orderPath = ['src/tests/add.test.ts', 'src/tests/index.test.ts', 'src/tests/view.test.ts', 'src/tests/edit.test.ts', 'src/tests/delete.test.ts'];
        return tests.sort((testA, testB) => {
            const indexA = orderPath.indexOf(testA.path);
            const indexB = orderPath.indexOf(testB.path);

            if (indexA === indexB) return 0; // do not swap when tests both not specify in order.

            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA < indexB ? -1 : 1;
        })
    }
}

module.exports = CustomSequencer;