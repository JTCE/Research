module am {

    interface IApp {
        start();
    }

    class App implements IApp {

        constructor(public ioc: Ioc) {
        }

        registerTypes() {
            this.ioc.register("am.IUIEventHandler", UIEventHandler, []);
        }

        start() {
            console.log("Benchmark v2 started.");

            this.registerTypes();

            var handler = this.ioc.resolve("am.IUIEventHandler");
            handler.start();
        }
    }

    class Appointment {

    }

    interface IHashTable<T> {
        [key: string]: T;
    }

    

    interface IStore {
        getItem(key: string): any;
        save(changes: Array<StoreChange>);
    }

    class Store implements IStore {
        private _items: IHashTable<any> = {};
        private _changes: IHashTable<StoreChange> = {};

        addItem(change: StoreChange) {
            this._items[change.itemKey] = change.item;
        }

        deleteItem(change: StoreChange) {
            throw "Not implemented.";
        }

        getItem(key: string): any {
            var item = this._items[key];
            
            if (item === null) {
                throw "Store item " + key + " was not found.";
            }

            return item;
        }

        saveChange(change: StoreChange) {

            if (change.saveTo !== StoreChangeSaveType.None) {
                this._changes[change.key] = change;
            }

            // TODO: switch can be changed to dynamic function call.
            switch (change.action) {
                case StoreChangeAction.AddItem:
                    this.addItem(change);
                    break;
                case StoreChangeAction.DeleteItem:
                    this.deleteItem(change);
                    break;
                case StoreChangeAction.UpdateField:
                    this.updateField(change);
                    break;
                case StoreChangeAction.UpdateItem:
                    this.updateItem(change);
                    break;
                default:
                    throw "Invalid store change action.";
                    break;
            }
        }

        save(changes: Array<StoreChange>) {
            changes.map(this.saveChange);
        }

        updateField(change: StoreChange) {
            throw "Not implemented.";
        }

        updateItem(change: StoreChange) {
            throw "Not implemented.";
        }
    }

    class StoreChange {
        constructor(public key: string, public itemKey: string, public item: any, public fieldNames: Array<string>, public action: StoreChangeAction, public saveTo: StoreChangeSaveType) {
        }
    }

    enum StoreChangeAction {
        AddItem,
        DeleteItem,
        UpdateField,
        UpdateItem
    }

    enum StoreChangeSaveType {
        Client,
        ClientAndServer,
        None,
        Server
    }

    interface IUIEventHandler {
        start();
    }
        
    class UIEventHandler implements IUIEventHandler {
        private _ticking: boolean = false;
        private _touchDetected: boolean = false;

        constructor() {
        }

        addEventListeners() {
            document.addEventListener("click", this.handleClick.bind(this), true);
            document.addEventListener("touchstart", this.handleTouchStart.bind(this), true);
        }

        handleClick(ev: MouseEvent) {
            if (!this._touchDetected) {
                document.body.appendChild(document.createTextNode("click event"));
                this.handleEvent(ev);
            }
        }

        handleEvent(ev: Event) {
            // Only save last event of a specific type on a specific element
            // When animationframe ends check if there are events to process.
            // If there are events to process process them.
            var test = "";
        }

        handleTouchStart(ev: TouchEvent) {
            this._touchDetected = true;
            document.body.appendChild(document.createTextNode("Touch start event"));
            this.handleEvent(ev);
        }

        start() {
            this.addEventListeners();



        }
    }

    var a = new App(new Ioc());
    a.start();
}
