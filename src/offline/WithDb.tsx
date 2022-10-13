import { absurdWebBackend } from "@kikko-land/absurd-web-backend";
import type { IInitDbClientConfig, IMigration } from "@kikko-land/react";
import { DbProvider, EnsureDbLoaded, migrationsPlugin, reactiveQueriesPlugin } from "@kikko-land/react";
// For Vite:
import sqlWasmUrl from "@kikko-land/sql.js/dist/sql-wasm.wasm?url";
import type { WithChildren } from "pastable";

const migrations: IMigration[] = Object.values(
    import.meta.glob("../migrations-kikko/*.ts", { eager: true, import: "default" })
);
console.log({ migrations });

const backend = absurdWebBackend({ wasmUrl: sqlWasmUrl });
const config: IInitDbClientConfig = {
    dbName: "quick-example-db",
    dbBackend: backend,
    plugins: [reactiveQueriesPlugin(), migrationsPlugin({ migrations })],
};

export const WithDb = ({ children }: WithChildren) => {
    return (
        <DbProvider config={config}>
            <EnsureDbLoaded fallback={<div>Loading db...</div>}>{children}</EnsureDbLoaded>
        </DbProvider>
    );
};
