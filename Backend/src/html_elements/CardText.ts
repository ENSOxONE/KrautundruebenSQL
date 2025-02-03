import { HtmlElement } from "./HtmlElement";

export class CardText extends HtmlElement {
	private text: string;

	constructor(text: string) {
		super();
		this.text = text;
	}

	public override getHtml(): string {
		return `<p class="card-text">${this.text}</p>`
	}
}
