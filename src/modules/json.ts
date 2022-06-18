import { ValueRef } from './std';

export declare function parse(data: ArrayBuffer, length: usize): i32;

export class JSON extends ValueRef {
	/**
	 * Parse JSON data
	 * @param buffer the JSON to parse
	 * @returns parsed JSON
	 */
	static parse(buffer: ArrayBuffer | string): JSON {
		if (typeof buffer == "string") {
			buffer = String.UTF8.encode(buffer);
		}
		return new JSON(parse(buffer, buffer.byteLength));
	}
}
