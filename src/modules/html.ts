import { ValueRef, array_len, array_get, destroy, typeof_std, ObjectType } from './std';

declare function parse(string: ArrayBuffer, size: usize): i32;
declare function parse_with_uri(html: ArrayBuffer, htmlLen: usize, baseUri: ArrayBuffer, baseUriLen: usize): i32;
declare function parse_fragment(string: ArrayBuffer, size: usize): i32;
declare function parse_fragment_with_uri(html: ArrayBuffer, htmlLen: usize, baseUri: ArrayBuffer, baseUriLen: usize): i32;

declare function select(rid: i32, selector: ArrayBuffer, selectorLength: usize): i32;
declare function attr(rid: i32, selector: ArrayBuffer, selectorLength: usize): i32;

declare function first(rid: i32): i32;
declare function last(rid: i32): i32;
declare function next(rid: i32): i32;
declare function previous(rid: i32): i32;

declare function base_uri(rid: i32): i32;
declare function body(rid: i32): i32;
declare function text(rid: i32): i32;
declare function own_text(rid: i32): i32;
declare function data(rid: i32): i32;
declare function array(rid: i32): i32;
declare function html(rid: i32): i32;
declare function outer_html(rid: i32): i32;

declare function id(rid: i32): i32;
declare function tag_name(rid: i32): i32;
declare function class_name(rid: i32): i32;
declare function has_class(rid: i32, className: ArrayBuffer, classLength: usize): bool;
declare function has_attr(rid: i32, attrName: ArrayBuffer, attrLength: usize): bool;

/**
 * Class representing a HTML node, which can be a group of elements,
 * a single element, or the entire HTML document.
 */
export class Html {
	constructor(public rid: i32) {};

	/**
	 * Parses HTML into `Html`. If no base URI is specified, absolute URL resolution
	 * relies on the HTML having a `<base href>` tag.
	 * @param buffer The HTML to parse
	 * @param baseUri The URL where the HTML was retrieved from. Used to resolve 
	 * relative URLs to absolute URLs before a `<base href>` tag is defined.
	 * @returns sane HTML
	 */
	static parse(buffer: ArrayBuffer | string, baseUri?: ArrayBuffer | string): Html {
		if (typeof buffer == "string") {
			buffer = String.UTF8.encode(buffer);
		}

		if (typeof baseUri == "string") {
			baseUri = String.UTF8.encode(baseUri);
		}

		if (baseUri) {
			return new Html(parse_with_uri(buffer, buffer.byteLength, baseUri, baseUri.byteLength))
		} else {
			return new Html(parse(buffer, buffer.byteLength))
		}
	}

	/**
	 * Parse a fragment of HTML, with the assumption that it forms the body of
	 * the HTML.
	 * @param buffer the body HTML fragment
	 * @param baseUri URL to resolve relative URLs against
	 * @returns sane HTML document
	 */
	static parseFragment(buffer: ArrayBuffer | string, baseUri?: ArrayBuffer | string): Html {
		if (typeof buffer == "string") {
			buffer = String.UTF8.encode(buffer);
		}

		if (typeof baseUri == "string") {
			baseUri = String.UTF8.encode(baseUri);
		}

		if (baseUri) {
			return new Html(parse_fragment_with_uri(buffer, buffer.byteLength, baseUri, baseUri.byteLength))
		} else {
			return new Html(parse_fragment(buffer, buffer.byteLength))
		}
	}

	/**
	 * Find elements that match the given CSS/JQuery-like selector, with this
	 * element as the starting context.
	 * 
	 * <details>
     *     <summary>Supported selectors</summary>
     *  
     * | Pattern                 | Matches                                                                                              | Example                                                           |
     * |-------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
     * | `*`                     | any element                                                                                          | `*`                                                               |
     * | `tag`                   | elements with the given tag name                                                                     | `div`                                                             |
     * | <code>*\|E</code>       | elements of type E in any namespace (including non-namespaced)                                       | <code>*\|name</code> finds `<fb:name>` and `<name>` elements      |
     * | <code>ns\|E</code>      | elements of type E in the namespace ns                                                               | <code>fb\|name</code> finds `<fb:name>` elements                  |
     * | `#id`                   | elements with attribute ID of "id"                                                                   | `div#wrap`, `#logo`                                               |
     * | `.class`                | elements with a class name of "class"                                                                | `div.left`, `.result`                                             |
     * | `[attr]`                | elements with an attribute named "attr" (with any value)                                             | `a[href]`, `[title]`                                              |
     * | `[^attrPrefix]`         | elements with an attribute name starting with "attrPrefix". Use to find elements with HTML5 datasets | `[^data-]`, `div[^data-]`                                         |
     * | `[attr=val]`            | elements with an attribute named "attr", and value equal to "val"                                    | `img[width=500]`, `a[rel=nofollow]`                               |
     * | `[attr="val"]`          | elements with an attribute named "attr", and value equal to "val"                                    | `span[hello="Cleveland"][goodbye="Columbus"]`, `a[rel="nofollow"]`|
     * | `[attr^=valPrefix]`     | elements with an attribute named "attr", and value starting with "valPrefix"                         | `a[href^=http:]`                                                  |
     * | `[attr$=valSuffix]`     | elements with an attribute named "attr", and value ending with "valSuffix"                           | `img[src$=.png]`                                                  |
     * | `[attr*=valContaining]` | elements with an attribute named "attr", and value containing "valContaining"                        | `a[href*=/search/]`                                               |
     * | `[attr~=regex]`         | elements with an attribute named "attr", and value matching the regular expression                   | `img[src~=(?i)\\.(png\|jpe?g)]`                                   |
     * |                         | The above may be combined in any order                                                               | `div.header[title]`                                               |
     *
     * ## Combinators
     * | Pattern   | Matches                                         | Example                     |
     * |-----------|-------------------------------------------------|-----------------------------|
     * | `E F`     | an F element descended from an E element        | `div a`, `.logo h1`         |
     * | `E > F`   | an F direct child of E                          | `ol > li`                   |
     * | `E + F`   | an F element immediately preceded by sibling E  | `li + li`, `div.head + div` |
     * | `E ~ F`   | an F element preceded by sibling E              | `h1 ~ p`                    |
     * | `E, F, G` | all matching elements E, F, or G                | `a[href], div, h3`          |
     *
     * ## Pseudo selectors
     * | Pattern              | Matches                                                                                                                                                   | Example                                                                                                                                                      |
     * |----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
     * | `:lt(n)`             | elements whose sibling index is less than n                                                                                                               | `td:lt(3)` finds the first 3 cells of each row                                                                                                               |
     * | `:gt(n)`             | elements whose sibling index is greater than n                                                                                                            | `td:gt(1)` finds cells after skipping the first two                                                                                                          |
     * | `:eq(n)`             | elements whose sibling index is equal to n                                                                                                                | `td:eq(0)` finds the first cell of each row                                                                                                                  |
     * | `:has(selector)`     | elements that contains at least one element matching the selector                                                                                         | `div:has(p)` finds divs that contain p elements; `div:has(> a)` selects div elements that have at least one direct child a element.                          |
     * | `:not(selector)`     | elements that do not match the selector.                                                                                                                  | `div:not(.logo)` finds all divs that do not have the "logo" class; `div:not(:has(div))` finds divs that do not contain divs.                                 |
     * | `:contains(text)`    | elements that contains the specified text. The search is case insensitive. The text may appear in the found element, or any of its descendants.           | `p:contains(SwiftSoup)` finds p elements containing the text "SwiftSoup"; `p:contains(hello \(there\))` finds p elements containing the text "Hello (There)" |
     * | `:matches(regex)`    | elements whose text matches the specified regular expression. The text may appear in the found element, or any of its descendants.                        | `td:matches(\\d+)` finds table cells containing digits. div:matches((?i)login) finds divs containing the text, case insensitively.                           |
     * | `:containsOwn(text)` | elements that directly contain the specified text. The search is case insensitive. The text must appear in the found element, not any of its descendants. | `p:containsOwn(SwiftSoup)` finds p elements with own text "SwiftSoup".                                                                                       |
     * | `:matchesOwn(regex)` | elements whose own text matches the specified regular expression. The text must appear in the found element, not any of its descendants.                  | `td:matchesOwn(\\d+)` finds table cells directly containing digits. div:matchesOwn((?i)login) finds divs containing the text, case insensitively.            |
     *
     * ## Structural pseudo-selectors
     * | Pattern                   | Matches                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Example                                                |
     * |---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
     * | `:root`                   | The element that is the root of the document. In HTML, this is the html element                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                        |                                                                                                                                                                                                 |
     * | `:nth-child(an+b)`        | elements that have an+b-1 siblings before it in the document tree, for any positive integer or zero value of n, and has a parent element. For values of a and b greater than zero, this effectively divides the element's children into groups of a elements (the last group taking the remainder), and selecting the bth element of each group. For example, this allows the selectors to address every other row in a table, and could be used to alternate the color of paragraph text in a cycle of four. The a and b values must be integers (positive, negative, or zero). The index of the first child of an element is 1. |                                                        |
     * | `:nth-last-child(an+b)`   | elements that have an+b-1 siblings after it in the document tree. Otherwise like `:nth-child()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `tr:nth-last-child(-n+2)` the last two rows of a table |
     * | `:nth-of-type(an+b)`      | pseudo-class notation represents an element that has an+b-1 siblings with the same expanded element name before it in the document tree, for any zero or positive integer value of n, and has a parent element                                                                                                                                                                                                                                                                                                                                                                                                                    | `img:nth-of-type(2n+1)`                                |
     * | `:nth-last-of-type(an+b)` | pseudo-class notation represents an element that has an+b-1 siblings with the same expanded element name after it in the document tree, for any zero or positive integer value of n, and has a parent element                                                                                                                                                                                                                                                                                                                                                                                                                     | `img:nth-last-of-type(2n+1)`                           |
     * | `:first-child`            | elements that are the first child of some other element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `div > p:first-child`                                  |
     * | `:last-child`             | elements that are the last child of some other element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `ol > li:last-child`                                   |
     * | `:first-of-type`          | elements that are the first sibling of its type in the list of children of its parent element                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `dl dt:first-of-type`                                  |
     * | `:last-of-type`           | elements that are the last sibling of its type in the list of children of its parent element                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `tr > td:last-of-type`                                 |
     * | `:only-child`             | elements that have a parent element and whose parent element hasve no other element children                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                        |
     * | `:only-of-type`           |  an element that has a parent element and whose parent element has no other element children with the same expanded element name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                        |
     * | `:empty`                  | elements that have no children at all                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                        |
     * </details>
	 * @param selector The CSS-like query.
	 * @returns A group of elements that match the query.
	 */
	public select(selector: string): Html {
		return new Html(select(this.rid, String.UTF8.encode(selector), String.UTF8.byteLength(selector)));
	}

	/**
	 * Get the first sibling of the element, which can be this element.
	 * @returns The first sibling (aka the parent's first element child)
	 */
	public first(): Html {
		return new Html(first(this.rid));
	}

	/**
	 * Get the last sibling of the element, which can be this element.
	 * @returns The last sibling (aka the parent's last element child)
	 */
	public last(): Html {
		return new Html(last(this.rid));
	}

	/**
	 * Get the next sibling of the element.
	 * @returns the next element, or null if there is no next element
	 */
	public next(): Html | null {
		const rid = next(this.rid);
		if (typeof_std(rid) == ObjectType.Node) {
			return new Html(rid);
		} else {
			return null;
		}
	}

	/**
	 * Get the previous sibling of the element.
	 * @returns the previous element, or null if there is no previous element
	 */
	public previous(): Html | null {
		const rid = previous(this.rid);
		if (typeof_std(rid) == ObjectType.Node) {
			return new Html(rid);
		} else {
			return null;
		}
	}

	/**
	 * Get the base URI of this Html object.
	 * @returns the base URI
	 */
	public baseUri(): string {
		return new ValueRef(base_uri(this.rid)).toString();
	}

	/**
	 * Get the document's body element.
	 * @returns the document's body
	 */
	public body(): string {
		return new ValueRef(body(this.rid)).toString();
	}

	/**
	 * Get an attribute value by its key. To get an absolute URL from an
	 * attribute that may be a relative URL, prefix the key with `abs:`.
	 * @param name the attribute key
	 * @returns the attribute value
	 */
	public attr(name: string): string {
		return new ValueRef(attr(this.rid, String.UTF8.encode(name), String.UTF8.byteLength(name))).toString();
	}

	/**
	 * Get the normalized, combined text of this element and all its
	 * children. Whitespace is normalized and trimmed.
	 * 
	 * For example, given HTML `<p>Hello <b>there</b> now! </p>`, 
	 * `p.text()` returns "Hello there now!"
	 * 
	 * Note that this method returns the textual content that would be
	 * presented to a reader. The content of data tags, e.g. `<script>`,
	 * are not considered text. Use {@link html|html()} or 
	 * {@link data|data()} to retrieve that content.
	 * @returns normalized text, or an empty string.
	 */
	public text(): string {
		return new ValueRef(text(this.rid)).toString();
	}

	/**
	 * Get the normalized text owned by this element only; does not get the
	 * combined text of all children.
	 * 
	 * @returns text, or an empty string.
	 */
	public ownText(): string {
		return new ValueRef(own_text(this.rid)).toString();
	}

	/**
	 * Get the combined data of this element. Data is e.g. the inside of a
	 * `<script>` tag. Note that data is NOT the text of the element. Use
	 * {@link text|text()} to get the text that would be visible to a user,
	 * and {@link data|data()} for the contents of scripts etc.
	 * @returns the data, or empty string
	 */
	public data(): string {
		return new ValueRef(data(this.rid)).toString();
	}

	/**
	 * Get an array of Html. Most commonly used with {@link select|select()}
	 * to iterate through elements that match a selector.
	 * @returns an array of elements
	 */
	public array(): Html[] {
		let arr = array(this.rid);
		let size = array_len(arr) as i32;
		let result: Html[] = [];
		for (let i = 0; i < size; i++) {
			result.push(new Html(array_get(arr, i)));
		}
		return result;
	}

	/**
	 * Retrieves the element's inner HTML.
	 * @returns string of HTML
	 */
	public html(): string {
		return new ValueRef(html(this.rid)).toString();
	}

	/**
	 * Retrieves the element's outer HTML.
	 * @returns string of HTML
	 */
	public outerHtml(): string {
		return new ValueRef(outer_html(this.rid)).toString();
	}

	/**
	 * Get the `id` attribute of this element.
	 * @returns The `id` attribute, if present, or an empty string
	 */
	public id(): string {
		return new ValueRef(id(this.rid)).toString();
	}

	/**
	 * Get the name of the tag for this element, lowercased.
	 * @returns the tag name
	 */
	public tagName(): string {
		return new ValueRef(tag_name(this.rid)).toString();
	}

	/**
	 * Get the literal value of this element's `class` attribute, which may
	 * include multiple class names, space separated.
	 * @returns the literal class attribute, or an empty string
	 */
	public className(): string {
		return new ValueRef(class_name(this.rid)).toString();
	}

	/**
	 * Case-insensitive test if this element has a class.
	 * @param className name of class to check for
	 * @returns true if it does, false if not
	 */
	public hasClass(className: string): bool {
		return has_class(this.rid, String.UTF8.encode(className), String.UTF8.byteLength(className));
	}

	/**
	 * Case-insensitive test if this element has an attribute.
	 * @param attr the attribute key to check
	 * @returns true if exists, false if not
	 */
	public hasAttr(attr: string): bool {
		return has_attr(this.rid, String.UTF8.encode(attr), String.UTF8.byteLength(attr));
	}

	public close(): void {
		destroy(this.rid);
	}
}
