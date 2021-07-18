import { Configuration } from '../configuration';
import { FindGarbageResponse } from '../responses/find-garbage-response';
import { FindGarbageDetailsResponse } from '../responses/find-garbage-details-response';
import { DetachedVolumesResponse } from '../responses/detached-volumes-response';

export interface AdapterInterface {
  findGarbage(config: Configuration): FindGarbageResponse;

  findGarbageDetails(config: Configuration): FindGarbageDetailsResponse;

  findDetachedVolumes(config: Configuration): DetachedVolumesResponse;

  deleteDetachedVolumes(config: Configuration, volumes: string[]): DetachedVolumesResponse;
}
