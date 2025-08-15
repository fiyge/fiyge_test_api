

// Define FieldSchema for paginate.data items
import {z} from "zod";

export const FieldSchema = z.object({
    name: z.string(),
    label: z.string(),
    type: z.string(),
    column: z.string().nullable().optional(),
    ntype: z.string().nullable().optional(),
    length: z.union([z.string(), z.number()]).nullable().optional(),
    rules_grid: z.string().nullable().optional(),
    business_key: z.string().nullable().optional(),
    is_sortable: z.string().nullable().optional(),
    is_searchable: z.string().nullable().optional(),
    is_multi_value: z.string().nullable().optional(),
    is_computed_field: z.string().nullable().optional(),
    collation: z.string().nullable().optional(),
    null: z.string().nullable().optional(),
    key: z.string().nullable().optional(),
    default: z.string().nullable().optional(),
    extra: z.string().nullable().optional(),
    privileges: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
    const: z.number().nullable().optional(),
    is_leaf_node: z.number(),
    id: z.string(),
});

// Define MetadataPaginateSchema
export const MetadataPaginateSchema = z.object({
    data: z.array(FieldSchema),
    paginate_as: z.string(),
    actions: z.array(z.any()),
    lca: z.number(),
    header: z.record(z.string(), z.object({
        name: z.string(),
        fname: z.string(),
        visible: z.boolean(),
        class: z.string(),
        native_type: z.number(),
    })),
    render_as: z.string(),
    foreign_key: z.string(),
    active_level: z.number(),
    lft: z.string(),
    rgt: z.string(),
    primary_key: z.string(),
    display_field: z.string(),
    pfooter: z.boolean(),
    search_advance: z.boolean(),
    row_class: z.string(),
    query: z.object({
        paginate_as: z.string(),
        fields: z.array(z.string()),
        page: z.number(),
        where: z.array(z.any()),
        class: z.string(),
        method: z.string(),
        controller: z.string(),
        fetch_associations: z.array(z.string()),
        model_class: z.string(),
    }),
});

// Define MetadataSchemaResponseSchema
export const MetadataSchemaResponseSchema = z.object({
    paginate: MetadataPaginateSchema,
    errors: z.array(z.string()),
    message: z.array(z.string()),
    q: z.union([z.boolean(), z.null()]),
    query: z.object({
        paginate_as: z.string(),
        fields: z.array(z.string()),
        page: z.number(),
        where: z.array(z.any()),
    }),
});

export type MetadataSchemaResponse = z.infer<typeof MetadataSchemaResponseSchema>;