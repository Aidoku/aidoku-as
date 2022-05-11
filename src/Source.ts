import { Filter, Listing, MangaPageResult, Manga, Chapter, Page, DeepLink } from "./modules/aidoku";
import { Request } from "./modules/net";

export abstract class Source {
	abstract getMangaList(filters: Filter[], page: number): MangaPageResult;

	getMangaListing(listing: Listing, page: number): MangaPageResult {
		return new MangaPageResult([], false);
	};

	abstract getMangaDetails(mangaId: string): Manga;

	abstract getChapterList(mangaId: string): Chapter[];

	abstract getPageList(chapterId: string): Page[];

	modifyImageRequest(request: Request): void {}; 

	handleUrl(url: string): DeepLink | null {
		return null;
	}
}
