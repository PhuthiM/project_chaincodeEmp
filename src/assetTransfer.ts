/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { Asset } from './asset';

@Info({ title: 'AssetTransfer', description: 'Smart contract for trading assets' })
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
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
            await ctx.stub.putState(asset.EmployeeId, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.EmployeeId} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreateAsset(ctx: Context, EmployeeId: string, Name: string, time_in: string, time_out: string): Promise<void> {
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
        await ctx.stub.putState(EmployeeId, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadAsset(ctx: Context, Employee_id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(Employee_id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The id ${Employee_id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdateAsset(ctx: Context, EmployeeId: string, Name: string, time_in: string, time_out: string): Promise<void> {
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
        return ctx.stub.putState(EmployeeId, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteAsset(ctx: Context, Employee_id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, Employee_id);
        if (!exists) {
            throw new Error(`The asset ${Employee_id} does not exist`);
        }
        return ctx.stub.deleteState(Employee_id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    @Transaction()
    public async TransferAsset(ctx: Context, EmployeeId: string, time_out: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, EmployeeId);
        const asset = JSON.parse(assetString);
        const timeOut = asset.Time_out;
        asset.Time_out = time_out;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(EmployeeId, Buffer.from(stringify(sortKeysRecursive(asset))));
        return timeOut;
    }
    
    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
