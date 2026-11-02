import { vi } from "vitest";
import type { Availability, SourceHealth, SourceName } from "@/availability";
import type { Commands, CommandId } from "@/commands";
import type { Notifier } from "@/notifier";

/**
 * Notifier 替身，记录扩展本应展示的内容。
 *
 * @author sdttttt
 */
export interface NotifierStub {
    readonly info: ReturnType<typeof vi.fn<(message: string) => void>>;
    readonly error: ReturnType<typeof vi.fn<(message: string) => void>>;
    readonly ask: ReturnType<typeof vi.fn<Notifier["ask"]>>;
    readonly pick: ReturnType<typeof vi.fn<Notifier["pick"]>>;
    readonly actions: ReturnType<typeof vi.fn<Notifier["actions"]>>;
    /** 该替身作为 `Notifier` 使用。 */
    readonly notifier: Notifier;
}

/**
 * 创建 Notifier 替身。除非用例自行设定返回值，`pick` 与 `actions` 都返回 `undefined`，
 * 与用户取消选择的场景一致。
 *
 * @author sdttttt
 */
export function createNotifierStub(): NotifierStub {
    const info = vi.fn<(message: string) => void>();
    const error = vi.fn<(message: string) => void>();
    const ask = vi.fn<Notifier["ask"]>(() => Promise.resolve(undefined));
    const pick = vi.fn<Notifier["pick"]>(() => Promise.resolve(undefined));
    const actions = vi.fn<Notifier["actions"]>(() =>
        Promise.resolve(undefined)
    );

    return {
        info,
        error,
        ask,
        pick,
        actions,
        notifier: { info, error, ask, pick, actions },
    };
}

/**
 * Commands 替身，记录每一个被执行的命令 id。
 *
 * @author sdttttt
 */
export interface CommandsStub {
    readonly execute: ReturnType<typeof vi.fn<(id: CommandId) => void>>;
    /** 该替身作为 `Commands` 使用。 */
    readonly commands: Commands;
}

/**
 * 创建 Commands 替身。
 *
 * @author sdttttt
 */
export function createCommandsStub(): CommandsStub {
    const execute = vi.fn<(id: CommandId) => void>();

    return { execute, commands: { execute } };
}

/**
 * Availability 替身，记录每一次上报，并允许用例直接改写停摆状态。
 *
 * @author sdttttt
 */
export interface AvailabilityStub {
    /** 已收到的上报，按发生顺序。 */
    readonly reports: Array<{ source: SourceName; ok: boolean }>;
    readonly report: ReturnType<typeof vi.fn<Availability["report"]>>;
    readonly isDown: ReturnType<typeof vi.fn<Availability["isDown"]>>;
    /** 该替身作为 `Availability` 使用。 */
    readonly availability: Availability;
    /** 让停摆状态翻转，并同步通知订阅者。 */
    setDown(down: boolean): void;
}

/**
 * 创建 Availability 替身。
 *
 * 缺省的实现把 {@link SourceHealth} 的同名规则照搬一遍：两个来源都失败才算停摆，
 * 因此直接调用 `report` 的用例看到的行为与真实实现一致。
 *
 * @param down 初始是否处于停摆状态
 * @author sdttttt
 */
export function createAvailabilityStub(down = false): AvailabilityStub {
    const reports: Array<{ source: SourceName; ok: boolean }> = [];
    const state: { bangumi?: boolean; bilibili?: boolean } = {
        bangumi: down ? false : undefined,
        bilibili: down ? false : undefined,
    };
    const listeners = new Set<(down: boolean) => void>();
    let current = down;

    const isDown = vi.fn(() => current);

    const publish = (): void => {
        const next = false === state.bangumi && false === state.bilibili;
        if (next === current) {
            return;
        }

        current = next;
        for (const listener of listeners) {
            listener(next);
        }
    };

    const report = vi.fn((source: SourceName, ok: boolean) => {
        reports.push({ source, ok });
        state[source] = ok;
        publish();
    });

    /**
     * 直接翻转停摆状态。
     *
     * 与 `publish` 不同，这里不看「值有没有变」——用例想验证的正是「进入停摆
     * 会发生什么」，即便初始状态就是停摆也应当通知一次。
     */
    const setDown = (next: boolean): void => {
        state.bangumi = next ? false : undefined;
        state.bilibili = next ? false : undefined;

        const changed = next !== current;
        current = next;

        if (changed) {
            for (const listener of listeners) {
                listener(next);
            }
        }
    };

    const availability: Availability = {
        isDown,
        report,
        onDidChange: listener => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose: () => listeners.clear(),
    };

    return {
        reports,
        report,
        isDown,
        availability,
        setDown,
    };
}

/**
 * 探测结果替身。
 *
 * @author sdttttt
 */
export function healthOf(bangumi: boolean, bilibili: boolean): SourceHealth {
    return { bangumi, bilibili };
}
