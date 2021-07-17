import { AdapterInterface } from './adapter-interface';
import { Configuration } from '../configuration';
import FindGarbageResponse from '../responses/find-garbage-response';
import FindGarbageDetailsResponse from '../responses/find-garbage-details-response';
import { GarbageItemInterface } from '../responses/garbage-item-interface';
import Ebs from '../domain/types/ebs';
import EbsGarbageItem from '../responses/ebs-garbage-item';
import DetachedVolumesResponse from '../responses/detached-volumes-response';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import * as fs from 'fs';
import * as policies from '../policy.json';

export class ShellAdapter implements AdapterInterface {
  private readonly custodian: string;

  constructor(custodian: string) {
    this.custodian = custodian;
  }

  findGarbage(config: Configuration): FindGarbageResponse {
    const detachedVolumesResponse = this.findDetachedVolumes(config);
    return new FindGarbageResponse(detachedVolumesResponse.count);
  }

  findGarbageDetails(config: Configuration): FindGarbageDetailsResponse {
    const items: GarbageItemInterface[] = new Array<GarbageItemInterface>();

    const detachedVolumesResponse = this.findDetachedVolumes(config);
    detachedVolumesResponse.items.forEach((ebs: Ebs) => {
      items.push(EbsGarbageItem.fromEbs(ebs));
    });

    return new FindGarbageDetailsResponse(items);
  }

  findDetachedVolumes(config: Configuration): DetachedVolumesResponse {
    const policyName = 'ebs-collect-unattached';
    const policy: any = Object.assign({}, policies[policyName]);

    // execute custodian command
    const responseJson = this.executeCustodianCommand(config, policy, policyName);

    // remove temp files and folders
    this.removeTempFoldersAndFiles(policyName);

    return this.generateDetachedVolumesResponse(responseJson);
  }

  deleteDetachedVolumes(config: Configuration, volumes: string[]) {
    const policyName = 'delete-unattached-volumes';
    const policy: any = Object.assign({}, policies[policyName]);
    if (volumes.length) {
      policy.policies[0].filters = [
        {
          type: "value",
          key: "VolumeId",
          op: "in",
          value: volumes,
        },
      ];
    }
    fs.writeFileSync('./temp.yaml', yaml.dump(policy), 'utf8');

    // execute custodian command
    const responseJson = this.executeCustodianCommand(config, policy, policyName);

    return this.generateDetachedVolumesResponse(responseJson);
  }

  executeCustodianCommand(config: Configuration, policy: any, policyName: string) {
    fs.writeFileSync('./temp.yaml', yaml.dump(policy), 'utf8');
    try {
      execSync(
        `AWS_DEFAULT_REGION=${config.region} AWS_ACCESS_KEY_ID=${config.accessKeyId} AWS_SECRET_ACCESS_KEY=${config.secretAccessKey} ${this.custodian} run --output-dir=.  temp.yaml`,
      );
    } catch (e) {
      throw new Error(e.message);
    }

    const resourcesPath = `./${policyName}/resources.json`;
    if (!fs.existsSync(resourcesPath)) {
      throw new Error(`./${policyName}/resources.json file does not exist.`);
    }
    const data = JSON.parse(fs.readFileSync(resourcesPath, 'utf8'));

    // remove temp files and folders
    this.removeTempFoldersAndFiles(policyName);

    return data;
  }

  private removeTempFoldersAndFiles(policyName: string) {
    if (!fs.existsSync(`./${policyName}`)) {
      execSync(`rm -r ./${policyName}`);
    }
    if (!fs.existsSync(`./temp.yaml`)) {
      execSync(`rm ./temp.yaml`);
    }
  }

  private generateDetachedVolumesResponse(responseJson: any): DetachedVolumesResponse {
    return new DetachedVolumesResponse(
      responseJson.map(
        (ebsResponseItemJson: { VolumeId: string; Size: number; AvailabilityZone: string; CreateTime: string }) => {
          return new Ebs(
            ebsResponseItemJson.VolumeId,
            ebsResponseItemJson.Size,
            ebsResponseItemJson.AvailabilityZone,
            ebsResponseItemJson.CreateTime,
          );
        },
      ),
    );
  }
}
