export class Configuration {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  region: string = 'us-west-1';

  constructor(accessKeyId: string, secretAccessKey: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
  }
}
