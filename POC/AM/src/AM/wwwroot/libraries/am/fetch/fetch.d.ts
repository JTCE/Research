declare module am.fetch {
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
}