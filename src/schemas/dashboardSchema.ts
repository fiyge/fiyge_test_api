

// Define DashboardResponseSchema based on the response structure
import {z} from "zod";

export const DashboardItemSchema = z.object({
    name: z.string(),
    controller: z.string(),
    id: z.string(),
    module_label: z.string(),
    fields: z.array(z.record(z.string(), z.object({
        field_type: z.string(),
        alias: z.string().nullable().optional(),
        sortable: z.string(),
        searchable: z.string(),
        is_invisible: z.string(),
        clickable_link: z.string(),
        compute_column_total: z.string().optional(),
        aggregator: z.string().optional(),
        __column: z.string().optional(),
        render_type: z.string().optional(),
    }))),
    where: z.array(z.array(z.object({
        op: z.string(),
        value: z.record(z.string(), z.string()),
    }))).optional(),
    group: z.array(z.string()).optional(),
    order: z.array(z.string()).optional(),
    category_id: z.string(),
    category_id_model: z.string(),
    __category_id: z.string(),
    render_as: z.string(),
    fields_grid: z.string().nullable().optional(),
    conditions_grid: z.string().nullable().optional(),
    group_by_grid: z.string().nullable().optional(),
    sort_grid: z.string().nullable().optional(),
    is_default: z.string(),
    show_has_many_records: z.string().nullable().optional(),
    collapse_category_columns: z.string().nullable().optional(),
    ui_helper: z.string(),
    disable_ui_helper: z.string(),
    parent_id_model: z.string(),
    hide_row_actions: z.string(),
    do_not_inherit: z.string(),
    sequence: z.string(),
    actions_grid: z.string().nullable().optional(),
    is_public: z.string(),
    method: z.string(),
    description: z.string().optional(),
});

export const DashboardPaginateSchema = z.object({
    data: z.array(DashboardItemSchema),
});

export const DashboardResponseSchema = z.object({
    paginate: DashboardPaginateSchema,
    errors: z.array(z.string()),
    message: z.array(z.string()),
    inherit_views: z.number(),
    alias: z.string(),
    singular: z.string(),
    model: z.string(),
    controllerClass: z.string(),
    modelClass: z.string(),
    notEmptyField: z.array(z.any()),
    organization_name: z.null(),
    organization_id: z.string(),
    user_id: z.string(),
    user_fullname: z.string(),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;