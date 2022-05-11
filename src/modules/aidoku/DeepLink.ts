import { Manga } from "./Manga";
import { Chapter } from "./Chapter";
import { create_deeplink } from "./aidoku";

/**
 * Directly open manga from source website URLs.
 */
export class DeepLink {
    /**
     * Creates a new DeepLink object.
     * @param manga The manga of the deep link.
     * @param chapter The chapter of the manga.
     */
    constructor(public manga: Manga, public chapter: Chapter | null) {
        this.manga = manga;
        this.chapter = chapter;   
    }

    /**
     * The rid of the DeepLink object.
     */
    get value(): i32 {
        return create_deeplink(this.manga.value, this.chapter ? (this.chapter as Chapter).value : -1);
    }
}
