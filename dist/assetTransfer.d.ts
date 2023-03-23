import { Context, Contract } from 'fabric-contract-api';
export declare class AssetTransferContract extends Contract {
    InitLedger(ctx: Context): Promise<void>;
    CreateAsset(ctx: Context, EmployeeId: string, Name: string, time_in: string, time_out: string): Promise<void>;
    ReadAsset(ctx: Context, Employee_id: string): Promise<string>;
    UpdateAsset(ctx: Context, EmployeeId: string, Name: string, time_in: string, time_out: string): Promise<void>;
    DeleteAsset(ctx: Context, Employee_id: string): Promise<void>;
    AssetExists(ctx: Context, id: string): Promise<boolean>;
    TransferAsset(ctx: Context, EmployeeId: string, time_out: string): Promise<string>;
    GetAllAssets(ctx: Context): Promise<string>;
}
