import type { IMigration } from "@kikko-land/react";
import { runQuery, sql } from "@kikko-land/react";

const Migration20221012205105: IMigration = {
    up: async (db) => {
        const statements = [
            "alter table 'note' add column 'created_at' datetime not null;",
            "alter table 'note' add column 'updated_at' datetime not null;",
        ];
        for (const migration of statements) {
            await runQuery(db, sql([migration]));
        }
    },
    id: 20_221_012_205_105,
    name: "Migration20221012205105",
};

export default Migration20221012205105;
