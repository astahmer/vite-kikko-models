import type { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";

export type AnyQueryBuilder<DB = any> =
    | SelectQueryBuilder<DB, any, any>
    | UpdateQueryBuilder<DB, any, any, any>
    | DeleteQueryBuilder<DB, any, any>
    | InsertQueryBuilder<DB, any, any>;
