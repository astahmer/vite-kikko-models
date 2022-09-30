import type { IMigration } from "@kikko-land/react";
import { runQueries, sql } from "@kikko-land/react";

export const addCreateUpdatedAtToNotes: IMigration = {
    up: async (db) => {
        await runQueries(db, [
            sql`ALTER TABLE notes ADD COLUMN createdAt INTEGER;`,
            sql`ALTER TABLE notes ADD COLUMN updatedAt INTEGER;`,
        ]);
    },
    id: 3,
    name: "addCreateUpdatedAtToNotes",
};
