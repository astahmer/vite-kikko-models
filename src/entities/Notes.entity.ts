import { zodModelToMikroOrmEntitySchema } from "@/models/zodModelToMikroOrmEntitySchema";

import { AuthorModel, NoteModel } from "./scope";

const NoteModelWithRelations = NoteModel.manyToOne("author", AuthorModel);

export const NoteEntitySchema = zodModelToMikroOrmEntitySchema(NoteModelWithRelations);
