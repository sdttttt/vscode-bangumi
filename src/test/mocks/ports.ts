import { vi } from "vitest";
import type { Commands, CommandId } from "@/commands";
import type { Notifier } from "@/notifier";

/**
 * Notifier double that records what the extension would have shown.
 *
 * @author sdttttt
 */
export interface NotifierStub {
    readonly info: ReturnType<typeof vi.fn<(message: string) => void>>;
    readonly error: ReturnType<typeof vi.fn<(message: string) => void>>;
    readonly ask: ReturnType<typeof vi.fn<Notifier["ask"]>>;
    readonly pick: ReturnType<typeof vi.fn<Notifier["pick"]>>;
    readonly action: ReturnType<typeof vi.fn<Notifier["action"]>>;
    /** The double as a `Notifier`. */
    readonly notifier: Notifier;
}

/**
 * Builds a notifier double. `pick` and `action` answer `undefined` unless a
 * case resolves them, which mirrors a dismissed prompt.
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
 * Commands double that records every executed id.
 *
 * @author sdttttt
 */
export interface CommandsStub {
    readonly execute: ReturnType<typeof vi.fn<(id: CommandId) => void>>;
    /** The double as a `Commands`. */
    readonly commands: Commands;
}

/**
 * Builds a commands double.
 *
 * @author sdttttt
 */
export function createCommandsStub(): CommandsStub {
    const execute = vi.fn<(id: CommandId) => void>();

    return { execute, commands: { execute } };
}
