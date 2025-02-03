export abstract class HtmlElement {
    protected elements: HtmlElement[];

    constructor() {
        this.elements = [];
    }

    public addElement(element: HtmlElement) {
        this.elements.push(element)
    }

    public abstract getHtml() : string;
}
