import { absurdWebBackend } from "@kikko-land/absurd-web-backend";
import type { IInitDbClientConfig, IMigration } from "@kikko-land/react";
import {
    DbProvider,
    EnsureDbLoaded,
    migrationsPlugin,
    reactiveQueriesPlugin,
    runQueries,
    runQuery,
    sql,
} from "@kikko-land/react";
// For Vite:
import sqlWasmUrl from "@kikko-land/sql.js/dist/sql-wasm.wasm?url";
import type { WithChildren } from "pastable";

const createNotesTable: IMigration = {
    up: async (db) => {
        await runQuery(
            db,
            sql`
              CREATE TABLE IF NOT EXISTS notes (
                id varchar(20) PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL
              );
            `
        );

        await runQuery(
            db,
            sql`
              CREATE INDEX IF NOT EXISTS idx_note_title ON notes(title);
            `
        );
    },
    id: 1,
    name: "createNotesTable",
};

const createKVMigration: IMigration = {
    up: async (db) => {
        await runQuery(
            db,
            sql`
              CREATE TABLE kv (key TEXT, value TEXT);
            `
        );
    },
    id: 2,
    name: "createKV",
};

const addCreateUpdatedAtToNotes: IMigration = {
    up: async (db) => {
        await runQueries(db, [
            sql`ALTER TABLE notes ADD COLUMN createdAt INTEGER;`,
            sql`ALTER TABLE notes ADD COLUMN updatedAt INTEGER;`,
        ]);
    },
    id: 3,
    name: "addCreateUpdatedAtToNotes",
};

const config: IInitDbClientConfig = {
    dbName: "quick-example-db",
    dbBackend: absurdWebBackend({
        wasmUrl: sqlWasmUrl,
    }),
    plugins: [
        reactiveQueriesPlugin(),
        migrationsPlugin({ migrations: [createNotesTable, createKVMigration, addCreateUpdatedAtToNotes] }),
    ],
};

export const WithDb = ({ children }: WithChildren) => {
    return (
        <DbProvider config={config}>
            <EnsureDbLoaded fallback={<div>Loading db...</div>}>{children}</EnsureDbLoaded>
        </DbProvider>
    );
};
