import {z} from "zod";

export const DeleteResponseSchema = z.object({
    errors: z.array(z.string()),
    message: z.array(z.string()),
    alias: z.string().optional(),
    model: z.string().optional(),
    notEmptyField: z.union([z.record(z.string(), z.any()), z.array(z.any())]).optional(),
    data: z.union([z.array(z.string()).length(0), z.record(z.string(), z.any())]),
})