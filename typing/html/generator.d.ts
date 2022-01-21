/**
 * Html Generator
 *
 * @template T input Data
 * @abstract AbstractHTMLGenerator
 * @author sdttttt
 */
export default abstract class AbstractHTMLGenerator<T = unknown | undefined> {
    protected abstract style?: string;
    protected readonly htmlBody: string;
    protected readonly htmlHead: string;
    protected readonly htmlFloor: string;
    protected abstract html?: string;
    abstract generateHTML(data: T): string;
    protected makeCssUri(path: string): void;
}
