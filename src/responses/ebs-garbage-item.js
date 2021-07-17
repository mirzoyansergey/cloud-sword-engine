"use strict";
exports.__esModule = true;
var resource_type_1 = require("../domain/resource-type");
var EbsGarbageItem = /** @class */ (function () {
    function EbsGarbageItem(name, size) {
        this.type = resource_type_1.ResourceType.EBS;
        this.name = name;
        this.size = size;
    }
    EbsGarbageItem.fromEbs = function (ebs) {
        return new EbsGarbageItem(ebs.id, ebs.size);
    };
    EbsGarbageItem.prototype.getName = function () {
        return this.name;
    };
    EbsGarbageItem.prototype.getType = function () {
        return this.type;
    };
    EbsGarbageItem.prototype.getPrice = function () {
        return 4.104 * this.size;
    };
    return EbsGarbageItem;
}());
exports["default"] = EbsGarbageItem;
