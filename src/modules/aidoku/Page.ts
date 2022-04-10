import { create_page } from "./aidoku";

export class Page {
	public url: string;
	public base64: string;
	public text: string;

	constructor(public index: i32) {
		this.url = "";
		this.base64 = "";
		this.text = "";
	}

	get value(): i32 {
		return create_page(
			this.index,
			String.UTF8.encode(this.url),
			String.UTF8.byteLength(this.url),
			String.UTF8.encode(this.base64),
			String.UTF8.byteLength(this.base64),
			String.UTF8.encode(this.text),
			String.UTF8.byteLength(this.text)
		);
	}
}
