/**
 * Html Generator
 * 
 * @template T input Data
 * @abstract AbstractHTMLGenerator
 * @author sdttttt
 */
export default abstract class AbstractHTMLGenerator<T> {

    protected abstract readonly htmlHead: string;
    protected abstract readonly style: string;
    protected abstract readonly htmlBody: string;
    protected abstract readonly htmlFloor: string;

    abstract generateHTML(data: T): string;

}