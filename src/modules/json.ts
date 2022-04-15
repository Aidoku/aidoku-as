import { ValueRef } from './std';

export declare function parse(data: ArrayBuffer, length: usize): i32;

export class JSON extends ValueRef {
	static parse(buffer: ArrayBuffer): JSON {
		return new JSON(parse(buffer, buffer.byteLength));
	}
}
