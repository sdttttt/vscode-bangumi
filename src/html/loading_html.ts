import { STYLE } from './bangumi_style';
import AbstractHTMLGenerator from './generator';
import { Uri } from 'vscode';
import { getResourceFile } from '../utils/file';
import { huihui } from '../constants';

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

    protected html?: string;

    /**
     * HTML initializer for Improve performance.
     * @author sdttttt
     */
    constructor() {
        super();
    }

    generateHTML(): string {
        if (!this.html) {
            const loadimg: Uri = getResourceFile(huihui);
            this.html = `<div class="load"><img style="width:120px;height:130px;" src="${loadimg}">Loading...</div>`;
            this.html = this.htmlHead + this.style + this.htmlBody + this.html + this.htmlFloor;
        }
        return this.html;
    }
};