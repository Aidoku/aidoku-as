import { ValueRef, ObjectRef, object_get } from "../std";

export enum FilterType {
	Base = 0,
	Group = 1,
	Text = 2,
	Check = 3,
	Select = 4,
	Sort = 5,
	SortSelection = 6,
	Title = 7,
	Author = 8,
	Genre = 9
}

export class Filter {
	public type: FilterType;
	public name: string;

	constructor(public object: ObjectRef) {
		this.type = object.get("type").toInteger() as i32;
		this.name = object.get("name").toString();
	}

	get value(): ValueRef {
		return this.object.get("value");
	}
}
