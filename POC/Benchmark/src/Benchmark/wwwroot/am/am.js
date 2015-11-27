var am;
(function (am) {
    var App = (function () {
        function App(ioc) {
            this.ioc = ioc;
        }
        App.prototype.registerTypes = function () {
            this.ioc.register("am.IUIEventHandler", UIEventHandler, []);
        };
        App.prototype.start = function () {
            console.log("Benchmark v2 started.");
            this.registerTypes();
            var handler = this.ioc.resolve("am.IUIEventHandler");
            handler.start();
        };
        return App;
    })();
    var Appointment = (function () {
        function Appointment() {
        }
        return Appointment;
    })();
    var Ioc = (function () {
        function Ioc() {
            this._items = {};
        }
        Ioc.prototype.register = function (name, fn, dependencies) {
            this._items[name] = new IocItem(name, fn, dependencies);
        };
        Ioc.prototype.resolve = function (name) {
            var item = this._items[name];
            if (item === null) {
                throw "Type " + name + " was not registered on the IoC containter.";
            }
            var args = item.dependencies || [];
            args = args.map(this.resolve);
            var instance = new (Function.prototype.bind.apply(item.fn, args));
            return instance;
        };
        return Ioc;
    })();
    var IocItem = (function () {
        function IocItem(name, fn, dependencies) {
            this.name = name;
            this.fn = fn;
            this.dependencies = dependencies;
        }
        return IocItem;
    })();
    var Store = (function () {
        function Store() {
            this._items = {};
            this._changes = {};
        }
        Store.prototype.addItem = function (change) {
            this._items[change.itemKey] = change.item;
        };
        Store.prototype.deleteItem = function (change) {
            throw "Not implemented.";
        };
        Store.prototype.getItem = function (key) {
            var item = this._items[key];
            if (item === null) {
                throw "Store item " + key + " was not found.";
            }
            return item;
        };
        Store.prototype.saveChange = function (change) {
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
        };
        Store.prototype.save = function (changes) {
            changes.map(this.saveChange);
        };
        Store.prototype.updateField = function (change) {
            throw "Not implemented.";
        };
        Store.prototype.updateItem = function (change) {
            throw "Not implemented.";
        };
        return Store;
    })();
    var StoreChange = (function () {
        function StoreChange(key, itemKey, item, fieldNames, action, saveTo) {
            this.key = key;
            this.itemKey = itemKey;
            this.item = item;
            this.fieldNames = fieldNames;
            this.action = action;
            this.saveTo = saveTo;
        }
        return StoreChange;
    })();
    var StoreChangeAction;
    (function (StoreChangeAction) {
        StoreChangeAction[StoreChangeAction["AddItem"] = 0] = "AddItem";
        StoreChangeAction[StoreChangeAction["DeleteItem"] = 1] = "DeleteItem";
        StoreChangeAction[StoreChangeAction["UpdateField"] = 2] = "UpdateField";
        StoreChangeAction[StoreChangeAction["UpdateItem"] = 3] = "UpdateItem";
    })(StoreChangeAction || (StoreChangeAction = {}));
    var StoreChangeSaveType;
    (function (StoreChangeSaveType) {
        StoreChangeSaveType[StoreChangeSaveType["Client"] = 0] = "Client";
        StoreChangeSaveType[StoreChangeSaveType["ClientAndServer"] = 1] = "ClientAndServer";
        StoreChangeSaveType[StoreChangeSaveType["None"] = 2] = "None";
        StoreChangeSaveType[StoreChangeSaveType["Server"] = 3] = "Server";
    })(StoreChangeSaveType || (StoreChangeSaveType = {}));
    var UIEventHandler = (function () {
        function UIEventHandler() {
            this._ticking = false;
            this._touchDetected = false;
        }
        UIEventHandler.prototype.addEventListeners = function () {
            document.addEventListener("click", this.handleClick.bind(this), true);
            document.addEventListener("touchstart", this.handleTouchStart.bind(this), true);
        };
        UIEventHandler.prototype.handleClick = function (ev) {
            if (!this._touchDetected) {
                document.body.appendChild(document.createTextNode("click event"));
                this.handleEvent(ev);
            }
        };
        UIEventHandler.prototype.handleEvent = function (ev) {
            // Only save last event of a specific type on a specific element
            // When animationframe ends check if there are events to process.
            // If there are events to process process them.
            var test = "";
        };
        UIEventHandler.prototype.handleTouchStart = function (ev) {
            this._touchDetected = true;
            document.body.appendChild(document.createTextNode("Touch start event"));
            this.handleEvent(ev);
        };
        UIEventHandler.prototype.start = function () {
            this.addEventListeners();
        };
        return UIEventHandler;
    })();
    var a = new App(new Ioc());
    a.start();
})(am || (am = {}));
//# sourceMappingURL=am.js.map