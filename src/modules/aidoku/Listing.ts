import { object_get, read_string, string_len } from "../std"

export class Listing {
	public name: string;

	constructor(public rid: i32) {
		let textRid = object_get(this.rid, String.UTF8.encode("name"), 4);
		let len = string_len(textRid) as i32;
		if (len <= 0) {
			this.name = "";
		} else {
			let buff = new ArrayBuffer(len);
			read_string(textRid, buff, len);
			this.name = String.UTF8.decode(buff);
		}
	}
}
