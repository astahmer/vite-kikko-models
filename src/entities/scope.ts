import { z } from "zod";

import { createEntityScope } from "../models/createEntityScope";

const { defineZodEntity, ctx } = createEntityScope();

export const AuthorModel = defineZodEntity(
    "Author",
    z.object({
        id: z.number(),
        name: z.string(),
        lastname: z.string(),
    })
).updateProperty("id", { primary: true });

export const NoteModel = defineZodEntity(
    "Note",
    z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
    })
).updateProperty("id", { primary: true });
