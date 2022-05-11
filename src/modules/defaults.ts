import { ValueRef, array_len, array_get, destroy } from './std';

@external("defaults", "get")
declare function defualts_get(key: ArrayBuffer, length: usize): i32;
@external("defaults", "set")
declare function defualts_set(key: ArrayBuffer, length: usize, value: i32): void;

export namespace defaults {
	export function get(key: string): ValueRef {
        return new ValueRef(defualts_get(String.UTF8.encode(key), String.UTF8.byteLength(key)));
	}

	export function set(key: string, value: ValueRef): void {
        defualts_set(String.UTF8.encode(key), String.UTF8.byteLength(key), value.rid);
	}
}
