import { zodModelToMikroOrmEntitySchema } from "@/models/zodModelToMikroOrmEntitySchema";

import { AuthorModel, NoteModel } from "./scope";

const AuthorModelWithRelations = AuthorModel.oneToMany("notes", NoteModel);
export const AuthorEntitySchema = zodModelToMikroOrmEntitySchema(AuthorModelWithRelations);
