import { Predicate } from "@thi.ng/api/api";

import { ensureIterator } from "./ensure";

export function* dropWhile<T>(pred: Predicate<T>, input: Iterable<T>) {
    let iter = ensureIterator(input),
        v: IteratorResult<T>;
    while (((v = iter.next()), !v.done && pred(v.value) === true)) { }
    if (v.value !== undefined) {
        yield v.value;
        yield* iter;
    }
}
