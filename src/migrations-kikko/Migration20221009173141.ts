import type { IMigration } from "@kikko-land/react";
import { runQuery, sql } from "@kikko-land/react";

export const Migration20221009173141: IMigration = {
    up: async (db) => {
        const statements = [
            "create table 'author' ('id' integer not null primary key autoincrement, 'name' text not null, 'lastname' text not null);",
            "create table 'note' ('id' integer not null primary key autoincrement, 'title' text not null, 'content' text not null, 'author_id' integer not null, constraint 'note_author_id_foreign' foreign key('author_id') references 'author'('id') on update cascade);",
            "create index 'note_author_id_index' on 'note' ('author_id');",
        ];
        for (const migration of statements) {
            await runQuery(db, sql([migration]));
        }
    },
    id: 20_221_009_173_141,
    name: "TODO-Migration20221009173141",
};

export default Migration20221009173141;
