// src/metadataSchema.test.ts

import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import {modelList} from "../constants.ts";
import {MetadataSchemaResponse, MetadataSchemaResponseSchema} from "../schemas/metadataSchema.ts";

// Mock or real API client
let apiClient: AxiosInstance;

beforeAll(async () => {
    apiClient = axios.create({
        baseURL: 'https://api.uat.fiyge.com/',
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
        },
    });
    return;
});

describe('Metadata Schema API Response Validation', () => {

    modelList.forEach((controller) => {
        describe(`Controller: ${controller}`, () => {
            let responseData: any = null;
            let responseStatus: number | null = null;
            let responseError: any = null;

            beforeEach(async () => {
                const endpoint = `/metadata/schema/index.json?search_controller=${encodeURIComponent(controller)}&fetch_associations=[belongsTo]&autocomplete=1`;
                try {
                    const response = await apiClient.get(endpoint);
                    responseStatus = response.status;
                    responseData = response.data;
                    responseError = null;
                    // console.log(`[${controller}] Metadata schema response status:`, responseStatus);
                    // console.log(`[${controller}] Metadata schema response data:`, JSON.stringify(responseData, null, 2));
                } catch (error) {
                    // responseError = error;
                    // responseStatus = error.response?.status || null;
                    // responseData = error.response?.data || null;
                    console.error(`[${controller}] API call failed:`);
                }
            });

            it('should conform to the MetadataSchemaResponse schema', async () => {
                if (responseError && responseStatus === 401) {
                    // console.log(`[${controller}] Expected 401 error:`, responseData?.errors);
                    expect(responseData?.errors).toContain('Client need to login to access this URL');
                    return;
                }

                expect(responseStatus).toBe(200);
                const parseResult = MetadataSchemaResponseSchema.safeParse(responseData);
                // console.log(`[${controller}] Schema parse result success:`, parseResult.success);
                if (!parseResult.success) {
                    console.error(`[${controller}] Schema validation errors:`, parseResult.error);
                    throw new Error(`Schema validation failed for ${controller}`);
                }
                expect(parseResult.success).toBe(true);
            });

            it('should have a valid errors array', async () => {
                // if (responseError && responseStatus === 401) {
                //     console.log(`[${controller}] Expected 401 error:`, responseData?.errors);
                //     expect(responseData?.errors).toContain('Client need to login to access this URL');
                //     return;
                // }

                expect(responseStatus).toBe(200);
                const data: MetadataSchemaResponse = responseData;
                // console.log(`[${controller}] Errors array:`, data.errors);
                expect(Array.isArray(data.errors)).toBe(true);

                data.errors.forEach((error, index) => {
                    // console.log(`[${controller}] Error[${index}]:`, error);
                    expect(typeof error).toBe('string');
                });
            });

            it('should have all required fields with correct types', async () => {
                if (responseError && responseStatus === 401) {
                    // console.log(`[${controller}] Expected 401 error:`, responseData?.errors);
                    expect(responseData?.errors).toContain('Client need to login to access this URL');
                    return;
                }

                expect(responseStatus).toBe(200);
                const data = responseData;

                const requiredFields: [keyof typeof MetadataSchemaResponseSchema.shape, string | string[]][] = [
                    ['paginate', 'object'],
                    ['errors', 'object'],
                    ['message', 'object'],
                    ['q', ["boolean", "null"]],
                    ['query', 'object'],
                ];

                requiredFields.forEach(([field, type]) => {
                    // console.log(`[${controller}] Field ${String(field)}:`, data[field]);
                    try {
                        expect(data[field]).toBeDefined();

                        if (Array.isArray(type)) {
                            expect(type.includes(typeof data[field])).toBe(true);
                        } else if (type === 'array') {
                            expect(Array.isArray(typeof data[field])).toBe(true);
                        } else if (type === 'object') {
                            // console.log(`[${controller}] Type of ${String(field)}:`, typeof data[field]);
                            expect(typeof data[field]).toBe('object');
                        } else {
                            // console.log(`[${controller}] Type of ${String(field)}:`, typeof data[field]);
                            expect(typeof data[field]).toBe(type);
                        }
                    } catch (error) {
                        console.error(`[${controller}] field (${field}) unexpected value: ${data[field]}`);
                        throw new Error(`[${controller}] field (${field}) unexpected value: ${data[field]}`)
                    }
                });
            });

            it('should have a valid paginate structure', async () => {
                if (responseError && responseStatus === 401) {
                    // console.log(`[${controller}] Expected 401 error:`, responseData?.errors);
                    expect(responseData?.errors).toContain('Client need to login to access this URL');
                    return;
                }

                expect(responseStatus).toBe(200);
                const data = responseData;

                // console.log(`[${controller}] Paginate:`, data.paginate);
                expect(data.paginate).toBeDefined();
                expect(Array.isArray(data.paginate.data)).toBe(true);

                data.paginate.data.forEach((item: { name: any; label: any; type: any; column: any; ntype: any; }, index: any) => {
                    // console.log(`[${controller}] Paginate data item[${index}]:`, item);
                    expect(typeof item).toBe('object');
                    expect(item).toHaveProperty('name');
                    expect(typeof item.name).toBe('string');
                    expect(item).toHaveProperty('label');
                    expect(typeof item.label).toBe('string');
                    expect(item).toHaveProperty('type');
                    expect(typeof item.type).toBe('string');
                    if (item.column !== undefined && item.column !== null) {
                        expect(typeof item.column).toBe('string');
                    }
                    if (item.ntype !== undefined && item.ntype !== null) {
                        expect(typeof item.ntype).toBe('string');
                    }
                    // expect(item).toHaveProperty('column');
                    // expect(typeof item.column).toBe('string');
                    // expect(item).toHaveProperty('ntype');
                    // expect(typeof item.ntype).toBe('string');
                });
            });
        });
    });
});