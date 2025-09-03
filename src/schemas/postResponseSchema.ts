// src/schemas/postResponseSchema.ts

import { z } from 'zod';
import {FormResponseSchema} from "./formSchema.ts";

export const PostResponseSchema = z.object({
    jsonrpc: z.string(),
    id: z.union([z.string(), z.number()]),
    result: FormResponseSchema.omit({
        message: true,
        errors: true,
    }).extend({
        errors: z.union([z.array(z.string()), z.record(z.string(), z.array(z.string()))]),
    })
}).loose();

export type PostResponse = z.infer<typeof PostResponseSchema>;
