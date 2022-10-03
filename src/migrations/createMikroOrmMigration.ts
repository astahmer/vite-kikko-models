import type { IMigration } from "@kikko-land/react";
import { runQuery, sql } from "@kikko-land/react";

export const createMikroOrmMigration: IMigration = {
    up: async (db) => {
        const migrations = [
            "create table `author` (`id` integer not null primary key autoincrement, `name` text not null, `lastname` text not null);",
            "create table `post` (`id` integer not null primary key autoincrement, `title` text not null, `content` text not null, `author_id` integer not null, constraint `post_author_id_foreign` foreign key(`author_id`) references `author`(`id`) on update cascade);",
            "create index `post_author_id_index` on `post` (`author_id`);",
        ];
        for (const migration of migrations) {
            await runQuery(db, sql([migration]));
        }
    },
    id: 4,
    name: "createMikroOrmMigration",
};
