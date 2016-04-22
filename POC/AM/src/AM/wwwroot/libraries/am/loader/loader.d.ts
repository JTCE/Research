declare module am.loader {
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