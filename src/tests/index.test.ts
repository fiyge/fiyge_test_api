// src/index.test.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IndexResponseSchema } from '../schemas/indexSchema.ts';
import { exceptionModelList } from '../constants.ts';
import modelList from '../models.json';
import dotenv from "dotenv";

dotenv.config();

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
    const formData = new FormData();
    formData.append("data[users][user_name]", process.env.USER_NAME ?? "")
    formData.append("data[users][user_password]", process.env.USER_PASSWORD ?? "")
    const response = await axios.post(API_URL + "/access_controls/users/login.json", formData)

    const token = response.data.access_token
    apiClient = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization:
                `Bearer ${token}`,
        },
    });
    return;
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