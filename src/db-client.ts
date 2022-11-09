import type { Falsy, IDb, IRunQueryHookResult } from "@kikko-land/react";
import {
    useDbQuery as useKikkoQuery,
    useFirstRowDbQuery as useKikkoQueryFirstRow,
    useRunDbQuery as useKikkoRunDbQuery,
} from "@kikko-land/react";
import type { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "kysely";
import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

import type { DB, Generated } from "./db-interface";
import { getSql } from "./lib/getSql";
import type { AnyQueryBuilder, SchemaTableMetadata } from "./lib/types";

type KikkoMigration = {
    id: Generated<number>;
    migrated_at: Generated<number>;
    name: string | null;
};

export type DatabaseSchema = Omit<DB, "mikro_orm_migrations"> & { migrations: KikkoMigration };
export type DatabaseTableName = keyof DatabaseSchema;
export type DatabaseTable = SchemaTableMetadata<DatabaseSchema>;

export const queryBuilder = new Kysely<DatabaseSchema>({
    dialect: {
        createAdapter() {
            return new SqliteAdapter();
        },
        createDriver() {
            return new DummyDriver();
        },
        createIntrospector(db: Kysely<unknown>) {
            return new SqliteIntrospector(db);
        },
        createQueryCompiler() {
            return new SqliteQueryCompiler();
        },
    },
});

type QueryBuilderResult<Builder extends AnyQueryBuilder> = Builder extends SelectQueryBuilder<any, any, infer Output>
    ? Single<Output>
    : Builder extends UpdateQueryBuilder<any, any, any, infer Output>
    ? Output
    : Builder extends DeleteQueryBuilder<any, any, infer Ouput>
    ? Ouput
    : Builder extends InsertQueryBuilder<any, any, infer Ouput>
    ? Ouput
    : never;

type Single<T> = T extends Array<infer U> ? U : T;
export const runDbQuery = <Builder extends AnyQueryBuilder>(state: IDb, builder: Builder) =>
    state.runQuery<QueryBuilderResult<Builder>>(getSql(builder));

export const useDbQuery = <Builder extends Falsy | SelectQueryBuilder<any, any, any>>(
    builder: Builder | Falsy,
    _opts?: UseDbQueryOptions
) => {
    return useKikkoQuery<Builder extends SelectQueryBuilder<any, any, infer Output> ? Output : Falsy>(
        builder ? getSql(builder) : 0,
        _opts
    );
};

export const useDbQueryFirstRow = <Builder extends Falsy | SelectQueryBuilder<any, any, any>>(
    builder: Builder | Falsy,
    _opts?: UseDbQueryOptions
) => {
    return useKikkoQueryFirstRow<Builder extends SelectQueryBuilder<any, any, infer Output> ? Output : Falsy>(
        builder ? getSql(builder) : 0,
        _opts
    );
};

export function useRunDbQuery<Return, Args extends any[]>(
    cb: (db: IDb) => (...args: Args) => Promise<Return>,
    _opts?: UseDbQueryOptions
): readonly [(...args: Args) => Promise<Return>, IRunQueryHookResult<Return>] {
    return useKikkoRunDbQuery<any, any>((db) => cb(db) as any, _opts) as any;
}

type UseDbQueryOptions = {
    suppressLog?: boolean;
    mapToObject?: boolean;
};
