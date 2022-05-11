declare function print(message: ArrayBuffer, length: usize): void;

export namespace console {
	export function log(message: string): void {
		print(String.UTF8.encode(message), String.UTF8.byteLength(message));
	}
}
