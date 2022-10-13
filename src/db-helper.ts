import type { DatabaseSchema } from "./db-client";
import { SchemaHelper } from "./lib/SchemaHelper";

export const schemaHelper = new SchemaHelper<DatabaseSchema>();
