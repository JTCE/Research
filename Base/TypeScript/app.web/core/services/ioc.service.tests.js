/// <reference path="ioc.service.ts" />
// These are the tests.
describe("ioc.getComponentName", function () {
    var ioc = new app.services.IocService(null, null);
    it("basic test", function () {
        expect(ioc.getComponentName("app.dashboard.Dashboard")).toEqual("Dashboard");
    });
});
//# sourceMappingURL=ioc.service.tests.js.map