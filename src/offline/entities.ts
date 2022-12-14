import { z } from "zod";

import { zodModelToMikroOrmEntitySchema } from "@/lib/zodModelToMikroOrmEntitySchema";

import { defineZodEntity } from "../lib/ZodEntity";

const AuthorModel = defineZodEntity(
    "Author",
    z.object({
        id: z.number(),
        name: z.string(),
        lastname: z.string(),
    })
).updateProperty("id", { primary: true });

const NoteModel = defineZodEntity(
    "Note",
    z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
).updateProperty("id", { primary: true });
// TODO kikko middleware ?
// .updateProperty("createdAt", { onCreate: () => new Date() })
// .updateProperty("updatedAt", { onUpdate: () => new Date() });

export const AuthorEntitySchema = zodModelToMikroOrmEntitySchema(AuthorModel.oneToMany("notes", NoteModel));
export const NoteEntitySchema = zodModelToMikroOrmEntitySchema(NoteModel.manyToOne("author", AuthorModel));
