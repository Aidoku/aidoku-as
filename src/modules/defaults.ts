import { ValueRef } from './std';

// @ts-ignore: Decorators are usable here.
@external("defaults", "get")
declare function defualts_get(key: ArrayBuffer, length: usize): i32;
// @ts-ignore
@external("defaults", "set")
declare function defualts_set(key: ArrayBuffer, length: usize, value: i32): void;

/**
 * Interface for getting and setting user preferences.
 */
export namespace defaults {
	/**
	 * Returns the value associated with the specified defaults key.
	 */
	export function get(key: string): ValueRef {
        return new ValueRef(defualts_get(String.UTF8.encode(key), String.UTF8.byteLength(key)));
	}

	/**
	 * Sets the value of the specified defaults key.
	 */
	export function set(key: string, value: ValueRef): void {
        defualts_set(String.UTF8.encode(key), String.UTF8.byteLength(key), value.rid);
	}
}
