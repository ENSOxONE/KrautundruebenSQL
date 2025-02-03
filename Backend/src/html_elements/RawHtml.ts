import { HtmlElement } from "./HtmlElement";

export class RawHtml extends HtmlElement {
    private htmlCode;

    constructor(htmlCode: string) {
        super();
        this.htmlCode = htmlCode;
    }

    public override getHtml(): string {
        return this.htmlCode;
    }
}
