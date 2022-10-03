import { Options } from "@mikro-orm/core";
import { z } from "zod";
import { createEntityScope } from "./models/createEntityScope";
import { zodModelToMikroOrmEntitySchema } from "./models/zodModelToMikroOrmEntitySchema";

const { defineZodEntity } = createEntityScope();

const NoteModel = defineZodEntity(
    "Note",
    z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
    })
).updateProperty("id", { primary: true });

const AuthorModel = defineZodEntity(
    "Author",
    z.object({
        id: z.number(),
        name: z.string(),
        lastname: z.string(),
    })
).updateProperty("id", { primary: true });

const NoteModelWithRelations = NoteModel.manyToOne("author", AuthorModel);
const AuthorModelWithRelations = AuthorModel.oneToMany("notes", NoteModel);

const NoteEntitySchema = zodModelToMikroOrmEntitySchema(NoteModelWithRelations);
const AuthorEntitySchema = zodModelToMikroOrmEntitySchema(AuthorModelWithRelations);

// pnpm mikro-orm migration:up
const config: Options = {
    type: "sqlite",
    entities: [NoteEntitySchema, AuthorEntitySchema],
    dbName: "mikro-server.db",
    // as we are using class references here, we don't need to specify `entitiesTs` option
    //   entities: [Recipe, Ingredient],
    // entities: ["./dist/entities"],
    // entitiesTs: ["./src/entities"],
    debug: ["info", "discovery"],
};

export default config;
