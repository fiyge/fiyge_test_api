// src/delete.test.ts

// @ts-ignore
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {exceptionModelList} from '../constants.ts';
import modelList from '../models.json'
import {DeleteResponseSchema} from "../schemas/deleteResponseSchema.ts";

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
    // .slice(0, 5)
    .forEach((model) => {
        describe(`Model: ${model}`, () => {
            let indexResponse: AxiosResponse<any, any>;
            let indexResponseData;
            let paginateData;
            let recordList;
            let primaryKey;

            let deleteResponse;
            let deleteResponseData: any;
            it('should conform to the DeleteResponse schema', async () => {
                indexResponse = await apiClient.get(`/${model}/index.json`);
                indexResponseData = indexResponse?.data;
                paginateData = indexResponseData?.paginate;
                recordList = paginateData?.data
                primaryKey = paginateData?.primary_key;

                const id = recordList.at(0)?.[primaryKey];
                deleteResponse = await apiClient.post(`/${model}/delete.json?id=${id}&is_confirm=1&override=1`);
                deleteResponseData = deleteResponse?.data;
                // // console.log(`[${model}] Delete response status:`, response.status);
                // console.log("response.data: ",deleteResponse.data);
                expect(deleteResponse.status).toBe(200);

                // console.log(`[${model}] Delete response data:`, JSON.stringify(response.data, null, 2));
                const parseResult = DeleteResponseSchema.safeParse(deleteResponse.data);
                // console.log(`[${model}] Delete schema parse result success:`, parseResult.success);
                if (!parseResult.success) {
                    console.error(`[${model}] Delete schema validation errors:`, parseResult.error);
                    throw new Error(`Schema validation failed for ${model}/delete.json`);
                }
                expect(parseResult.success).toBe(true);
            }, 10000);

            it('should not have any errors for POST /delete', async () => {
                // console.log("deleteResponseData: ", deleteResponseData)
                const noError = Array.isArray(deleteResponseData.errors) ? deleteResponseData.errors.length === 0 : Object.keys(deleteResponseData.errors).length === 0;
                if (!noError) {
                    // console.log(`[${model}] POST /add payload:`, JSON.stringify(payload, null, 2));
                    console.error(`POST /add response error, postResponseData.result.errors: ${JSON.stringify(deleteResponseData.errors, null, 2)}`)
                }
                expect(noError).toBe(true);
            }, 10000);
        });
    });
});