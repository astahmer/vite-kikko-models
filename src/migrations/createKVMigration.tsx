import type { IMigration } from "@kikko-land/react";
import { runQuery, sql } from "@kikko-land/react";

export const createKVMigration: IMigration = {
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
