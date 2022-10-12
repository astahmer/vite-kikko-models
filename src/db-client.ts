import type { Falsy, IDbState, IQueryHookResult, ISingleQueryHookResult } from "@kikko-land/react";
import { runQuery, sql, useQuery, useQueryFirstRow } from "@kikko-land/react";
import type {
    CompiledQuery,
    DeleteQueryBuilder,
    InsertQueryBuilder,
    SelectQueryBuilder,
    UpdateQueryBuilder,
} from "kysely";
import { DummyDriver, Kysely, sql as kSql, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

import type { DB, Generated } from "./db-interface";

type KikkoMigration = {
    id: Generated<number>;
    migrated_at: Generated<number>;
    name: string | null;
};

export type DatabaseSchema = Omit<DB, "mikro_orm_migrations"> & { migrations: KikkoMigration };

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

const replaceSqlParameters = (sql: string, parameters: readonly unknown[] | any[]) => {
    let i = 0;
    return sql.replace(/\?/g, () => {
        const param = parameters[i++];
        return typeof param === "number" ? String(param) : `"${param}"`;
    });
};

const toSqlString = (query: CompiledQuery) => replaceSqlParameters(query.sql, query.parameters);

type AnyQueryBuilder =
    | SelectQueryBuilder<DatabaseSchema, any, any>
    | UpdateQueryBuilder<DatabaseSchema, any, any, any>
    | DeleteQueryBuilder<DatabaseSchema, any, any>
    | InsertQueryBuilder<DatabaseSchema, any, any>;

export const getSql = <Builder extends AnyQueryBuilder>(builder: Builder) => sql.raw(toSqlString(builder.compile()));
export const runDbQuery = <Builder extends AnyQueryBuilder>(state: IDbState, builder: Builder) =>
    runQuery<
        Builder extends SelectQueryBuilder<DatabaseSchema, any, infer Output>
            ? Single<Output>
            : Builder extends UpdateQueryBuilder<DatabaseSchema, any, any, infer Output>
            ? Output
            : Builder extends DeleteQueryBuilder<DatabaseSchema, any, infer Ouput>
            ? Ouput
            : Builder extends InsertQueryBuilder<DatabaseSchema, any, infer Ouput>
            ? Ouput
            : never
    >(state, getSql(builder));

type Single<T> = T extends Array<infer U> ? U : T;

export const useDbQuery = <
    Builder extends Falsy | SelectQueryBuilder<DatabaseSchema, any, any>,
    ShouldTakeFirst extends boolean | undefined = undefined
>(
    builder: Builder | Falsy,
    options?:
        | {
              suppressLog?: boolean;
              mapToObject?: boolean;
              shouldTakeFirst?: ShouldTakeFirst;
          }
        | undefined
): ShouldTakeFirst extends undefined
    ? IQueryHookResult<Builder extends SelectQueryBuilder<DatabaseSchema, any, infer Output> ? Output : Falsy>
    : ISingleQueryHookResult<
          Builder extends SelectQueryBuilder<DatabaseSchema, any, infer Output> ? Output : Falsy
      > => {
    const { shouldTakeFirst, ..._opts } = options ?? {};

    const useQueryFn = shouldTakeFirst ? useQueryFirstRow : useQuery;

    return useQueryFn(builder ? getSql(builder) : 0, _opts) as any;
};

const tableQueryBuilder = queryBuilder.withTables<WithSqliteMaster>();
const getTableListSql = () =>
    getSql(
        tableQueryBuilder
            .selectFrom("sqlite_master")
            .where("type", "=", "table")
            .where("name", "not like", "sqlite_%")
            .selectAll()
            .orderBy("name")
    );

class SchemaHelper {
    /** @see https://github.com/koskimas/kysely/blob/2e9420f4592a371e982bba8a7269125c621bc47d/src/dialect/sqlite/sqlite-introspector.ts#L79 */
    getTableList(db: IDbState) {
        return runQuery<WithSqliteMaster["sqlite_master"]>(db, getTableListSql());
    }

    /** @see https://github.com/koskimas/kysely/blob/2e9420f4592a371e982bba8a7269125c621bc47d/src/dialect/sqlite/sqlite-introspector.ts#L79 */
    async getTableMetadata(db: IDbState, tableName: keyof DatabaseSchema) {
        // Get the SQL that was used to create the table.
        const createSql = await runQuery<{ sql: string | undefined }>(
            db,
            getSql(tableQueryBuilder.selectFrom("sqlite_master").where("name", "=", tableName).select("sql"))
        );

        // // Try to find the name of the column that has `autoincrement` 🤦
        const autoIncrementCol = createSql[0]?.sql
            ?.split(/[(),]/)
            ?.find((it) => it.toLowerCase().includes("autoincrement"))
            ?.split(/\s+/)?.[0]
            ?.replace(/["`]/g, "");

        const columns = await runQuery<PragmaTableInfo>(
            db,
            getSql(
                tableQueryBuilder
                    .selectFrom(kSql<PragmaTableInfo>`pragma_table_info(${tableName})`.as("table_info"))
                    .select(["name", "type", "notnull", "dflt_value"])
                    .orderBy("name")
            )
        );

        return {
            name: tableName,
            columns: columns.map((col) => ({
                name: col.name,
                dataType: col.type,
                isNullable: !col.notnull,
                isAutoIncrementing: col.name === autoIncrementCol,
                hasDefaultValue: col.dflt_value != null,
            })),
        };
    }

    async getTables(db: IDbState) {
        const tableNames = await this.getTableList(db);
        return Promise.all(tableNames.map((row) => this.getTableMetadata(db, row.name as keyof DatabaseSchema)));
    }
}

export const schemaHelper = new SchemaHelper();

type WithSqliteMaster = {
    sqlite_master: {
        type: string;
        name: string;
        tbl_name: string;
        rootpage: string;
        sql: string;
    };
};

type PragmaTableInfo = {
    name: string;
    type: string;
    notnull: 0 | 1;
    dflt_value: any;
};
