import { JSON } from './json';
import { Html } from './html';
import { ValueRef } from './std';

export declare function init(method: i32): i32;
export declare function send(req: i32): void;
export declare function close(req: i32): void;

export declare function set_url(req: i32, value: ArrayBuffer, valueLen: usize): void;
export declare function set_header(req: i32, key: ArrayBuffer, keyLen: usize, value: ArrayBuffer, valueLen: usize): void;
export declare function set_body(req: i32, value: ArrayBuffer, valueLen: usize): void;

export declare function get_url(req: i32): i32;
export declare function get_data(req: i32, buffer: ArrayBuffer, size: i32): void;
export declare function get_data_size(req: i32): usize;

export declare function json(req: i32): i32;
export declare function html(req: i32): i32;

export enum HttpMethod {
	GET = 0,
	POST = 1,
	PUT = 2,
	DELETE = 3,
	HEAD = 4
}

export class Request {
	public sent: bool
	
	static create(method: HttpMethod): Request {
		return new Request(init(method));
	}

	constructor(public req: i32 = 0) {
		this.sent = false;
	}

	get url(): string {
		let url = new ValueRef(get_url(this.req));
		let string = url.toString();
		url.close();
		return string;
	}

	set url(value: string) {
		set_url(this.req, String.UTF8.encode(value), String.UTF8.byteLength(value));
	}
	
	setHeader(key: string, value: string): void {
		set_header(this.req, String.UTF8.encode(key), String.UTF8.byteLength(key), String.UTF8.encode(value), String.UTF8.byteLength(value));
	}

	set headers(value: Map<string, string>) {
		let values = value.values();
		for (let i = 0; i < values.length; i++) {
			set_header(this.req, String.UTF8.encode(value.keys()[i]), String.UTF8.byteLength(value.keys()[i]), String.UTF8.encode(values[i]), String.UTF8.byteLength(values[i]));
		}
	}

	send(): void {
		send(this.req);
		this.sent = true;
	}

	data(): ArrayBuffer {
		if (!this.sent) this.send();
		let size = get_data_size(this.req) as i32;
		if (size <= 0) return new ArrayBuffer(0);
		let buff = new ArrayBuffer(size);
		get_data(this.req, buff, size);
		this.close();
		return buff;
	}

	string(): string {
		let stringValue = String.UTF8.decode(this.data());
		this.close();
		return stringValue;
	}

	json(): JSON {
		if (!this.sent) this.send();
		let jsonObject = new JSON(json(this.req));
		this.close();
		return jsonObject;
	}

	html(): Html {
		if (!this.sent) this.send();
		let htmlObject = new Html(html(this.req));
		this.close();
		return htmlObject;
	}

	close(): void {
		close(this.req);
	}
}
