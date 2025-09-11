// src/delete.ts

// @ts-ignore
import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import {exceptionModelList} from '../constants.ts';
import modelList from '../models.json'
import {DeleteResponseSchema} from "../schemas/deleteResponseSchema.ts";

const API_URL = process.env.API_URL || 'https://api.uat.fiyge.com/';
// Mock or real API client
// (async () => {

let apiClient: AxiosInstance;

// @ts-ignore
// const modelList = await getModelList();

beforeAll(async () => {
    apiClient = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
        },
    });
    return;
});

describe('Delete API Response Validation (GET /delete.json)', () => {
    // [
    //     'crm/leads',
    //     'crm/opportunities',
    //     'crm/people',
    //     'crm/companies',
    // ]
    modelList
    .filter((model: string) => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
    .forEach((model) => {
        describe(`Model: ${model}`, () => {
            it('should conform to the DeleteResponse schema', async () => {
                const response = await apiClient.get(`/${model}/delete.json`);
                // console.log(`[${model}] Delete response status:`, response.status);
                expect(response.status).toBe(200);

                // console.log(`[${model}] Delete response data:`, JSON.stringify(response.data, null, 2));
                const parseResult = DeleteResponseSchema.safeParse(response.data);
                // console.log(`[${model}] Delete schema parse result success:`, parseResult.success);
                if (!parseResult.success) {
                    console.error(`[${model}] Delete schema validation errors:`, parseResult.error);
                    throw new Error(`Schema validation failed for ${model}/delete.json`);
                }
                expect(parseResult.success).toBe(true);
            });
        });
    });
});