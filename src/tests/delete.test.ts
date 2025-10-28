// src/delete.test.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DeleteResponseSchema } from '../schemas/deleteResponseSchema.ts';
import { exceptionModelList } from '../constants.ts';
import modelList from '../models.json';

const API_URL = process.env.API_URL || 'https://api.uat.fiyge.com/';

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

describe('Delete API Response Validation (GET /delete.json)', () => {
    modelList
        .filter((model: string) => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
        // .slice(0, 5)
        .forEach((model) => {
            describe(`Model: ${model}`, () => {
                let indexResponse: AxiosResponse<any, any> | null = null;
                let indexResponseData: any = null;
                let paginateData: any = null;
                let recordList: any[] | null = null;
                let primaryKey: string | null = null;
                let deleteResponse: AxiosResponse<any, any> | null = null;
                let deleteResponseData: any = null;

                beforeAll(async () => {
                    try {
                        indexResponse = await apiClient.get(`/${model}/index.json`);
                        indexResponseData = indexResponse?.data;
                        paginateData = indexResponseData?.paginate;
                        recordList = paginateData?.data;
                        primaryKey = paginateData?.primary_key;

                        if (recordList?.length && primaryKey) {
                            const id = recordList[0][primaryKey];
                            deleteResponse = await apiClient.post(`/${model}/delete.json?id=${id}&is_confirm=1&override=1`);
                            deleteResponseData = deleteResponse?.data;
                        }
                    } catch (error) {
                        // Store error for test cases to handle
                        indexResponse = null;
                        deleteResponse = null;
                        deleteResponseData = null;
                    }
                }, 10000);

                it('should conform to the DeleteResponse schema', async () => {
                    expect(indexResponse?.status, `[${model}] GET /index.json failed. Expected status: 200, Received: ${indexResponse?.status || 'null'}`).toBe(200);
                    // expect(recordList?.length, `[${model}] No records found in index response. Expected: non-empty record list, Received: ${recordList?.length || 'null'}`).toBeGreaterThan(0);
                    // expect(primaryKey, `[${model}] Primary key not found in index response. Expected: string, Received: ${primaryKey || 'null'}`).toBeDefined();
                    // expect(deleteResponse?.status, `[${model}] POST /delete.json failed. Expected status: 200, Received: ${deleteResponse?.status || 'null'}`).toBe(200);

                    const parseResult = DeleteResponseSchema.safeParse(deleteResponseData);
                    expect(
                        parseResult.success,
                        `[${model}] Delete schema validation errors: ${parseResult.error?.message}`
                    ).toBe(true);
                }, 10000);

                it('should not have any errors for POST /delete', async () => {
                    if (!deleteResponseData) {
                        expect(deleteResponse?.status, `[${model}] POST /delete.json failed. Expected status: 200, Received: ${deleteResponse?.status || 'null'}`).toBe(200);
                        return;
                    }
                    const noError = deleteResponseData?.errors
                        ? Array.isArray(deleteResponseData.errors)
                            ? deleteResponseData.errors.length === 0
                            : Object.keys(deleteResponseData.errors).length === 0
                        : true;
                    expect(
                        noError,
                        `[${model}] POST /delete response contains errors. Expected: no errors, Received: ${JSON.stringify(deleteResponseData?.errors, null, 2)}`
                    ).toBe(true);
                }, 10000);
            });
        });
});