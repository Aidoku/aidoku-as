import { Manga } from "./Manga";
import { Chapter } from "./Chapter";
import { create_deeplink } from "./aidoku";

/**
 * Directly open mangas from aidoku://:sourceId/:mangaId URLs.
 */
export class DeepLink {
    /**
     * Creates a new DeepLink object.
     * @param manga The manga of the deep link.
     * @param chapter The chapter of the manga.
     */
    constructor(public manga: Manga | null, public chapter: Chapter | null) {
        this.manga = manga;
        this.chapter = chapter;   
    }

    /**
     * The rid of the DeepLink object.
     */
    get value(): i32 {
        const manga = this.manga?.value;
        const chapter = this.chapter?.value;
        return create_deeplink(manga ? manga : -1, chapter ? chapter : -1);
    }
}
