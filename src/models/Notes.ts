import { z } from "zod";

export const NotesModel = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
});
