// import { waSqliteWebBackend } from "@kikko-land/wa-sqlite-web-backend";
import { absurdWebBackend } from "@kikko-land/absurd-web-backend";
import {
    DbsHolder,
    EnsureDbLoaded,
    IInitDbClientConfig,
    IMigration,
    migrationsPlugin,
    reactiveQueriesPlugin,
} from "@kikko-land/react";
// For Vite:
import sqlWasmUrl from "@kikko-land/sql.js/dist/sql-wasm.wasm?url";
import type { WithChildren } from "pastable";

const migrations: IMigration[] = Object.values(
    import.meta.glob("../migrations-kikko/*.ts", { eager: true, import: "default" })
);
console.log({ migrations });

// TODO
// const backend = waSqliteWebBackend({ wasmUrl: sqlWasmUrl });
const backend = absurdWebBackend({ wasmUrl: sqlWasmUrl });
console.log(backend);

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
