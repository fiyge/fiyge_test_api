import {z} from "zod";

export const DeleteResponseSchema = z.object({
    errors: z.array(z.string()),
    message: z.array(z.string()),
    alias: z.string(),
    model: z.string(),
    notEmptyField: z.record(z.string(), z.any()),
    data: z.union([z.array(z.string()).length(0), z.record(z.string(), z.any())]),
})