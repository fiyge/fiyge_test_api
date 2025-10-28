// src/index.test.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IndexResponseSchema } from '../schemas/indexSchema.ts';
import { exceptionModelList } from '../constants.ts';
import modelList from '../models.json';

const API_URL = 'https://api.iai.fiyge.com/';

// Utility to access nested or flat property in a record
function getProperty(obj: any, path: string): any {
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
        return obj[path];
    }
    const parts = path.split('.');
    return parts.reduce((current, key) => current && current[key], obj);
}

// Utility to get search value from basic index response
function getSearchValue(basicData: any, model: string): string {
    const data = basicData?.paginate?.data || [];
    const displayField = basicData?.paginate?.display_field;

    if (!Array.isArray(data) || data.length === 0 || !displayField) {
        return 'TestValue';
    }

    const record = data[0];
    return getProperty(record, displayField) || 'TestValue';
}

let apiClient: AxiosInstance;

beforeAll(async () => {
    apiClient = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
        },
    });
});

describe('Index API Response Validation', () => {
    modelList
        .filter((model) => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
        // .slice(0, 5)
        .forEach((model) => {
            describe(`Model: ${model}`, () => {
                let basicResponse: AxiosResponse<any, any>;
            it('should conform to the IndexResponse schema', async () => {
                basicResponse = await apiClient.get(`/${model}/index.json`);
                expect(basicResponse.status).toBe(200);

                    const parseResult = IndexResponseSchema.safeParse(basicResponse.data);
                    expect(
                        parseResult.success,
                        `[${model}] Index schema validation errors: ${parseResult.error?.message}`
                    ).toBe(true);
                });
            });
        });
});