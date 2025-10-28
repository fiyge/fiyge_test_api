// src/edit.test.ts

import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
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

describe('Edit API Response Validation (GET /edit.json)', () => {
    modelList
        .filter((model: string) => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
        // .slice(0, 5)
        .forEach((model) => {
            describe(`Model: ${model}`, () => {
                it('should conform to the EditResponse schema', async () => {
                    const response = await apiClient.get(`/${model}/edit.json`);
                    // console.log(`[${model}] Edit response status:`, response.status);
                    expect(response.status).toBe(200);

                    const parseResult = FormResponseSchema.safeParse(response.data);
                    expect(
                        parseResult.success,
                        `[${model}] Edit schema validation errors: ${parseResult.error?.message}`
                    ).toBe(true);
                });
            });
        });
});