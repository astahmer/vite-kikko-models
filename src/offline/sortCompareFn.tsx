/* eslint-disable sonarjs/cognitive-complexity */
import { compareBasic, makeGetter, ObjectLiteral, SortDirection } from "pastable";

/** Compare (to sort) 2 objects by a common prop key (or dot-delimited path) in given direction (asc|desc, defaults to asc) */
export function sortCompareFn<T extends ObjectLiteral, K extends keyof T | (string & {})>(
    left: T,
    right: T,
    key: K,
    dir: SortDirection = "asc"
) {
    let aProp;
    let bProp;
    const getter = makeGetter(key as string);

    aProp = getter(left) || "";
    aProp = aProp.toLowerCase ? aProp.toLowerCase() : aProp;
    bProp = getter(right) || "";
    bProp = bProp.toLowerCase ? bProp.toLowerCase() : bProp;

    if (!aProp && !bProp) return 0;
    if (!aProp) return -1;
    if (!bProp) return 1;

    if (typeof aProp === "string" && typeof bProp === "string") {
        return dir === "asc" ? aProp.localeCompare(bProp) : bProp.localeCompare(aProp);
    }

    if (aProp instanceof Date && bProp instanceof Date) {
        return dir === "asc"
            ? compareBasic(aProp.getTime(), bProp.getTime())
            : compareBasic(bProp.getTime(), aProp.getTime());
    }

    if (aProp === bProp) {
        return 0;
    }

    if (aProp < bProp) {
        return dir === "asc" ? -1 : 1;
    }

    return dir === "asc" ? 1 : -1;
}
