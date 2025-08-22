// src/dashboard.ts

import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import {DashboardResponse, DashboardResponseSchema} from "../schemas/dashboardSchema.ts";

// Mock or real API client
let apiClient: AxiosInstance;

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

describe('Dashboard API Response Validation', () => {
    const endpoint = '/core/listviews/dashboard.json';

    it('should conform to the DashboardResponse schema', async () => {
        const response = await apiClient.get(endpoint);
        // console.log('[dashboard] Response status:', response.status);
        expect(response.status).toBe(200);

        // console.log('[dashboard] Response data:', JSON.stringify(response.data, null, 2));
        const parseResult = DashboardResponseSchema.safeParse(response.data);
        // console.log('[dashboard] Schema parse result success:', parseResult.success);
        if (!parseResult.success) {
            console.error('[dashboard] Schema validation errors:', parseResult.error);
            throw new Error('Schema validation failed for /core/listviews/dashboard');
        }
        expect(parseResult.success).toBe(true);
    });

    it('should have a valid errors array', async () => {
        const response = await apiClient.get(endpoint);
        // console.log('[dashboard] Response status:', response.status);
        expect(response.status).toBe(200);

        const data: DashboardResponse = response.data;
        // console.log('[dashboard] Errors array:', data.errors);
        expect(Array.isArray(data.errors)).toBe(true);

        data.errors.forEach((error, index) => {
            // console.log('[dashboard] Error[' + index + ']:', error);
            expect(typeof error).toBe('string');
        });
    });

    it('should have all required fields with correct types', async () => {
        const response = await apiClient.get(endpoint);
        // console.log('[dashboard] Response status:', response.status);
        expect(response.status).toBe(200);

        const data = response.data;

        const requiredFields = [
            ['paginate', 'object'],
            ['errors', 'object'],
            ['message', 'object'],
            ['inherit_views', 'number'],
            ['alias', 'string'],
            ['singular', 'string'],
            ['model', 'string'],
            ['controllerClass', 'string'],
            ['modelClass', 'string'],
            ['notEmptyField', 'object'],
        ];

        requiredFields.forEach(([field, type]) => {
            // console.log('[dashboard] Field ' + field + ':', data[field]);
            expect(data[field]).toBeDefined();

            if (type === 'object') {
                // console.log('[dashboard] Type of ' + field + ':', typeof data[field]);
                expect(typeof data[field]).toBe('object');
            } else {
                // console.log('[dashboard] Type of ' + field + ':', typeof data[field]);
                expect(typeof data[field]).toBe(type);
            }
        });
    });

    it('should have a valid paginate structure', async () => {
        const response = await apiClient.get(endpoint);
        // console.log('[dashboard] Response status:', response.status);
        expect(response.status).toBe(200);

        const data = response.data;

        // console.log('[dashboard] Paginate:', data.paginate);
        expect(data.paginate).toBeDefined();
        expect(Array.isArray(data.paginate.data)).toBe(true);

        data.paginate.data.forEach((item: { name: any; controller: any; id: any; module_label: any; }, index: string) => {
            // console.log('[dashboard] Paginate data item[' + index + ']:', item);
            expect(typeof item).toBe('object');
            expect(item).toHaveProperty('name');
            expect(typeof item.name).toBe('string');
            expect(item).toHaveProperty('controller');
            expect(typeof item.controller).toBe('string');
            expect(item).toHaveProperty('id');
            expect(typeof item.id).toBe('string');
            expect(item).toHaveProperty('module_label');
            expect(typeof item.module_label).toBe('string');
        });
    });
});