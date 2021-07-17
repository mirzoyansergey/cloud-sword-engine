import {GarbageItemInterface} from "./garbage-item-interface";

export default class FindGarbageDetailsResponse {
    readonly items: Array<GarbageItemInterface>

    constructor(items: Array<GarbageItemInterface>) {
        this.items = items;
    }
}