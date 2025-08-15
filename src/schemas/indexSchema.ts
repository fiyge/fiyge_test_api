import { z } from 'zod';
import {FormChild} from "../Types.ts";

// Define FormChild schema for filter_form
export const FilterFormSchema = z.object({
    children: z.array(z.object({
        name: z.array(z.string()),
        label: z.string(),
        method: z.string(),
        text: z.string(),
        value: z.string(),
        __filter_by_fields: z.string().nullable().optional(),
        min: z.string().nullable().optional(),
        max: z.string().nullable().optional(),
        children: z.lazy(() => z.array(z.object({
            href: z.string(),
        })).nullable().optional()),
        template: z.string(),
    }))
}).loose(); // Allow additional properties

// Define ConditionRule schema
const ConditionRuleSchema = z.object({
    type: z.string(),
    map: z.union([z.array(z.string()).length(0), z.record(z.string(), z.object({
        color: z.string().nullable(),
        name: z.string(),
        postfix_icon: z.string().nullable(),
        prefix_icon: z.string().nullable(),
    }))]),
}).loose();

// Define Header schema
const HeaderSchema = z.object({
    column_name: z.string().nullable().optional(),
    aggregator: z.string().optional(),
    name: z.string(),
    data_type: z.string(),
    sortable: z.union([z.boolean(), z.number(), z.string()]),
    visible: z.union([z.number(), z.boolean()]),
    label: z.string(),
    __column: z.string().nullable().optional(),
    render_type: z.string().nullable().optional(),
    is_invisible: z.union([z.string(), z.number()]),
    clickable_link: z.string().nullable().optional(),
    class: z.string().optional(),
    alias: z.string().optional(),
    url: z.string().optional(),
    conditional_rule: ConditionRuleSchema.optional(),
}).loose();

// Define CountQuery schema
const CountQuerySchema = z.object({
    fields: z.array(z.string()),
    name: z.string(),
    is_default: z.string(),
    ui_helper: z.string().nullable().optional(),
    method: z.string(),
    group: z.union([z.array(z.string()), z.string()]).nullable().optional(),
    first_field_alias: z.string(),
}).loose();

// Define Query schema (assuming Field is a string for simplicity; update if needed)
const QuerySchema = z.object({
    fields: z.array(z.union([z.string(), z.object()])),
    name: z.string(),
    is_default: z.string(),
    ui_helper: z.string().nullable().optional(),
    method: z.string(),
}).loose();

// Define FieldProperty schema
const FieldPropertySchema = z.object({
    column_name: z.string(),
    is_invisible: z.union([z.string(), z.number()]),
    render_type: z.string().nullable().optional(),
    __column: z.string().nullable().optional(),
}).loose();

// Define Paginate schema
export const PaginateSchema = z.object({
    data: z.array(z.record(z.string(), z.union([z.string(), z.boolean(), z.null(), z.array(z.any()), z.object()]))),
    alias: z.string(),
    page_size: z.number(),
    total_count: z.number(),
    primary_key: z.string(),
    display_field: z.string(),
    model: z.string(),
    row_template: z.string().optional(),
    javascript: z.string().optional(),
    name: z.string(),
    controller: z.string(),
    limit: z.number().optional(),
    is_default: z.string().optional(),
    method: z.string().optional(),
    field_alias: z.array(z.string()).optional(),
    listview_id: z.string().optional(),
    header: z.array(HeaderSchema),
    count_query: CountQuerySchema.optional(),
    ui_helper: z.string().nullable().optional(),
    field_properties: z.record(z.string(), FieldPropertySchema).nullable().optional(),
}).loose();

// Define /index response schema
export const IndexResponseSchema = z.object({
    errors: z.array(z.string()).nullable().optional(),
    paginate: PaginateSchema,
    filter_form: z.union([z.array(z.string()).length(0), FilterFormSchema]).nullable().optional(),
});

// TypeScript type for the response
export type IndexResponse = z.infer<typeof IndexResponseSchema>;