import { create_chapter } from "./aidoku";

export class Chapter {
	public id: string;
	public title: string;
	public volume: f32;
	public chapter: f32;
	public dateUpdated: f64;
	public scanlator: string;
	public url: string;
	public lang: string;

	constructor(id: string, title: string) {
		this.id = id;
		this.title = title;
		this.volume = -1;
		this.chapter = -1;
		this.dateUpdated = 0;
		this.scanlator = "";
		this.url = "";
		this.lang = "";
	}

	get value(): i32 {
		return create_chapter(
			String.UTF8.encode(this.id, false),
			String.UTF8.byteLength(this.id),
			String.UTF8.encode(this.title, false),
			String.UTF8.byteLength(this.title),
			this.volume,
			this.chapter,
			this.dateUpdated,
			String.UTF8.encode(this.scanlator, false),
			String.UTF8.byteLength(this.scanlator),
			String.UTF8.encode(this.url, false),
			String.UTF8.byteLength(this.url),
			String.UTF8.encode(this.lang, false),
			String.UTF8.byteLength(this.lang)
		);
	}
}
