export declare function copy(rid: i32): i32;
export declare function destroy(rid: i32): void;

export declare function create_array(): i32;
export declare function create_object(): i32;
export declare function create_null(): i32;
export declare function create_string(buf: ArrayBuffer, len: usize): i32;
export declare function create_bool(value: bool): i32;
export declare function create_float(value: f64): i32;
export declare function create_int(value: i64): i32;
export declare function create_date(value: f64): i32;

@external("std", "typeof")
export declare function typeof_std(rid: i32): i32;
export declare function string_len(rid: i32): usize;
export declare function read_bool(rid: i32): bool;
export declare function read_int(rid: i32): i64;
export declare function read_float(rid: i32): f64;
export declare function read_string(rid: i32, buf: ArrayBuffer, len: usize): void;
export declare function read_date(rid: i32): f64;
export declare function read_date_string(rid: i32, format: ArrayBuffer, formatSize: usize, locale: ArrayBuffer, localeSize: usize, timeZone: ArrayBuffer, timeZoneSize: usize): f64;

export declare function array_len(rid: i32): usize;
export declare function array_get(rid: i32, idx: usize): i32;
export declare function array_set(rid: i32, idx: usize, value: i32): void;
export declare function array_append(rid: i32, value: i32): void;
export declare function array_remove(rid: i32, idx: usize): void;

export declare function object_len(rid: i32): usize;
export declare function object_get(rid: i32, key: ArrayBuffer, len: usize): i32;
export declare function object_set(rid: i32, key: ArrayBuffer, len: usize, value: i32): void;
export declare function object_keys(rid: i32): i32;
export declare function object_values(rid: i32): i32;
export declare function object_remove(rid: i32, key: ArrayBuffer, len: usize): void;

export enum ObjectType {
	Null = 0,
	Int = 1,
	Float = 2,
	String = 3,
	Bool = 4,
	Array = 5,
	Object = 6,
	Date = 7
}

export class HostObject {

	static null(): HostObject {
		return new HostObject(create_null());
	}
	static array(): HostObject {
		return new HostObject(create_array());
	}
	static object(): HostObject {
		return new HostObject(create_object());
	}
	static string(value: string): HostObject {
		return new HostObject(create_string(String.UTF8.encode(value), String.UTF8.byteLength(value)));
	}
	static integer(value: i32): HostObject {
		return new HostObject(create_int(value));
	}
	static float(value: f32): HostObject {
		return new HostObject(create_float(value));
	}
	static bool(value: bool): HostObject {
		return new HostObject(create_bool(value));
	}

	constructor(public rid: i32) {}

	get type(): ObjectType {
		return typeof_std(this.rid);
	}

	// Object
	public get(key: string): HostObject {
		let rid = object_get(this.rid, String.UTF8.encode(key), String.UTF8.byteLength(key));
		return new HostObject(rid);
	}

	public set(key: string, value: HostObject): void {
		object_set(this.rid, String.UTF8.encode(key), String.UTF8.byteLength(key), value.rid);
	}

	public remove(key: string): void {
		object_remove(this.rid, String.UTF8.encode(key), String.UTF8.byteLength(key));
	}

	public keys(): string[] {
		let keyStrings: string[] = [];
		let keys = new HostObject(object_keys(this.rid)).toArray();
		for (let i = 0; i < keys.length; i++) {
			keyStrings.push(keys[i].toString());
		}
		return keyStrings;
	}

	public values(): HostObject[] {
		return new HostObject(object_values(this.rid)).toArray();
	}

	// Array
	public getAt(index: number): HostObject {
		return new HostObject(array_get(this.rid, index as usize));
	}

	public setAt(index: number, value: HostObject): void {
		array_set(this.rid, index as usize, value.rid);
	}

	public removeAt(index: number): void {
		array_remove(this.rid, index as usize);
	}

	public push(value: HostObject): void {
		array_append(this.rid, value.rid);
	}

	// Conversion
	public toInteger(): i64 {
		return read_int(this.rid);
	}

	public toFloat(): f64 {
		return read_float(this.rid);
	}

	public toBool(): bool {
		return read_bool(this.rid);
	}

	public toDate(format: string, locale: string | null = null, timeZone: string | null = null): f64 {
		return read_date_string(
			this.rid,
			String.UTF8.encode(format),
			String.UTF8.byteLength(format),
			locale != null ? String.UTF8.encode(locale as string) : new ArrayBuffer(0),
			locale != null ? String.UTF8.byteLength(locale as string) as usize : 0,
			timeZone != null ? String.UTF8.encode(timeZone as string) : new ArrayBuffer(0),
			timeZone != null ? String.UTF8.byteLength(timeZone as string) as usize : 0
		);
	}

	public toString(): string {
		let len = string_len(this.rid) as i32;
		if (len <= 0) return "";
		let buff = new ArrayBuffer(len);
		read_string(this.rid, buff, len);
		return String.UTF8.decode(buff);
	}

	public toArray(): HostObject[] {
		let size = array_len(this.rid) as i32;
		let result: HostObject[] = [];
		for (let i = 0; i < size; i++) {
			result.push(this.getAt(i));
		}
		return result;
	}

	public toObject(): Map<string, HostObject> {
		let keys = this.keys();
		let values = this.values();
		let result = new Map<string, HostObject>();
		for (let i = 0; i < keys.length; i++) {
			result.set(keys[i].toString(), values[i]);
		}
		return result;
	}

	// Memory
	public copy(): HostObject {
		return new HostObject(copy(this.rid));
	}

	public close(): void {
		destroy(this.rid);
	}
}
