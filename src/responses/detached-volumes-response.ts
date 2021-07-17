import Ebs from "../domain/types/ebs";

export default class DetachedVolumesResponse {
    readonly items: Array<Ebs>
    readonly count: number

    constructor(items: Array<Ebs>) {
        this.items = items;

        this.count = items.length;
    }
}