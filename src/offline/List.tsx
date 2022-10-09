import { deleteFrom, insert, like$, select, update } from "@kikko-land/query-builder";
import { makeId, runQuery, sql, useCacheQuery, useQuery, useRunQuery } from "@kikko-land/react";
import { Box, Button, Input, Table } from "@mantine/core";
import humanId from "human-id";
import { chunk } from "pastable";
import { useState } from "react";
import Highlighter from "react-highlight-words";

import { usePaginator } from "./usePaginator";

// const backendOptions = {
//     absurd: { type: "absurd" },
//     waMinimal: {
//         type: "wa-sqlite",
//         vfs: "minimal",
//     },
// } as const;

type INoteRow = {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
};
const notesTable = sql.table("note");

const Row = ({ row, textToSearch }: { row: INoteRow; textToSearch: string }) => {
    const [deleteRecord, deleteRecordState] = useRunQuery((db) => async () => {
        await runQuery(db, deleteFrom(notesTable.name).where({ id: row.id }));
    });

    const [updateRecord, updateRecordState] = useRunQuery((db) => async () => {
        await runQuery(
            db,
            update(notesTable.name)
                .set({
                    title: row.title + " updated!",
                    content: row.content + " updated!",
                })
                .where({ id: row.id })
        );
    });

    return (
        <tr key={row.id}>
            <td>{row.title}</td>
            <td>
                <Highlighter searchWords={[textToSearch]} autoEscape={true} textToHighlight={row.content} />
            </td>
            <td>{new Date(row.createdAt).toLocaleString()}</td>
            <td>{new Date(row.updatedAt).toLocaleString()}</td>
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

    // const notes = useQuery<Note>(select().from("notes"));
    // const notesCount = useQueryFirstRow<{ count: number }>(select({ count: sql`COUNT(*)` }).from("notes"));
    // console.log({ notes, notesCount });

    // const notes = useQuery<Note>(select().from(notesTable.name));
    // console.log("notes", notes);

    const baseSql = useCacheQuery(
        select()
            .from(notesTable.name)
            .where(textToSearch ? { content: like$("%" + textToSearch + "%") } : sql.empty)
    );

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
        baseQuery: baseSql,
    });
    const rowsResult = useQuery<INoteRow>(paginatedQuery);

    const [createNotes, createNotesState] = useRunQuery((db) => async (count: number) => {
        for (const ch of chunk(Array.from(Array(count).keys()), 3000)) {
            await runQuery(
                db,
                insert(
                    ch.map((i) => ({
                        id: makeId(),
                        title: humanId({ separator: "-", capitalize: false }),
                        content: humanId({ adjectiveCount: 10, separator: "-", capitalize: false }),
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    }))
                ).into(notesTable.name)
            );
        }
    });

    const [deleteAll, deleteAllState] = useRunQuery((db) => async () => {
        await runQuery(db, deleteFrom(notesTable.name));
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
