import { Configuration } from './configuration';

export interface AdapterInterface {
  findAllEC2Instances(config: Configuration, tag: string): void;
}
