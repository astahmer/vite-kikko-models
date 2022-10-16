import type { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";
import { AwaitFn } from "pastable";
import { SchemaHelper } from "./SchemaHelper";

export type AnyQueryBuilder<DB = any> =
    | SelectQueryBuilder<DB, any, any>
    | UpdateQueryBuilder<DB, any, any, any>
    | DeleteQueryBuilder<DB, any, any>
    | InsertQueryBuilder<DB, any, any>;

export type SchemaTableMetadata<DbSchema> = AwaitFn<SchemaHelper<DbSchema>["getTableMetadata"]>;
