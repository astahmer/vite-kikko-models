import type { IDbState } from "@kikko-land/react";
import { runQuery } from "@kikko-land/react";
import { sql as kSql } from "kysely";

import { queryBuilder } from "../db-client";
import { getSql } from "./getSql";

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
export class SchemaHelper<DbSchema> {
    /** @see https://github.com/koskimas/kysely/blob/2e9420f4592a371e982bba8a7269125c621bc47d/src/dialect/sqlite/sqlite-introspector.ts#L79 */
    getTableList(db: IDbState) {
        return runQuery<WithSqliteMaster["sqlite_master"]>(db, getTableListSql());
    }

    /** @see https://github.com/koskimas/kysely/blob/2e9420f4592a371e982bba8a7269125c621bc47d/src/dialect/sqlite/sqlite-introspector.ts#L79 */
    async getTableMetadata(db: IDbState, tableName: keyof DbSchema) {
        // Get the SQL that was used to create the table.
        const createSql = await runQuery<{ sql: string | undefined }>(
            db,
            getSql(
                tableQueryBuilder
                    .selectFrom("sqlite_master")
                    .where("name", "=", tableName as string)
                    .select("sql")
            )
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
        return Promise.all(tableNames.map((row) => this.getTableMetadata(db, row.name as keyof DbSchema)));
    }
}

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
