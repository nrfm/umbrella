import { iterator } from "./iterator";

export function* dedupe<T>(input: Iterable<T>) {
    let iter = iterator(input),
        v: IteratorResult<T>,
        prev: T;
    while (((v = iter.next()), !v.done)) {
        if (v.value !== prev) {
            prev = v.value;
            yield v.value;
        }
    }
}
