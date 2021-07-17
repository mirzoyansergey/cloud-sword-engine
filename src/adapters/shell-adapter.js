"use strict";
exports.__esModule = true;
exports.ShellAdapter = void 0;
var find_garbage_response_1 = require("../responses/find-garbage-response");
var find_garbage_details_response_1 = require("../responses/find-garbage-details-response");
var ebs_1 = require("../domain/types/ebs");
var ebs_garbage_item_1 = require("../responses/ebs-garbage-item");
var delete_garbage_response_1 = require("../responses/delete-garbage-response");
var detached_volumes_response_1 = require("../responses/detached-volumes-response");
var child_process_1 = require("child_process");
var fs = require('fs');
var ShellAdapter = /** @class */ (function () {
    function ShellAdapter(custodian) {
        this.custodian = custodian;
    }
    ShellAdapter.prototype.findGarbage = function (config) {
        var count = 0;
        var detachedVolumesResponse = this.findDetachedVolumes(config);
        count += detachedVolumesResponse.count;
        return new find_garbage_response_1["default"](count);
    };
    ShellAdapter.prototype.findGarbageDetails = function (config) {
        var items = new Array();
        var detachedVolumesResponse = this.findDetachedVolumes(config);
        detachedVolumesResponse.items.forEach(function (ebs) {
            items.push(ebs_garbage_item_1["default"].fromEbs(ebs));
        });
        return new find_garbage_details_response_1["default"](items);
    };
    ShellAdapter.prototype.deleteGarbage = function (config, volumes) {
        var items = new Array();
        var detachedVolumesResponse = this.deleteDetachedVolumes(config);
        detachedVolumesResponse.items.forEach(function (ebs) {
            items.push(ebs_garbage_item_1["default"].fromEbs(ebs));
        });
        return new delete_garbage_response_1["default"](items);
    };
    ShellAdapter.prototype.findDetachedVolumes = function (config) {
        //add temp policy file
        child_process_1.exec(" echo '" +
            "        policies:\n" +
            "           - name: ebs-collect-unattached\n" +
            "             resource: ebs\n" +
            "             filters:\n" +
            "               - Attachments: []' > test.yaml");
        //execute
        child_process_1.exec("AWS_DEFAULT_REGION=" + config.region + " AWS_ACCESS_KEY_ID=" + config.accessKeyId + " AWS_SECRET_ACCESS_KEY=" + config.secretAccessKey + " " + this.custodian + " run --output-dir=.  test.yaml", function (error, stdout, stderr) {
            if (error) {
                console.log("error: " + error.message);
                return;
            }
        });
        //check if this will throw anything?
        var responseJson = JSON.parse(fs.readFileSync('./ebs-collect-unattached/resources.json', 'utf8'));
        //check validate response
        return new detached_volumes_response_1["default"](responseJson.map(function (ebsResponseItemJson) {
            return new ebs_1["default"](ebsResponseItemJson.VolumeId, ebsResponseItemJson.Size, ebsResponseItemJson.AvailabilityZone, ebsResponseItemJson.CreateTime);
        }));
    };
    ShellAdapter.prototype.deleteDetachedVolumes = function (config, volume) {
        child_process_1.exec(" echo '" +
            "        policies:\n" +
            "           - name: delete-unattached-volumes\n" +
            "             resource: ebs\n" +
            "             filters:\n" +
            "               - Attachments: []\n" +
            "               - State: available\n" +
            "             actions:\n" +
            "               - delete' > test.yaml");
        if (volume) {
        }
        else {
        }
        //execute
        child_process_1.exec("AWS_DEFAULT_REGION=" + config.region + " AWS_ACCESS_KEY_ID=" + config.accessKeyId + " AWS_SECRET_ACCESS_KEY=" + config.secretAccessKey + " " + this.custodian + " run --output-dir=.  test.yaml", function (error, stdout, stderr) {
            if (error) {
                console.log("error: " + error.message);
                return;
            }
        });
        //check if this will throw anything?
        var responseJson = JSON.parse(fs.readFileSync('./delete-unattached-volumes/resources.json', 'utf8'));
        //check validate response
        return new detached_volumes_response_1["default"](responseJson.map(function (ebsResponseItemJson) {
            return new ebs_1["default"](ebsResponseItemJson.VolumeId, ebsResponseItemJson.Size, ebsResponseItemJson.AvailabilityZone, ebsResponseItemJson.CreateTime);
        }));
    };
    return ShellAdapter;
}());
exports.ShellAdapter = ShellAdapter;
