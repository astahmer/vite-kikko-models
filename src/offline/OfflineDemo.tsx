import * as qb from "@kikko-land/query-builder";
import { sql, useQueries } from "@kikko-land/react";

import { List } from "./List";
import { builder } from "./QueryBuilder";
import { WithDb } from "./WithDb";

export const OfflineDemo = () => {
    return (
        <WithDb>
            <DemoContent />
        </WithDb>
    );
};

const DemoContent = () => {
    const notesColumns = useQueries([
        sql.raw("PRAGMA table_info(notes);"),
        qb.select().from("migrations"),
        sql.raw("PRAGMA table_info(migrations);"),
    ]);
    console.log(notesColumns.data);
    console.log(builder);

    return (
        <>
            {/* <Benchmark /> */}
            <List />
            {/* <Notes /> */}
        </>
    );
};
