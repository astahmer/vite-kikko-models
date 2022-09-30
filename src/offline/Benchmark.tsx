/* eslint-disable import/no-unused-modules */
import { sql } from "@kikko-land/query-builder";
import {
    makeId,
    runAfterTransactionCommitted,
    runInTransaction,
    runQueries,
    runQuery,
    suppressLog,
    useDbStrict,
    useRunQuery,
} from "@kikko-land/react";
import { useCallback, useState } from "react";

export const Benchmark = () => {
    const [logs, setLogs] = useState<string[]>([]);

    const [runBenchmark, benchmarkState] = useRunQuery(
        (db) => () =>
            suppressLog(db, async (db) =>
                runInTransaction(db, async () => {
                    const time = Date.now();
                    setLogs((l) => [...l, "Start inserting..."]);

                    for (let i = 0; i < 100; i++) {
                        await runQuery(
                            db,
                            sql`INSERT INTO kv (key, value) VALUES ${sql.join(
                                [...Array<number>(10_000)].map(
                                    () => sql`(${makeId()}, ${Math.trunc(Math.random() * 100).toString()})`
                                )
                            )}`
                        );
                    }

                    runAfterTransactionCommitted(db, () => {
                        void (async () => {
                            setLogs((l) => [...l, `Done inserting in ${(Date.now() - time) / 1000}s`]);

                            const summingTime = Date.now();

                            setLogs((l) => [...l, "Summing..."]);
                            await runQuery(db, sql`SELECT SUM(value) FROM kv`);
                            setLogs((l) => [...l, `Done summing in ${(Date.now() - summingTime) / 1000}s`]);
                        })();
                    });
                })
            )
    );

    const db = useDbStrict();
    const clearAndRun = useCallback(async () => {
        setLogs((l) => [...l, "Clearing data first..."]);
        await runQuery(db, sql`DELETE FROM kv;`);
        setLogs((l) => [...l, "Clearing done!"]);

        setLogs((l) => [...l, "Reading pragma..."]);
        const pragma = JSON.stringify(
            await runQueries(db, [
                sql`SELECT * FROM pragma_cache_size`,
                sql`SELECT * FROM pragma_journal_mode`,
                sql`SELECT * FROM pragma_page_size`,
            ]),
            null,
            2
        );
        setLogs((l) => [...l, pragma, "Reading pragma done!"]);

        await runBenchmark();
    }, [db, runBenchmark]);

    return (
        <>
            <button onClick={() => void clearAndRun()} disabled={benchmarkState.type === "running"}>
                {benchmarkState.type === "running" ? "Running..." : "Run benchmark"}
            </button>

            <div>
                <pre>{logs.join("\n")}</pre>
            </div>
        </>
    );
};
