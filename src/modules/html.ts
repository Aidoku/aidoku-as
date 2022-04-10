import { HostObject, array_len, array_get } from './std';

export declare function parse(string: ArrayBuffer, size: usize): i32;
export declare function close(rid: i32): void;

export declare function select(rid: i32, selector: ArrayBuffer, selectorLength: usize): i32;
export declare function attr(rid: i32, selector: ArrayBuffer, selectorLength: usize): i32;

export declare function first(rid: i32): i32;
export declare function last(rid: i32): i32;
export declare function array(rid: i32): i32;

export declare function base_uri(rid: i32): i32;
export declare function body(rid: i32): i32;
export declare function text(rid: i32): i32;
export declare function html(rid: i32): i32;
export declare function outer_html(rid: i32): i32;

export declare function id(rid: i32): i32;
export declare function tag_name(rid: i32): i32;
export declare function class_name(rid: i32): i32;
export declare function has_class(rid: i32, className: ArrayBuffer, classLength: usize): bool;
export declare function has_attr(rid: i32, attrName: ArrayBuffer, attrLength: usize): bool;

export class Html {
	static parse(buffer: ArrayBuffer): Html {
		return new Html(parse(buffer, buffer.byteLength));
	}

	constructor(public rid: i32) {};

	public select(selector: string): Html {
		return new Html(select(this.rid, String.UTF8.encode(selector), String.UTF8.byteLength(selector)));
	}

	public first(): Html {
		return new Html(first(this.rid));
	}

	public last(): Html {
		return new Html(last(this.rid));
	}

	public baseUri(): string {
		return new HostObject(base_uri(this.rid)).toString();
	}

	public body(): string {
		return new HostObject(body(this.rid)).toString();
	}

	public attr(name: string): string {
		return new HostObject(attr(this.rid, String.UTF8.encode(name), String.UTF8.byteLength(name))).toString();
	}

	public text(): string {
		return new HostObject(text(this.rid)).toString();
	}

	public array(): Html[] {
		let arr = array(this.rid);
		let size = array_len(arr) as i32;
		let result: Html[] = [];
		for (let i = 0; i < size; i++) {
			result.push(new Html(array_get(arr, i)));
		}
		return result;
	}

	public html(): string {
		return new HostObject(html(this.rid)).toString();
	}

	public outerHtml(): string {
		return new HostObject(outer_html(this.rid)).toString();
	}

	public id(): string {
		return new HostObject(id(this.rid)).toString();
	}

	public tagName(): string {
		return new HostObject(tag_name(this.rid)).toString();
	}

	public className(): string {
		return new HostObject(class_name(this.rid)).toString();
	}

	public hasClass(className: string): bool {
		return has_class(this.rid, String.UTF8.encode(className), String.UTF8.byteLength(className));
	}

	public hasAttr(attr: string): bool {
		return has_attr(this.rid, String.UTF8.encode(attr), String.UTF8.byteLength(attr));
	}

	public close(): void {
		close(this.rid);
	}
}
