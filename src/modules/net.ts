import { JSON } from './json';
import { Html } from './html';
import { ValueRef } from './std';

declare function init(method: i32): i32;
declare function send(req: i32): void;
declare function close(req: i32): void;

declare function set_url(req: i32, value: ArrayBuffer, valueLen: usize): void;
declare function set_header(req: i32, key: ArrayBuffer, keyLen: usize, value: ArrayBuffer, valueLen: usize): void;
declare function set_body(req: i32, value: ArrayBuffer, valueLen: usize): void;

declare function get_url(req: i32): i32;
declare function get_data(req: i32, buffer: ArrayBuffer, size: i32): void;
declare function get_data_size(req: i32): usize;

declare function json(req: i32): i32;
declare function html(req: i32): i32;

/**
 * Set the number of requests permitted within a time period.
 * @param rate_limit the number of requests permitted
 */
export declare function set_rate_limit(rate_limit: i32): void;

/**
 * Set the rate limiting duration.
 * @param seconds the duration in seconds
 */
export declare function set_rate_limit_period(seconds: i32): void;

export enum HttpMethod {
	GET = 0,
	POST = 1,
	PUT = 2,
	DELETE = 3,
	HEAD = 4
}

interface RequestOptions {
	url?: string;
	headers?: Map<string, string>;
	body?: ArrayBuffer | string;
}

/**
 * A class for making simple HTTP requests.
 */
export class Request {
	public sent: bool
	
	/**
	 * Start a new request with a HTTP method.
	 * @param method the HTTP method to use
	 * @param options request options.
	 * @returns a new Request object
	 */
	static create(method: HttpMethod, options?: RequestOptions): Request {
		let req = new Request(init(method));
		if (options) {
			if (options.url) {
				req.url = options.url;
			}
			if (options.headers) {
				req.headers = options.headers;
			}
			if (options.body) {
				req.body = options.body;
			}
		}
		return req;
	}

	constructor(public req: i32 = 0) {
		this.sent = false;
	}

	/**
	 * Get the URL of the request.
	 */
	get url(): string {
		let url = new ValueRef(get_url(this.req));
		let string = url.toString();
		url.close();
		return string;
	}

	/**
	 * Set the URL for the request.
	 */
	set url(value: string) {
		set_url(this.req, String.UTF8.encode(value), String.UTF8.byteLength(value));
	}
	
	setHeader(key: string, value: string): void {
		set_header(this.req, String.UTF8.encode(key), String.UTF8.byteLength(key), String.UTF8.encode(value), String.UTF8.byteLength(value));
	}

	/**
	 * Set request headers.
	 */
	set headers(value: Map<string, string>) {
		let keys = value.keys();
		let values = value.values();
		for (let i = 0; i < values.length; i++) {
			this.setHeader(keys[i], values[i]);
		}
	}

	/**
	 * Set the request body.
	 */
	set body(value: ArrayBuffer | string) {
		if (typeof value == "string") {
			value = String.UTF8.encode(value);
		}
		set_body(this.req, value, value.byteLength);
	}

	send(): void {
		send(this.req);
		this.sent = true;
	}

	/**
	 * Get the raw data from the response
	 * @returns the raw data
	 */
	data(): ArrayBuffer {
		if (!this.sent) this.send();
		let size = get_data_size(this.req) as i32;
		if (size <= 0) return new ArrayBuffer(0);
		let buff = new ArrayBuffer(size);
		get_data(this.req, buff, size);
		this.close();
		return buff;
	}

	/**
	 * Get the response as a UTF-8 string
	 * @returns the string
	 */
	string(): string {
		let stringValue = String.UTF8.decode(this.data());
		this.close();
		return stringValue;
	}

	/**
	 * Get the response as JSON
	 * @returns the parsed JSON
	 */
	json(): JSON {
		if (!this.sent) this.send();
		let jsonObject = new JSON(json(this.req));
		this.close();
		return jsonObject;
	}

	/**
	 * Get the response as parsed HTML
	 * @returns the parsed HTML document
	 */
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
