import { vi } from "vitest";
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
    readonly action: ReturnType<typeof vi.fn<Notifier["action"]>>;
    /** 该替身作为 `Notifier` 使用。 */
    readonly notifier: Notifier;
}

/**
 * 创建 Notifier 替身。除非用例自行设定返回值，`pick` 与 `action` 都返回 `undefined`，
 * 与用户取消选择的场景一致。
 *
 * @author sdttttt
 */
export function createNotifierStub(): NotifierStub {
    const info = vi.fn<(message: string) => void>();
    const error = vi.fn<(message: string) => void>();
    const ask = vi.fn<Notifier["ask"]>(() => Promise.resolve(undefined));
    const pick = vi.fn<Notifier["pick"]>(() => Promise.resolve(undefined));
    const action = vi.fn<Notifier["action"]>(() => Promise.resolve(undefined));

    return {
        info,
        error,
        ask,
        pick,
        action,
        notifier: { info, error, ask, pick, action },
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
