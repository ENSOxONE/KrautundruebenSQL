import { HtmlElement } from "./HtmlElement";

export class Image extends HtmlElement {
    private imagePath: string;
    private alt: string;

    constructor(imagePath: string, alt: string) {
        super();
        this.imagePath = imagePath;
        this.alt = alt;
    }

    public override getHtml(): string {
        return `<img src="${this.imagePath}" class="card-img-top" alt="${this.alt}">`;
    }
}
