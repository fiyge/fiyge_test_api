// src/view.test.ts

// @ts-ignore
import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import {exceptionModelList} from '../constants.ts';
import modelList from '../models.json'

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

describe('View API Response Validation (GET /view.json)', () => {
    // [
    //     'crm/leads',
    //     'crm/opportunities',
    //     'crm/people',
    //     'crm/companies',
    // ]
    modelList
        // .filter(model => !exceptionModelList.includes(model))
        .forEach((model) => {
            describe(`Model: ${model}`, () => {
                it('should conform to the ViewResponse schema', async () => {
                    const response = await apiClient.get(`/${model}/view.json`);
                    // console.log(`[${model}] View response status:`, response.status);
                    expect(response.status).toBe(200);

                    // console.log(`[${model}] View response data:`, JSON.stringify(response.data, null, 2));
                    const parseResult = FormResponseSchema.safeParse(response.data);
                    // console.log(`[${model}] View schema parse result success:`, parseResult.success);
                    if (!parseResult.success) {
                        console.error(`[${model}] View schema validation errors:`, parseResult.error);
                        throw new Error(`Schema validation failed for ${model}/view.json`);
                    }
                    expect(parseResult.success).toBe(true);
                });

                // it('should have a valid errors array', async () => {
                //     const response = await apiClient.get(`/${model}/view.json`);
                //     // console.log(`[${model}] View response status:`, response.status);
                //     expect(response.status).toBe(200);
                //
                //     const data = response.data;
                //     // console.log(`[${model}] View errors array:`, data.errors);
                //     expect(Array.isArray(data.errors)).toBe(true);
                //     data.errors.forEach((error: any, index: number) => {
                //         // console.log(`[${model}] View Error[${index}]:`, error);
                //         expect(typeof error).toBe('string');
                //     });
                // });
                //
                // it('should have all required fields with correct types', async () => {
                //     const response = await apiClient.get(`/${model}/view.json`);
                //     // console.log(`[${model}] View response status:`, response.status);
                //     expect(response.status).toBe(200);
                //
                //     const data = response.data;
                //
                //     const requiredFields: [keyof typeof FormResponseSchema.shape, string][] = [
                //         ['data', 'object'],
                //         ['errors', 'object'],
                //         ['message', 'object'],
                //         ['primary_key', 'string'],
                //         ['display_field', 'string'],
                //         ['model', 'string'],
                //         ['name', 'string'],
                //         ['form', 'object'],
                //         // ['filter_form', 'object'],
                //         ['alias', 'string'],
                //         ['notEmptyField', 'object'],
                //     ];
                //
                //     requiredFields.forEach(([field, type]) => {
                //         try {
                //             expect(data[field]).toBeDefined();
                //         } catch (error) {
                //             console.error(`[${model}] Field ${String(field)}:`, data[field]);
                //         }
                //
                //         if (type === 'object') {
                //             // console.log(`[${model}] Type of ${String(field)}:`, typeof data[field]);
                //             expect(typeof data[field]).toBe('object');
                //         } else {
                //             // console.log(`[${model}] Type of ${String(field)}:`, typeof data[field]);
                //             expect(typeof data[field]).toBe(type);
                //         }
                //     });
                // });
                //
                // it('should have correct types for optional fields', async () => {
                //     const response = await apiClient.get(`/${model}/view.json`);
                //     // console.log(`[${model}] View response status:`, response.status);
                //     expect(response.status).toBe(200);
                //
                //     const data = response.data;
                //
                //     const optionalFields: [keyof typeof FormResponseSchema.shape, string][] = [
                //         ['id', 'string|null'],
                //         ['is_record_deleted', 'boolean'],
                //         ['permissions', 'object'],
                //         // ['is_pseudo_design_element', 'number'],
                //         ['is_editable', 'number'],
                //         ['is_deletable', 'number'],
                //         // ['singleton_key', 'string'],
                //         // ['has_package', 'boolean'],
                //         // ['has_all_package', 'boolean'],
                //         // ['inherit_views', 'number'],
                //         ['paginate', 'object'],
                //         ['filter_form', 'object'],
                //     ];
                //
                //     optionalFields.forEach(([field, type]) => {
                //         if (field in data) {
                //             try {
                //                 // console.log(`[${model}] Optional field ${String(field)}:`, data[field]);
                //                 // if (type === 'object') {
                //                 //     // console.log(`[${model}] Type of optional ${String(field)}:`, typeof data[field]);
                //                 //     expect(typeof data[field]).toBe('object');
                //                 // } else if (type === 'string|null') {
                //                 //     // console.log(`[${model}] Value of optional ${String(field)}:`, data[field]);
                //                 //     expect(data[field] === null || typeof data[field] === 'string').toBe(true);
                //                 // } else {
                //                 //     // console.log(`[${model}] Type of optional ${String(field)}:`, typeof data[field]);
                //                 //     expect(typeof data[field]).toBe(type);
                //                 // }
                //                 if (type === "string|null") {
                //                     expect(typeof data[field] === "string" || data[field] === null).toBeTruthy();
                //                 } else {
                //                     expect(typeof data[field]).toBe(type);
                //                 }
                //             } catch (error) {
                //                 console.error(`[${model}] Field ${String(field)}:`, type, `, actual type:`, typeof data[field], data[field]);
                //             }
                //         }
                //     });
                // });
                //
                // it('should have a valid form structure', async () => {
                //     const response = await apiClient.get(`/${model}/view.json`);
                //     // console.log(`[${model}] View response status:`, response.status);
                //     expect(response.status).toBe(200);
                //
                //     const data = response.data;
                //
                //     // console.log(`[${model}] Form:`, data.form);
                //     expect(data.form).toBeDefined();
                //     expect(Array.isArray(data.form.children)).toBe(true);
                //     data.form.children.forEach((child: any, index: number) => {
                //         // console.log(`[${model}] Form child[${index}]:`, child);
                //         expect(child).toHaveProperty('template');
                //     });
                //     // console.log(`[${model}] Form enable_split_layout:`, data.form.enable_split_layout);
                //     expect(typeof data.form.enable_split_layout).toBe('number');
                //
                //     // console.log(`[${model}] Filter Form:`, data.filter_form);
                //     // expect(data.filter_form).toBeDefined();
                //     if (data.filter_form !== undefined && data.filter_form !== null) {
                //         expect(Array.isArray(data.filter_form.children)).toBe(true);
                //         data.filter_form.children.forEach((child: any, index: number) => {
                //             // console.log(`[${model}] Filter Form child[${index}]:`, child);
                //             expect(child).toHaveProperty('template');
                //         });
                //     }
                // });
            });
        });
});
// })()