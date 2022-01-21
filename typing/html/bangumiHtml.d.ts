import { Bangumi } from "../request/structure";
declare const _default: {
    style?: string | undefined;
    html?: string | undefined;
    /**
     *  Generate a Bangumi View
     *
     * @param {Bangumi} bangumi
     * @author sdttttt
     */
    makeLine(bangumi: Bangumi): string;
    /**
     * Generates Bangumi html
     *
     * @param {Array<Bangumi>} bangumis
     * @returns string
     * @author sdttttt
     */
    generateHTML(bangumis: Array<Bangumi>): string;
    readonly htmlBody: string;
    readonly htmlHead: string;
    readonly htmlFloor: string;
    makeCssUri(path: string): void;
};
/**
 * Bangumis HTML Generator
 *
 * @class BangumisHTMLGenerator
 * @author sdttttt
 */
export default _default;
