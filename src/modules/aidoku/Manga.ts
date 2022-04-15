import { create_manga, create_manga_result } from "./aidoku";
import { ValueRef, ArrayRef } from "../std";

export enum MangaStatus {
	Unknown = 0,
	Ongoing = 1,
	Completed = 2,
	Cancelled = 3,
	Hiatus = 4,
}

export enum MangaContentRating {
	Safe = 0,
	Suggestive = 1,
	NSFW = 2,
}

export enum MangaViewer {
	Default = 0,
	RTL = 1,
	LTR = 2,
	Vertical = 3,
	Scroll = 4,
}

export class MangaPageResult {
	constructor(public manga: Manga[], public hasNext: boolean) {}

	get value(): i32 {
		let mangaArray = ArrayRef.new();
		for (let i = 0; i < this.manga.length; i++) mangaArray.push(new ValueRef(this.manga[i].value));
		return create_manga_result(mangaArray.value.rid, this.hasNext);
	}
}

export class Manga {
	public id: string;
	public cover_url: string;
	public title: string;
	public author: string;
	public artist: string;
	public description: string;
	public url: string;
	public categories: string[];
	public status: MangaStatus;
	public rating: MangaContentRating;
	public viewer: MangaViewer;

	constructor(id: string, title: string) {
		this.id = id;
		this.cover_url = "";
		this.title = title;
		this.author = "";
		this.artist = "";
		this.description = "";
		this.categories = [];
		this.url = "";
		this.status = MangaStatus.Unknown;
		this.rating = MangaContentRating.Safe;
		this.viewer = MangaViewer.Default;
	}

	get value(): i32 {
		let categories: ArrayBuffer[] = this.categories.map<ArrayBuffer>((c: string): ArrayBuffer => String.UTF8.encode(c, false));
		let category_str_lens: i32[] = this.categories.map<i32>((c: string): i32 => c.length);

		return create_manga(
			String.UTF8.encode(this.id),
			String.UTF8.byteLength(this.id),
			String.UTF8.encode(this.cover_url),
			String.UTF8.byteLength(this.cover_url),
			String.UTF8.encode(this.title),
			String.UTF8.byteLength(this.title),
			String.UTF8.encode(this.author, false),
			String.UTF8.byteLength(this.author),
			String.UTF8.encode(this.artist, false),
			String.UTF8.byteLength(this.artist),
			String.UTF8.encode(this.description, false),
			String.UTF8.byteLength(this.description),
			String.UTF8.encode(this.url, false),
			String.UTF8.byteLength(this.url),
			this.categories.length > 0 ? categories.dataStart as i32 : 0,
			this.categories.length > 0 ? category_str_lens.dataStart as i32 : 0,
			this.categories.length,
			this.status,
			this.rating,
			this.viewer
		);
	}
}
