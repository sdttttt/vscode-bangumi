import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COMMAND_IDS } from "@/commands";

interface CommandContribution {
    command: string;
}

interface KeybindingContribution {
    command: string;
}

interface Manifest {
    main: string;
    engines: { vscode: string };
    activationEvents: Array<string>;
    contributes: {
        commands: Array<CommandContribution>;
        keybindings: Array<KeybindingContribution>;
        configuration: { properties: Record<string, unknown> };
    };
}

const manifest: Manifest = JSON.parse(
    readFileSync(resolve(import.meta.dirname, "../../../package.json"), "utf8")
);

/**
 * 把 `^1.100.0` 形式的版本范围规范为可比较的 major.minor 元组。
 *
 * @author sdttttt
 */
function majorMinor(range: string): [number, number] {
    const match = /\^?(\d+)\.(\d+)/.exec(range);
    if (!match) {
        throw new Error(`unparsable version range: ${range}`);
    }

    return [Number(match[1]), Number(match[2])];
}

describe("package.json manifest", () => {
    it("declares exactly the commands registered by activate()", () => {
        const declared = manifest.contributes.commands
            .map(entry => entry.command)
            .sort();

        expect(declared).toEqual([...COMMAND_IDS].sort());
    });

    it("only binds keybindings to declared commands", () => {
        const declared = new Set(
            manifest.contributes.commands.map(entry => entry.command)
        );

        for (const binding of manifest.contributes.keybindings) {
            expect(declared.has(binding.command)).toBe(true);
        }
    });

    it("points main at the bundled entry file", () => {
        expect(manifest.main).toBe("./dist/extension.js");
    });

    it("activates after startup so the reminder can be scheduled", () => {
        expect(manifest.activationEvents).toContain("onStartupFinished");
    });

    it("keeps @types/vscode within the engines.vscode range", () => {
        /* 类型版本高于 engines.vscode 时 vsce 会拒绝打包 */
        const types = JSON.parse(
            readFileSync(
                resolve(
                    import.meta.dirname,
                    "../../../node_modules/@types/vscode/package.json"
                ),
                "utf8"
            )
        ) as { version: string };

        const [engineMajor, engineMinor] = majorMinor(manifest.engines.vscode);
        const [typesMajor, typesMinor] = majorMinor(types.version);

        expect(typesMajor * 1000 + typesMinor).toBeLessThanOrEqual(
            engineMajor * 1000 + engineMinor
        );
    });

    it("documents every configuration key used by the source", () => {
        const properties = Object.keys(
            manifest.contributes.configuration.properties
        );
        const source = readFileSync(
            resolve(import.meta.dirname, "../../configuration.ts"),
            "utf8"
        );

        const used = [...source.matchAll(/"bangumiOpen\.[A-Za-z]+"/g)].map(
            match => match[0].slice(1, -1)
        );

        expect(used.length).toBeGreaterThan(0);
        for (const key of used) {
            expect(properties).toContain(key);
        }
    });
});
