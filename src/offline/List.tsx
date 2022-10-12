import { runQuery, useRunQuery } from "@kikko-land/react";
import { Box, Button, Input, Table } from "@mantine/core";
import humanId from "human-id";
import type { Selectable } from "kysely";
import { chunk } from "pastable";
import { useState } from "react";
import Highlighter from "react-highlight-words";

import type { DatabaseSchema } from "@/db-client";
import { getSql, queryBuilder, runDbQuery, useDbQuery } from "@/db-client";

import { usePaginator } from "./usePaginator";

// const backendOptions = {
//     absurd: { type: "absurd" },
//     waMinimal: {
//         type: "wa-sqlite",
//         vfs: "minimal",
//     },
// } as const;

const Row = ({ row, textToSearch }: { row: Selectable<DatabaseSchema["note"]>; textToSearch: string }) => {
    const [deleteRecord, deleteRecordState] = useRunQuery((db) => async () => {
        await runQuery(db, getSql(queryBuilder.deleteFrom("note").where("id", "=", row.id)));
    });

    // TODO useRunQuery type-safety
    const [updateRecord, updateRecordState] = useRunQuery((db) => async () => {
        const oui = await runDbQuery(
            db,
            queryBuilder
                .updateTable("note")
                .set({
                    title: row.title + " updated!",
                    content: row.content + " updated!",
                })
                .where("id", "=", row.id)
        );
        console.log(oui);
        return oui;
    });

    return (
        <tr key={row.id}>
            <td>{row.title}</td>
            <td>
                <Highlighter searchWords={[textToSearch]} autoEscape={true} textToHighlight={row.content} />
            </td>
            <td>{new Date(row.created_at).toLocaleString()}</td>
            <td>{new Date(row.updated_at).toLocaleString()}</td>
            <td>
                <Button.Group orientation="vertical">
                    <Button
                        variant="light"
                        onClick={() => void deleteRecord()}
                        disabled={deleteRecordState.type !== "idle"}
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => void updateRecord()}
                        disabled={
                            updateRecordState.type !== "running" &&
                            updateRecordState.type !== "idle" &&
                            updateRecordState.type !== "done"
                        }
                    >
                        Update {updateRecordState.type}
                    </Button>
                </Button.Group>
            </td>
        </tr>
    );
};

export const List = () => {
    const [textToSearch, setTextToSearch] = useState<string>("");

    const query = queryBuilder
        .selectFrom("note")
        .selectAll()
        .if(Boolean(textToSearch), (q) => q.where("content", "like", `%${textToSearch}%`));

    const {
        paginatedQuery,
        totalPages,
        currentPage,
        totalCount,
        isNextPageAvailable,
        isPrevPageAvailable,
        nextPage,
        prevPage,
    } = usePaginator({
        perPage: 10,
        baseQuery: query,
    });
    const rowsResult = useDbQuery(paginatedQuery);

    const [createNotes, createNotesState] = useRunQuery((db) => async (count: number) => {
        for (const group of chunk(Array.from(Array(count).keys()), 3000)) {
            await runDbQuery(
                db,
                queryBuilder.insertInto("note").values(
                    group.map((i) => ({
                        title: humanId({ separator: "-", capitalize: false }),
                        content: humanId({ adjectiveCount: 10, separator: "-", capitalize: false }),
                        author_id: 1,
                        created_at: Date.now().toString(),
                        updated_at: Date.now().toString(),
                    }))
                )
            );
        }
    });

    const [deleteAll, deleteAllState] = useRunQuery((db) => async () => {
        await runDbQuery(db, queryBuilder.deleteFrom("note"));
    });

    // const [backendName, setBackendName] = useState("waMinimal");

    return (
        <>
            {/* <select
                value={backendName}
                onChange={(e) => {
                    // eslint-disable-next-line no-restricted-globals
                    history.pushState(
                        {},
                        "",
                        // eslint-disable-next-line no-restricted-globals
                        location.pathname + "?backend=" + e.target.value
                    );
                }}
            >
                {Object.entries(backendOptions).map(([name, val]) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>

            <br />
            <br /> */}

            <Button.Group>
                {[100, 1000, 10_000, 100_000].map((count) => (
                    <Button
                        key={count}
                        onClick={() => void createNotes(count)}
                        disabled={createNotesState.type === "running" || createNotesState.type === "waitingDb"}
                    >
                        {createNotesState.type === "running" ? "Loading..." : `Add  ${nbFormat.format(count)} records!`}
                    </Button>
                ))}
                <Button
                    onClick={() => void deleteAll()}
                    disabled={deleteAllState.type === "running" || deleteAllState.type === "waitingDb"}
                >
                    {deleteAllState.type === "running" ? "Loading..." : "Delete all records!"}
                </Button>
            </Button.Group>

            <Box mt="xl" />

            <Input
                value={textToSearch}
                onChange={(e) => {
                    setTextToSearch(e.target.value);
                }}
                placeholder="Search content"
            />

            <Box mt="xl" />

            <div>Total found records: {totalCount !== undefined ? totalCount : "Loading..."}</div>

            <Box mt="xl" />

            <Table>
                <thead>
                    <tr>
                        <td>Title</td>
                        <td>Content</td>
                        <td>Created At</td>
                        <td>Updated At</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {rowsResult.type === "loaded" &&
                        rowsResult.data.map((r) => <Row row={r} textToSearch={textToSearch} key={r.id} />)}
                </tbody>
            </Table>

            <Box mt="xl" />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Box mr="auto">
                    Page: {currentPage}
                    {totalPages !== undefined && ` of ${totalPages}`}
                </Box>
                <Button.Group>
                    <Button disabled={!isPrevPageAvailable} onClick={prevPage}>
                        Prev page
                    </Button>
                    <Button disabled={!isNextPageAvailable} onClick={nextPage}>
                        Next page
                    </Button>
                </Button.Group>
            </Box>
        </>
    );
};

const nbFormat = new Intl.NumberFormat("en-US");
