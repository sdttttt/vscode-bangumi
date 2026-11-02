/**
 * 数据来源的可用性，以及两个来源都不可用时的恢复探测。
 *
 * 视图、提醒与请求层共享同一份判定：请求层负责如实上报每次请求的结果，
 * 视图据此决定是否展示「暂时不可用」，提醒据此停掉定时器与状态栏。
 * 判定只在内存里，从不写回设置项。
 *
 * @author sdttttt
 */

/**
 * 恢复探测的间隔。
 *
 * 前三次递减，之后固定为最后一档：断网通常很快恢复，而长时间的故障不值得
 * 每半分钟打扰一次接口。视图与提醒共用这份节奏，不再各写一套。
 *
 * @author sdttttt
 */
export const RETRY_DELAYS_MS: ReadonlyArray<number> = [
    30_000, 120_000, 600_000,
];

/**
 * 需要判定可用性的数据来源。
 *
 * 两个来源各自独立：只要还有一边能连通，扩展就照常工作，只是数据由另一边提供。
 *
 * @author sdttttt
 */
export type SourceName = "bangumi" | "bilibili";

/**
 * 一次探测得到的健康状态。
 *
 * @author sdttttt
 */
export interface SourceHealth {
    readonly bangumi: boolean;
    readonly bilibili: boolean;
}

/**
 * 会随时间变化的来源健康状态。
 *
 * @author sdttttt
 */
export interface Availability {
    /** 两个来源是否同时不可用。 */
    isDown(): boolean;
    /** 上报一次请求的结果。 */
    report(source: SourceName, ok: boolean): void;
    /**
     * 订阅「是否停摆」的变化，返回退订函数。
     *
     * 只在状态翻转时回调，重复上报同一结果不会触发。
     */
    onDidChange(listener: (down: boolean) => void): () => void;
    /** 停止探测并清空订阅者。 */
    dispose(): void;
}

/**
 * 创建可用性判定与恢复探测所需的依赖。
 *
 * @author sdttttt
 */
export interface AvailabilityOptions {
    /** 同时探测两个周番接口，返回它们此刻是否可用。 */
    readonly probe: () => Promise<SourceHealth>;
    /**
     * 从停摆中恢复后调用。
     *
     * 由组合根接到提醒的刷新上：停摆期间提醒已经清空日程，恢复后必须重新拉取。
     */
    readonly onRecovered?: () => void;
}

/**
 * 把两个「能取到数据吗」的检查组合成一次探测。
 *
 * 放在这里而不是组合根，是因为它不依赖 `Sources` 的类型；调用方只需给出两个
 * 返回 `undefined` 表示失败的函数。
 *
 * @param check 两个来源各自的检查
 * @author sdttttt
 */
export function probeOf(check: {
    readonly bangumi: () => Promise<unknown>;
    readonly bilibili: () => Promise<unknown>;
}): () => Promise<SourceHealth> {
    /**
     * 跑一次检查，异常与空结果都算失败。
     */
    const okOf = async (run: () => Promise<unknown>): Promise<boolean> => {
        try {
            return undefined !== (await run());
        } catch {
            return false;
        }
    };

    return async () => ({
        bangumi: await okOf(check.bangumi),
        bilibili: await okOf(check.bilibili),
    });
}

/**
 * 创建可用性判定。
 *
 * 两个来源初始都是「未知」，未知不算不可用：扩展刚启动时还没有发出任何请求，
 * 此时就判定停摆会让首屏闪一下「暂时不可用」。
 *
 * 只有两边都被明确上报为失败才进入停摆，此时启一个定时器，按
 * {@link RETRY_DELAYS_MS} 的节奏探测，任一边恢复就退出停摆并通知订阅者。
 *
 * @param options 探测方式与恢复回调
 * @author sdttttt
 */
export function useAvailability(options: AvailabilityOptions): Availability {
    const probe = options.probe;
    const onRecovered = options.onRecovered;

    /* `undefined` 表示尚未有过请求结果。 */
    const health: {
        bangumi: boolean | undefined;
        bilibili: boolean | undefined;
    } = { bangumi: undefined, bilibili: undefined };

    const listeners = new Set<(down: boolean) => void>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    let wasDown = false;
    let disposed = false;

    const isDown = (): boolean =>
        false === health.bangumi && false === health.bilibili;

    const cancelProbe = (): void => {
        if (undefined !== timer) {
            clearTimeout(timer);
            timer = undefined;
        }
    };

    const notify = (down: boolean): void => {
        for (const listener of listeners) {
            listener(down);
        }
    };

    /**
     * 按当前的重试次数装载下一次探测。
     */
    const scheduleProbe = (): void => {
        const delay =
            RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
        attempt += 1;

        timer = setTimeout(() => {
            timer = undefined;
            void runProbe();
        }, delay);
    };

    /**
     * 退出停摆并通知一次。
     */
    const recover = (): void => {
        cancelProbe();
        attempt = 0;
        wasDown = false;
        notify(false);

        if (onRecovered) {
            onRecovered();
        }
    };

    /**
     * 依据当前健康状态同步定时器与订阅者。
     */
    const sync = (): void => {
        const down = isDown();

        if (down) {
            /* 每次上报都可能重复进入这里，只有没有定时器时才装载。 */
            if (undefined === timer) {
                scheduleProbe();
            }
            if (!wasDown) {
                wasDown = true;
                notify(true);
            }
            return;
        }

        if (wasDown) {
            recover();
            return;
        }

        cancelProbe();
        attempt = 0;
    };

    const runProbe = async (): Promise<void> => {
        if (disposed) {
            return;
        }

        try {
            const result = await probe();
            health.bangumi = result.bangumi;
            health.bilibili = result.bilibili;
        } catch {
            /*
             * 探测本身失败时保持不可用：继续按节奏重试，而不是把它当成恢复。
             */
            if (disposed) {
                return;
            }
            scheduleProbe();
            return;
        }

        if (disposed) {
            return;
        }

        sync();
    };

    return {
        isDown,

        report: (source, ok) => {
            if (disposed) {
                return;
            }

            health[source] = ok;
            sync();
        },

        onDidChange: listener => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },

        dispose: () => {
            disposed = true;
            cancelProbe();
            listeners.clear();
        },
    };
}
