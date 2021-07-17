import Ebs from '../domain/types/ebs';

export default class DetachedVolumesResponse {
  readonly items: Ebs[];
  readonly count: number;

  constructor(items: Ebs[]) {
    this.items = items;

    this.count = items.length;
  }
}
