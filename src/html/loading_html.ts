import { STYLE } from './bangumi_style';
import AbstractHTMLGenerator from './generator';

/**
 * Loading Html Generator.
 *
 * @class LoadingHTMLGenerator
 * @author sdttttt
 */
export default new class LoadingHTMLGenerator extends AbstractHTMLGenerator<undefined> {
    protected readonly style: string = STYLE;

    protected readonly htmlBody: string = '<body><div class="container">';

    protected readonly htmlHead: string = "<html>";

    protected readonly htmlFloor: string = "</div></body></html>";

    protected readonly html: string;

    /**
     * HTML initializer for Improve performance.
     * @author sdttttt
     */
    constructor() {
        super();
        this.html = '<div class="load">Loading...</div>';
        this.html = this.htmlHead + this.style + this.htmlBody + this.html + this.htmlFloor;
    }

    generateHTML(): string {
        return this.html;
    }
};