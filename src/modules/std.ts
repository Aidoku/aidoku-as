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

export class ValueRef {
	static null(): ValueRef {
		return new ValueRef(create_null());
	}
	static string(value: string): ValueRef {
		return new ValueRef(create_string(String.UTF8.encode(value), String.UTF8.byteLength(value)));
	}
	static integer(value: i32): ValueRef {
		return new ValueRef(create_int(value));
	}
	static float(value: f32): ValueRef {
		return new ValueRef(create_float(value));
	}
	static bool(value: bool): ValueRef {
		return new ValueRef(create_bool(value));
	}
	static currentDate(): f64 {
		return read_date(create_date(-1));
	}

	constructor(public rid: i32) {}

	get type(): ObjectType {
		return typeof_std(this.rid);
	}

	// Casting
	public asArray(): ArrayRef {
		return new ArrayRef(this);
	}

	public asObject(): ObjectRef {
		return new ObjectRef(this);
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

	public copy(): ValueRef {
		return new ValueRef(copy(this.rid));
	}

	public close(): void {
		destroy(this.rid);
	}
}

export class ObjectRef {
	static new(): ObjectRef {
		return new ValueRef(create_object()).asObject();
	}

	constructor(public value: ValueRef) {}

	public get(key: string): ValueRef {
		let rid = object_get(this.value.rid, String.UTF8.encode(key), String.UTF8.byteLength(key));
		return new ValueRef(rid);
	}

	public set(key: string, value: ValueRef): void {
		object_set(this.value.rid, String.UTF8.encode(key), String.UTF8.byteLength(key), value.rid);
	}

	public remove(key: string): void {
		object_remove(this.value.rid, String.UTF8.encode(key), String.UTF8.byteLength(key));
	}

	public keys(): string[] {
		let keyStrings: string[] = [];
		let keys = new ValueRef(object_keys(this.value.rid)).asArray().toArray();
		for (let i = 0; i < keys.length; i++) {
			keyStrings.push(keys[i].toString());
		}
		return keyStrings;
	}

	public values(): ValueRef[] {
		return new ValueRef(object_values(this.value.rid)).asArray().toArray();
	}

	public toMap(): Map<string, ValueRef> {
		let keys = this.keys();
		let values = this.values();
		let result = new Map<string, ValueRef>();
		for (let i = 0; i < keys.length; i++) {
			result.set(keys[i].toString(), values[i]);
		}
		return result;
	}
}

export class ArrayRef {
	static new(): ArrayRef {
		return new ValueRef(create_array()).asArray();
	}

	constructor(public value: ValueRef) {}

	public get(index: number): ValueRef {
		return new ValueRef(array_get(this.value.rid, index as usize));
	}

	public set(index: number, value: ValueRef): void {
		array_set(this.value.rid, index as usize, value.rid);
	}

	public remove(index: number): void {
		array_remove(this.value.rid, index as usize);
	}

	public push(value: ValueRef): void {
		array_append(this.value.rid, value.rid);
	}

	public toArray(): ValueRef[] {
		let size = array_len(this.value.rid) as i32;
		let result: ValueRef[] = [];
		for (let i = 0; i < size; i++) {
			result.push(this.get(i));
		}
		return result;
	}
}
