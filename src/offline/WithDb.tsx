import {
    DbsHolder,
    EnsureDbLoaded,
    IInitDbClientConfig,
    IMigration,
    migrationsPlugin,
    reactiveQueriesPlugin,
} from "@kikko-land/react";
import { waSqliteWebBackend } from "@kikko-land/wa-sqlite-web-backend";
import sqlWasmUrl from "wa-sqlite/dist/wa-sqlite-async.wasm?url";
import type { WithChildren } from "pastable";

const migrations: IMigration[] = Object.values(
    import.meta.glob("../migrations-kikko/*.ts", { eager: true, import: "default" })
);
console.log({ migrations });

const backend = waSqliteWebBackend({ wasmUrl: sqlWasmUrl });

const config: IInitDbClientConfig = {
    dbName: "quick-example-db",
    dbBackend: backend,
    plugins: [reactiveQueriesPlugin(), migrationsPlugin({ migrations })],
};

export const WithDb = ({ children }: WithChildren) => {
    return (
        <DbsHolder defaultDbConfig={config}>
            <EnsureDbLoaded fallback={<div>Loading db...</div>}>{children}</EnsureDbLoaded>
        </DbsHolder>
    );
};
