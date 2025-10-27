import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {IndexResponseSchema} from '../schemas/indexSchema.ts';
import {exceptionModelList, modelList} from "../constants.ts";

const API_URL = 'https://api.iai.fiyge.com/';

// Utility to access nested or flat property in a record
function getProperty(obj: any, path: string): any {
    // Try flat key first (e.g., "leads.name")
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
        return obj[path];
    }
    // Try nested path (e.g., leads.name → obj.leads.name)
    const parts = path.split('.');
    return parts.reduce((current, key) => current && current[key], obj);
}

// Utility to get search value from basic index response
function getSearchValue(basicData: any, model: string): string {
    const data = basicData?.paginate?.data || [];
    const displayField = basicData?.paginate?.display_field;

    if (!Array.isArray(data) || data.length === 0 || !displayField) {
        return 'TestValue'; // Fallback if no data or display_field
    }

    const record = data[0];
    return getProperty(record, displayField);

    // if (typeof value === 'string' && value.length > 3) {
    //     return value.substring(0, 3); // Use first 3 characters for partial match
    // }
    // return 'TestValue'; // Fallback if no suitable value
}

// Mock or real API client
let apiClient: AxiosInstance;
// let modelList: string[] = [];
// @ts-ignore
beforeAll(async () => {
    // modelList = await getModelList();
    apiClient = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTQ2Nzg1NTIsImV4cCI6MTc1NDY4MjE1MiwibmJmIjoxNzU0Njc4NTUyLCJ1c2VyX2lkIjoiMTEzNiJ9.xxi27lJdCQDdOVRRchPlSVg3y_qwvb2s10QYN7D_AL4',
        },
    });
    return;
});

describe('Index API Response Validation', () => {
    it("wait for API to get model list", () => {

    })
    modelList
        .filter(model => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
        // .slice(0, 5)
        .forEach((model) => {
            describe(`Model: ${model}`, () => {
                let basicResponse: AxiosResponse<any, any>;
            it('should conform to the IndexResponse schema', async () => {
                basicResponse = await apiClient.get(`/${model}/index.json`);
                expect(basicResponse.status).toBe(200);

                const parseResult = IndexResponseSchema.safeParse(basicResponse.data);
                if (!parseResult.success) {
                    // console.log("data", JSON.stringify(basicResponse.data, null, 2));
                    console.error(`[${model}] Schema validation errors:`, parseResult.error);
                    throw new Error(`Schema validation failed for ${model}/index.json`);
                }
                expect(parseResult.success).toBe(true);
            });

            let searchResponseData: any = null;
            let searchResponseStatus: number | null = null;
            let searchResponseError: any = null;
            // @ts-ignore
            // it('should return relevant data during search', async() => {
            //     const basicResponseStatus = basicResponse?.status;
            //     // @ts-ignore
            //     const basicResponseData = basicResponse?.data;
            //     const searchValue = basicResponseStatus === 200 ? getSearchValue(basicResponseData, model) : 'TestValue';
            //     const searchEndpoint = `/${model}/index.json?search_basic=${encodeURIComponent(searchValue)}`;
            //
            //     try {
            //         const response = await apiClient.get(searchEndpoint);
            //         searchResponseStatus = response.status;
            //         searchResponseData = response.data;
            //         searchResponseError = null;
            //     } catch (error) {
            //         searchResponseError = error;
            //         // @ts-ignore
            //         searchResponseStatus = error.response?.status || null;
            //         // @ts-ignore
            //         searchResponseData = error.response?.data || null;
            //         // @ts-ignore
            //         console.error(`[${model}] GET /index.json?search_basic=${searchValue} API call failed:`, error.message);
            //     }
            //
            //     expect(searchResponseStatus).toBe(200);
            //     const parseResult = IndexResponseSchema.safeParse(searchResponseData);
            //     if (!parseResult.success) {
            //         console.error(`[${model}] Search GET /index.json?search_basic=${searchValue} schema validation errors:`, parseResult.error);
            //         throw new Error(`Schema validation failed for ${model}/index.json?search_basic=${searchValue}`);
            //     }
            //     expect(parseResult.success).toBe(true);
            //
            //     // Validate search results relevance
            //     if (basicResponseStatus === 200 && basicResponseData?.paginate?.data?.length > 0 && basicResponseData?.paginate?.display_field) {
            //         const displayField = basicResponseData.paginate.display_field;
            //         const searchData = searchResponseData.paginate.data;
            //         const basicDataLength = basicResponseData.paginate.data.length;
            //         expect(searchData.length).toBeLessThanOrEqual(basicDataLength);
            //
            //         // Check if search results are relevant
            //         searchData.forEach((record: any) => {
            //             const value = getProperty(record, displayField) || '';
            //             // console.log(`value: ${value}, searchValue: ${searchValue}`)
            //             expect(value.toLowerCase()).toContain(searchValue.toLowerCase());
            //         });
            //     }
            // }, 10000);
        })
    });
})
