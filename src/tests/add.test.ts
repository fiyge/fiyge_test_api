// src/add.test.ts

// @ts-ignore
import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import {exceptionModelList} from '../constants.ts';
import modelList from '../models.json'

// Mock or real API client
// (async () => {

let apiClient: AxiosInstance;

// @ts-ignore
// const modelList = await getModelList();

beforeAll(async () => {
    apiClient = axios.create({
        baseURL: 'https://api.iai.fiyge.com/',
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
        },
    });
    return;
});

describe('Add API Response Validation (GET /add.json)', () => {
    // [
    //     'crm/leads',
    //     'crm/opportunities',
    //     'crm/people',
    //     'crm/companies',
    // ]
    modelList
        .filter(model => !exceptionModelList.includes(model))
        .forEach((model) => {
        describe(`Model: ${model}`, () => {
            it('should conform to the AddResponse schema', async () => {
                const response = await apiClient.get(`/${model}/add.json`);
                // console.log(`[${model}] Add response status:`, response.status);
                expect(response.status).toBe(200);

                // console.log(`[${model}] Add response data:`, JSON.stringify(response.data, null, 2));
                const parseResult = FormResponseSchema.safeParse(response.data);
                // console.log(`[${model}] Add schema parse result success:`, parseResult.success);
                if (!parseResult.success) {
                    console.error(`[${model}] Add schema validation errors:`, parseResult.error);
                    throw new Error(`Schema validation failed for ${model}/add.json`);
                }
                expect(parseResult.success).toBe(true);
            });
        });
    });
});