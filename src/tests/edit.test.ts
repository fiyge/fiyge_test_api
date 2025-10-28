// src/edit.test.ts

import axios, { AxiosInstance } from 'axios';
import { FormResponseSchema } from '../schemas/formSchema.ts';
import { exceptionModelList } from '../constants.ts';
import modelList from '../models.json';
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || 'https://api.uat.fiyge.com/';

let apiClient: AxiosInstance;

beforeAll(async () => {
    const formData = new FormData();
    formData.append("data[users][user_name]", process.env.USER_NAME ?? "")
    formData.append("data[users][user_password]", process.env.USER_PASSWORD ?? "")
    const response = await axios.post(API_URL + "/access_controls/users/login.json", formData)

    const token = response.data.access_token
    apiClient = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization:
                `Bearer ${token}`,
        },
    });
    return;
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