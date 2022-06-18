declare function print(message: ArrayBuffer, length: usize): void;

export namespace console {
	/**
	 * Print a message to the Aidoku logs.
	 */
	export function log(message: string): void {
		print(String.UTF8.encode(message), String.UTF8.byteLength(message));
	}
}
