import { Predicate } from "@thi.ng/api/api";
import { ISubscribable, State } from "../api";
import { Stream } from "../stream";
import { Subscription } from "../index";

export class SidechainPartition<A, B> extends Subscription<A, A[]> {

    sideSub: Subscription<B, B>;
    buf: A[];

    constructor(side: ISubscribable<B>, pred?: Predicate<B>, id?: string) {
        super(null, null, null, id || `sidepart-${Stream.NEXT_ID++}`);
        this.buf = [];
        const $this = this;
        pred = pred || (() => true);
        this.sideSub = side.subscribe({
            next(x) {
                if ($this.buf.length && pred(x)) {
                    $this.dispatch($this.buf);
                    $this.buf = [];
                }
            },
            done() {
                if ($this.buf.length) {
                    $this.dispatch($this.buf);
                }
                $this.done();
                delete $this.buf;
            }
        });
    }

    next(x: A) {
        if (this.state < State.DONE) {
            this.buf.push(x);
        } else {
            throw new Error(`called next() in ${State[this.state]} state`);
        }
    }

    done() {
        this.sideSub.unsubscribe();
        super.done();
    }
}

/**
 * Buffers values from `src` until side chain fires, then emits buffer
 * (unless empty) and repeats process until either input is done.
 * By default, the value read from the side chain is ignored, however
 * the optional predicate can be used to only trigger for specific
 * values / conditions.
 *
 * ```
 * // merge various event streams
 * events = merge([
 *     fromEvent(document,"mousemove"),
 *     fromEvent(document,"mousedown"),
 *     fromEvent(document,"mouseup")
 * ]);
 *
 * // queue event processing to only execute during the
 * // requestAnimationFrame cycle (RAF)
 * events.subscribe(sidechainPartition(fromRAF())).subscribe(trace())
 * ```
 *
 * @param side
 * @param pred
 * @param id
 */
export function sidechainPartition<A, B>(side: ISubscribable<B>, pred?: Predicate<B>, id?: string): Subscription<A, A[]> {
    return new SidechainPartition<A, B>(side, pred, id);
}
