declare module am.nano {

    interface IFetchAndEvalInfo {
        onFetchAndEvalSuccess: () => void;
    }

    interface IFetchErrorResult {
        additionalData?: any;
        error: Error;
    }

    interface IFetchOptions {
        additionalData?: any;
        authorization?: boolean;
        onError?: (result: IFetchErrorResult) => void; // When not supplied, the error is thrown.
        onSuccess: (result: IFetchSuccessResult) => void;
        url: string;
    }
    
    interface IFetchSuccessResult {
        additionalData?: any;
        data: string;
    }

    interface ILoadInfo {
        counter: number;
        done: (info: ILoadInfo) => void,
        mod: IModule,
        normalizedName: string;
        parentInfo?: ILoadInfo,
        total: number;
    }

    interface IModule {
        deps: Array<string>;
        dependants: any;
        execute: () => void;
        proxy: any;
        update: (moduleName: any, moduleObj: any) => void;
        values: any;
    }   
}