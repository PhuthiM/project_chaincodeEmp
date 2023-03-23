"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetTransferContract = void 0;
/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
const fabric_contract_api_1 = require("fabric-contract-api");
const json_stringify_deterministic_1 = __importDefault(require("json-stringify-deterministic"));
const sort_keys_recursive_1 = __importDefault(require("sort-keys-recursive"));
let AssetTransferContract = class AssetTransferContract extends fabric_contract_api_1.Contract {
    async InitLedger(ctx) {
        const assets = [
            {
                EmployeeId: "405096",
                Name: 'สมเกียรติ',
                Time_in: '08/03/2023 - 07:34:46',
                Time_out: '08/03/2023 - 07:34:46',
            },
            {
                EmployeeId: "405021",
                Name: 'มีนา',
                Time_in: '08/03/2023 - 08:03:34',
                Time_out: '08/03/2023 - 17:04:01',
            },
            {
                EmployeeId: "405039",
                Name: 'ถิรวัฒน์',
                Time_in: '08/03/2023 - 07:33:28',
                Time_out: '08/03/2023 - 17:26:09',
            },
            {
                EmployeeId: "405026",
                Name: 'กุสุมา',
                Time_in: '08/03/2023 - 07:48:35',
                Time_out: '08/03/2023 - 17:53:28',
            },
        ];
        for (const asset of assets) {
            // asset.EmployeeId = 'asset1';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.EmployeeId, Buffer.from(json_stringify_deterministic_1.default(sort_keys_recursive_1.default(asset))));
            console.info(`Asset ${asset.EmployeeId} initialized`);
        }
    }
    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, EmployeeId, Name, time_in, time_out) {
        const exists = await this.AssetExists(ctx, EmployeeId);
        if (exists) {
            throw new Error(`The asset ${EmployeeId} already exists`);
        }
        const asset = {
            EmployeeId: EmployeeId,
            Name: Name,
            Time_in: time_in,
            Time_out: time_out,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(EmployeeId, Buffer.from(json_stringify_deterministic_1.default(sort_keys_recursive_1.default(asset))));
    }
    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, Employee_id) {
        const assetJSON = await ctx.stub.getState(Employee_id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The id ${Employee_id} does not exist`);
        }
        return assetJSON.toString();
    }
    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, EmployeeId, Name, time_in, time_out) {
        const exists = await this.AssetExists(ctx, EmployeeId);
        if (!exists) {
            throw new Error(`The empId ${EmployeeId} does not exist`);
        }
        // overwriting original asset with new asset
        const updatedAsset = {
            EmployeeId: EmployeeId,
            Name: Name,
            Time_in: time_in,
            Time_out: time_out,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(EmployeeId, Buffer.from(json_stringify_deterministic_1.default(sort_keys_recursive_1.default(updatedAsset))));
    }
    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, Employee_id) {
        const exists = await this.AssetExists(ctx, Employee_id);
        if (!exists) {
            throw new Error(`The asset ${Employee_id} does not exist`);
        }
        return ctx.stub.deleteState(Employee_id);
    }
    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }
    async TransferAsset(ctx, EmployeeId, time_out) {
        const assetString = await this.ReadAsset(ctx, EmployeeId);
        const asset = JSON.parse(assetString);
        const timeOut = asset.Time_out;
        asset.Time_out = time_out;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(EmployeeId, Buffer.from(json_stringify_deterministic_1.default(sort_keys_recursive_1.default(asset))));
        return timeOut;
    }
    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            }
            catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
};
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "InitLedger", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "CreateAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "ReadAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "UpdateAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "DeleteAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "AssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "TransferAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], AssetTransferContract.prototype, "GetAllAssets", null);
AssetTransferContract = __decorate([
    fabric_contract_api_1.Info({ title: 'AssetTransfer', description: 'Smart contract for trading assets' })
], AssetTransferContract);
exports.AssetTransferContract = AssetTransferContract;
//# sourceMappingURL=assetTransfer.js.map