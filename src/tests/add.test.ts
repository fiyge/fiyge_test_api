// src/add.test.ts

import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import {exceptionModelList, modelList} from '../constants.ts';
import { PostResponseSchema } from "../schemas/postResponseSchema.ts";
import dayjs from "dayjs";

// Utility to recursively extract required fields from form.children
function getRequiredFormFields(children: any[], requiredFields: { name: string; template?: string }[] = []) {
    children.forEach((child: any) => {
        if (child['not_empty'] === '1' && child.name) {
            requiredFields.push({ name: child.name, template: child.template || 'varchar' });
        }
        if (Array.isArray(child.children)) {
            getRequiredFormFields(child.children, requiredFields);
        }
    });
    return requiredFields;
}

// @ts-ignore
function flattenInfiniteFormChildren(formChildren: { children: any }[]) {
    // @ts-ignore
    const flattenedChildren = [];
    formChildren.forEach((child: any) => {
        flattenedChildren.push(child);
        if (Array.isArray(child.children)) {
            const newChildren = flattenInfiniteFormChildren(child.children);
            flattenedChildren.push(...newChildren);
        }
    });
    // @ts-ignore
    // const flattenedChildren = formChildren.flatMap(child => child.children ?? []);
    // if (flattenedChildren.some(child => Array.isArray(child.children))) {
    //     const newChildren = flattenInfiniteFormChildren(flattenedChildren);
    //     flattenedChildren.push(newChildren);
    //     return flattenedChildren
    // }
    // console.log("flattenedChildren", flattenedChildren);
    // @ts-ignore
    return flattenedChildren;
}

// Utility to construct POST payload for a model
function constructPostPayload(getResponse: any, model: string): any {
    // construct controller and method
    const methodArr = model.split("/").filter(value => value.length > 0);
    const controller = methodArr[methodArr.length - 1];
    methodArr.push("add")
    const method = methodArr.join(".")

    // Extract required fields from notEmptyField
    const notEmptyFields: string[] | Record<string, any> = getResponse.notEmptyField?.[controller] || {};
    const requiredFields = Object.keys(notEmptyFields)
    // @ts-ignore
    // const requiredFields = Object.keys(notEmptyFields).filter(key => typeof notEmptyFields[key] === "string");
    // console.log(`requiredFields: ${requiredFields}`)

    // Extract required fields from nested form.children
    const formChildren = getResponse.form?.children || [];
    const requiredFormFields = getRequiredFormFields(formChildren);
    const flattenFormChildren = flattenInfiniteFormChildren(formChildren);
    const filteredFormChildren = flattenFormChildren.filter((child: { template: any; permission: any; }) => child.template !== undefined && child.template !== null && child.permission !== "1");
    // console.log("getResponse", getResponse);
    const filteredFormChildrenName = filteredFormChildren.map((child: { name: any[]; }) => child.name ? child.name.join(".") : "").filter((name: string) => name !== "");
    // console.log("filteredFormChildrenName", filteredFormChildrenName);
    // console.log("flattenFormChildren", JSON.stringify(flattenFormChildren, null, 2));


    // Combine unique required fields
    const allRequiredFields = [...new Set([...requiredFields, ...requiredFormFields.map((f: any) => f.name)])];
    console.log("filteredFormChildrenName", JSON.stringify(filteredFormChildrenName, null, 2));
    console.log("allRequiredFields", JSON.stringify(allRequiredFields, null, 2))
    const filteredRequiredFields = allRequiredFields.filter(field => {
        const fieldName = Array.isArray(field) ? [controller, ...field].join(".") : [controller, field].join(".");
        // console.log("typeof field", typeof field)
        // console.log("fieldName", fieldName);
        return filteredFormChildrenName.includes(fieldName)
    })
    // console.log("allRequiredFields", allRequiredFields);
    // console.log("filteredRequiredFields", filteredRequiredFields);

    // Construct data object with dynamic values
    const data: { [key: string]: any } = {};
    filteredRequiredFields.forEach((field) => {
        const fieldName = Array.isArray(field) ? [controller, ...field].join(".") : [controller, field].join(".");
        const child = filteredFormChildren.find((f: any) => f.name?.join(".") === fieldName);
        const fieldType = child?.template || (field.includes('_id') ? 'int' : 'varchar');

        const isDropdown = ["popup", "select"].includes(fieldType);
        const isNumber = fieldType === "number";
        const isDate = fieldType === "date" || (fieldType === "input" && child.method === "date");
        const isDatetime = fieldType === "input" && child.method === "datetime";

        // dropdown, number field
        if (isDropdown || isNumber || fieldType.includes('int') || field.includes('_id')) {
            data[field] = 1;
        } else if (isDate) {
            data[field] = dayjs().format("YYYY-MM-DD");
        } else if (isDatetime) {
            data[field] = dayjs().format("YYYY-MM-DD HH:mm:ss");
        // text field
        // } else if (fieldType.includes('varchar') || fieldType.includes('text')) {
            // data[field] = `Test${field.charAt(0).toUpperCase() + field.slice(1)}`;
        // else
        } else {
            data[field] = `Test${field.charAt(0).toUpperCase() + field.slice(1)}`;
            // data[field] = null; // Safe default
        }
    });

    // Add related fields if specified in form.children (example logic, adjust based on metadata)
    // const relatedFields: { [key: string]: { display: string; model: string } } = {};
    // formChildren.forEach((child: any) => {
    //     if (child.name && child.related_to && child['not-empty'] === '1') {
    //         relatedFields[child.name] = { display: `Test${child.name}`, model: child.related_to };
    //     }
    //     if (Array.isArray(child.children)) {
    //         child.children.forEach((subChild: any) => {
    //             if (subChild.name && subChild.related_to && subChild['not-empty'] === '1') {
    //                 relatedFields[subChild.name] = { display: `Test${subChild.name}`, model: subChild.related_to };
    //             }
    //         });
    //     }
    // });

    // console.log(`controller debug: ${controller}`)

    // allRequiredFields.forEach((field) => {
    //     if (relatedFields[field]) {
    //         data[`__${field}`] = relatedFields[field].display;
    //         data[`${field}_model`] = relatedFields[field].model;
    //     }
    // });

    return {
        jsonrpc: '2.0',
        method: method,
        params: {
            normalized: 1,
            action: {
                save_continue: 'Save & Continue',
            },
            data: {
                [controller]: data,
            },
        },
        id: 1,
    };
}

let apiClient: AxiosInstance;

beforeAll(async () => {
    apiClient = axios.create({
        baseURL: 'https://api.uat.fiyge.com/',
        headers: {
            Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmlhaS5maXlnZS5jb20iLCJpYXQiOjE3NTUyODM3MzMsImV4cCI6MTc1NTI4NzMzMywibmJmIjoxNzU1MjgzNzMzLCJ1c2VyX2lkIjoiMTEzNiJ9.A5bstdGg4bw2EDRHyWI4I84_QuQUkcjA68I9Pcxv2E0',
        },
    });
    return;
});

describe('Add API Response Validation', () => {
    modelList
    // [
    //     "crm/leads",
    //     "crm/opportunities",
    //     "crm/people",
    //     "crm/companies",
    // ]
        .filter((model: string) => !exceptionModelList.includes(model))
        .forEach((model: string) => {
            describe(`Model: ${model}`, () => {
                let getResponseData: any = null;
                let getResponseStatus: number | null = null;
                let getResponseError: any = null;
                let postResponseData: any = null;
                let postResponseStatus: number | null = null;
                let postResponseError: any = null;

                beforeAll(async () => {
                    // GET /add.json
                    const getEndpoint = `/${model}/add.json`;
                    try {
                        const response = await apiClient.get(getEndpoint);
                        // console.log(response);
                        getResponseStatus = response.status;
                        getResponseData = response.data;
                        getResponseError = null;
                        // console.log(`[${model}] GET /add response status:`, getResponseStatus);
                        // console.log(`[${model}] GET /add response data:`, JSON.stringify(getResponseData, null, 2));

                        const parseResult = FormResponseSchema.safeParse(getResponseData);
                        if (!parseResult.success) {
                            console.error(`[${model}] GET /add schema validation errors:`, parseResult.error);
                            throw new Error(`Schema validation failed for ${model}/add.json`);
                        }
                    } catch (error) {
                        getResponseError = error;
                        // @ts-ignore
                        getResponseStatus = error.response?.status || null;
                        // @ts-ignore
                        getResponseData = error.response?.data || null;
                        // @ts-ignore
                        console.error(`[${model}] GET /add API call failed:`, error.message);
                    }

                    // POST /add
                    if (getResponseStatus === 200 && getResponseData) {
                        const postEndpoint = `/${model}/add.json`;
                        const payload = constructPostPayload(getResponseData, model);
                        console.log(`[${model}] POST /add payload:`, JSON.stringify(payload, null, 2));

                        try {
                            const response = await apiClient.post(postEndpoint, payload);
                            postResponseStatus = response.status;
                            postResponseData = response.data;
                            postResponseError = null;
                            // console.log(`[${model}] POST /add response status:`, postResponseStatus);
                            // console.log(`[${model}] POST /add response data:`, JSON.stringify(postResponseData, null, 2));
                        } catch (error) {
                            postResponseError = error;
                            // @ts-ignore
                            postResponseStatus = error.response?.status || null;
                            // @ts-ignore
                            postResponseData = error.response?.data || null;
                            // @ts-ignore
                            console.error(`[${model}] POST /add API call failed:`, error.message);
                        }
                    }
                });

                it('should conform to the FormResponseSchema for GET /add', async () => {
                    // if (getResponseError && getResponseStatus === 401) {
                    //     console.log(`[${model}] Expected 401 error for GET /add:`, getResponseData?.errors);
                    //     expect(getResponseData?.errors).toContain('Client need to login to access this URL');
                    //     return;
                    // }

                    expect(getResponseStatus).toBe(200);
                    expect(FormResponseSchema.safeParse(getResponseData).success).toBe(true);
                });

                it('should conform to the PostResponseSchema for POST /add', async () => {
                    // if (getResponseError && getResponseStatus === 401) {
                    //     console.log(`[${model}] Skipping POST due to GET 401 error:`, getResponseData?.errors);
                    //     expect(getResponseData?.errors).toContain('Client need to login to access this URL');
                    //     return;
                    // }
                    //
                    // if (postResponseError && postResponseStatus === 401) {
                    //     console.log(`[${model}] Expected 401 error for POST /add:`, postResponseData?.errors);
                    //     expect(postResponseData?.errors).toContain('Client need to login to access this URL');
                    //     return;
                    // }

                    expect(postResponseStatus).toBe(200);
                    const parseResult = PostResponseSchema.safeParse(postResponseData);
                    // console.log(`[${model}] POST /add schema parse result success:`, parseResult.success);
                    if (!parseResult.success) {
                        console.error(`postResponseData: ${JSON.stringify(postResponseData, null, 2)}`)
                        console.error(`[${model}] POST /add schema validation errors:`, parseResult.error);
                        throw new Error(`Schema validation failed for ${model}/add POST`);
                    }
                    expect(parseResult.success).toBe(true);
                });

                it('should have a valid errors array or result in POST response', async () => {
                    // if (getResponseError && getResponseStatus === 401) {
                    //     console.log(`[${model}] Skipping POST due to GET 401 error:`, getResponseData?.errors);
                    //     expect(getResponseData?.errors).toContain('Client need to login to access this URL');
                    //     return;
                    // }
                    //
                    // if (postResponseError && postResponseStatus === 401) {
                    //     console.log(`[${model}] Expected 401 error for POST /add:`, postResponseData?.errors);
                    //     expect(postResponseData?.errors).toContain('Client need to login to access this URL');
                    //     return;
                    // }

                    expect(postResponseStatus).toBe(200);
                    if (postResponseStatus !== 200) {
                        console.error(`postResponseData: ${JSON.stringify(postResponseError, null, 2)}`);
                    }
                    const data = postResponseData;
                    // console.log(`[${model}] POST /add response:`, data.error ? data.error.message : data.result);
                    if (data.error) {
                        expect(data.error).toHaveProperty('message');
                        expect(typeof data.error.message).toBe('string');
                    } else {
                        expect(data.result).toBeDefined();
                        expect(data.result).toHaveProperty('id');
                    }
                });

                it('should not have any errors for POST /add', async () => {
                    const noError = Array.isArray(postResponseData.result.errors) ? postResponseData.result.errors.length === 0 : Object.keys(postResponseData.result.errors).length === 0;
                    if (!noError) {
                        console.error(`POST /add response error, postResponseData.result.errors: ${JSON.stringify(postResponseData.result.errors, null, 2)}`)
                    }
                    expect(noError).toBe(true);
                });
            });
        });
});