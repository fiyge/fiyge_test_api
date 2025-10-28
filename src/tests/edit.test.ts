// src/edit.test.ts
import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import { PostResponseSchema } from '../schemas/postResponseSchema.ts';
import { exceptionModelList } from '../constants.ts';
import modelList from '../models.json';
import dotenv from 'dotenv';
import {
    constructEditPayload,
} from '../utils.ts';   // <-- shared helper

dotenv.config();

const API_URL = process.env.API_URL || 'https://api.uat.fiyge.com/';
let apiClient: AxiosInstance;

/* -------------------------------------------------------------
   Login once – token is reused for every model
   ------------------------------------------------------------- */
beforeAll(async () => {
    const form = new FormData();
    form.append('data[users][user_name]', process.env.USER_NAME ?? '');
    form.append('data[users][user_password]', process.env.USER_PASSWORD ?? '');

    const loginRes = await axios.post(`${API_URL}/access_controls/users/login.json`, form);
    const token = loginRes.data.access_token;

    apiClient = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` },
    });
});

/* -------------------------------------------------------------
   EDIT TEST SUITE
   ------------------------------------------------------------- */
describe('Edit API Response Validation (GET + POST /edit.json)', () => {
    modelList
        .filter((model: string) => !exceptionModelList.includes(model) && !model.startsWith("docgen/") && !model.startsWith("development"))
        // .slice(0, 5)   // <-- uncomment for quick local runs
        .forEach((model: string) => {
            describe(`Model: ${model}`, () => {
                /* ---- shared state for the whole model ---- */
                let indexRes: any = null;
                let recordId: string | number | null = null;
                let primaryKey: string | null = null;

                let getEditRes: any = null;   // GET /edit.json
                let postEditRes: any = null;  // POST /edit.json
                let payload: any = null;

                /* -------------------------------------------------------
                   1. Pick a real record from /index.json
                   ------------------------------------------------------- */
                beforeAll(async () => {
                    indexRes = await apiClient.get(`/${model}/index.json`);

                    if (indexRes?.status !== 200) return; // skip the rest for this model

                    const paginate = indexRes.data?.paginate;
                    primaryKey = paginate?.primary_key ?? null;
                    const first = paginate?.data?.[0];

                    if (!first || !primaryKey) return; // no data → skip edit tests

                    recordId = first[primaryKey];
                });

                /* -------------------------------------------------------
                   2. GET /edit.json (form)
                   ------------------------------------------------------- */
                beforeAll(async () => {
                    if (!recordId) return; // nothing to edit

                    getEditRes = await apiClient.get(`/${model}/edit.json?id=${recordId}`);
                });

                /* -------------------------------------------------------
                   3. POST /edit.json (update)
                   ------------------------------------------------------- */
                beforeAll(async () => {
                    if (!recordId || getEditRes?.status !== 200) return;

                    const controller = model.split('/')[1];
                    payload = constructEditPayload(
                        getEditRes.data,
                        model,
                        recordId,
                        getEditRes.data?.data?.[controller]
                    );

                    postEditRes = await apiClient.post(`/${model}/edit.json`, payload);
                    // console.log("getEditRes.data: ", getEditRes.data);
                    // console.log("postEditRes.data: ", postEditRes.data);
                });

                /* ------------------- TESTS ------------------- */

                it('GET /edit.json → 200 + FormResponseSchema', async () => {
                    expect(
                        getEditRes?.status,
                        `[${model}] GET /edit.json failed. Expected status: 200, Received: ${getEditRes?.status}`
                    ).toBe(200);

                    const parseResult = FormResponseSchema.safeParse(getEditRes?.data);
                    expect(
                        parseResult.success,
                        `[${model}] GET /edit.json schema validation failed. Expected: valid schema, Received: ${parseResult.error?.message}`
                    ).toBe(true);
                });

                it('POST /edit.json → 200 + PostResponseSchema', async () => {

                    expect(
                        postEditRes?.status,
                        `[${model}] POST /edit.json failed. Expected status: 200, Received: ${postEditRes?.status}`
                    ).toBe(200);

                    const parseResult = PostResponseSchema.safeParse(postEditRes?.data);
                    expect(
                        parseResult.success,
                        `[${model}] POST /edit.json schema validation failed. Expected: valid schema, Received: ${parseResult.error?.message}`
                    ).toBe(true);
                });

                it('POST response contains a valid result (no error object)', async () => {

                    expect(
                        postEditRes?.status,
                        `[${model}] POST /edit.json status check. Expected: 200, Received: ${postEditRes?.status}`
                    ).toBe(200);

                    const data = postEditRes?.data ?? {};
                    if (data.error) {
                        expect(
                            data.error,
                            `[${model}] POST /edit.json returned an error object. Expected: no error, Received: ${data.error.message}`
                        ).toHaveProperty('message');
                    } else {
                        expect(
                            data.result,
                            `[${model}] POST /edit.json missing result. Expected: defined result, Received: ${JSON.stringify(
                                data.result,
                                null,
                                2
                            )}`
                        ).toBeDefined();
                        expect(
                            data.result,
                            `[${model}] POST /edit.json missing id in result. Expected: result.id, Received: ${JSON.stringify(
                                data.result,
                                null,
                                2
                            )}`
                        ).toHaveProperty('id');
                    }
                });

                it('POST /edit.json returns no validation errors', async () => {
                    if (!recordId) return;

                    const errors = postEditRes?.data?.result?.errors ?? null;
                    const noError =
                        errors === null ||
                        (Array.isArray(errors) ? errors.length === 0 : Object.keys(errors).length === 0);

                    expect(
                        noError,
                        `[${model}] POST /edit.json contains validation errors. Expected: [] or {}, Received: ${JSON.stringify(
                            errors,
                            null,
                            2
                        )}`
                    ).toBe(true);
                });
            });
        });
});