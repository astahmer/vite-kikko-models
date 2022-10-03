import { absurdWebBackend } from "@kikko-land/absurd-web-backend";
import type { IInitDbClientConfig } from "@kikko-land/react";
import { DbProvider, EnsureDbLoaded, migrationsPlugin, reactiveQueriesPlugin } from "@kikko-land/react";
// For Vite:
import sqlWasmUrl from "@kikko-land/sql.js/dist/sql-wasm.wasm?url";
import type { WithChildren } from "pastable";

import { createMikroOrmMigration } from "@/migrations/createMikroOrmMigration";

import { addCreateUpdatedAtToNotes } from "../migrations/addCreateUpdatedAtToNotes";
import { createKVMigration } from "../migrations/createKVMigration";
import { createNotesTable } from "../migrations/createNotesTable";

const config: IInitDbClientConfig = {
    dbName: "quick-example-db",
    dbBackend: absurdWebBackend({
        wasmUrl: sqlWasmUrl,
    }),
    plugins: [
        reactiveQueriesPlugin(),
        migrationsPlugin({
            migrations: [createNotesTable, createKVMigration, addCreateUpdatedAtToNotes, createMikroOrmMigration],
        }),
    ],
};

export const WithDb = ({ children }: WithChildren) => {
    return (
        <DbProvider config={config}>
            <EnsureDbLoaded fallback={<div>Loading db...</div>}>{children}</EnsureDbLoaded>
        </DbProvider>
    );
};
