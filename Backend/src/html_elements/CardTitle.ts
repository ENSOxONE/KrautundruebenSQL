import { HtmlElement } from "./HtmlElement";

export class CardTitle extends HtmlElement {
	private text: string;

	constructor(text: string) {
		super();
		this.text = text;
	}

	public override getHtml(): string {
		return `<h5 class="card-title">${this.text}</h5>`
	}
}
