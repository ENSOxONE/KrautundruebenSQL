import { HtmlElement } from "./HtmlElement"
import { Image } from "./Image";

export class Card extends HtmlElement {
	private image: Image | null;

	constructor() {
		super();
		this.image = null;
	}

	public setImage(imagePath: string, alt: string) {
		this.image = new Image(imagePath, alt);
	}

	public override getHtml(): string {
		let insertHtml = "";
		for (const element of this.elements) {
			insertHtml += element.getHtml() + "\n";
		}
		return `
		<div class="card">
			${this.image ? this.image.getHtml() : ""}
			<div class="card-body">
				${insertHtml}
			</div>
		</div>`;
	}
}
