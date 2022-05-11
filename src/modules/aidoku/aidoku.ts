export declare function create_manga(
	id: ArrayBuffer, id_len: usize,
	cover_url: ArrayBuffer, cover_url_len: usize,
	title: ArrayBuffer, title_len: usize,
	author: ArrayBuffer, author_len: usize,
	artist: ArrayBuffer, artist_len: usize,
	description: ArrayBuffer, description_len: usize,
	url: ArrayBuffer, url_len: usize,
	categories: i32, category_str_lens: i32, category_count: usize,
	status: i32, nsfw: i32, viewer: i32
): i32;

export declare function create_manga_result(manga: i32, hasMore: bool): i32;

export declare function create_chapter(
	id: ArrayBuffer, id_len: usize,
	title: ArrayBuffer, title_len: usize,
	volume: f32, chapter: f32, dateUpdated: f64,
	scanlator: ArrayBuffer, scanlator_len: usize,
	url: ArrayBuffer, url_len: usize,
	lang: ArrayBuffer, lang_len: usize
): i32;

export declare function create_page(
	index: i32,
	image_url: ArrayBuffer, image_url_len: usize,
	base64: ArrayBuffer, base64_len: usize,
	text: ArrayBuffer, text_len: usize
): i32;

export declare function create_deeplink(
	manga: i32,
	chapter: i32,
): i32;
