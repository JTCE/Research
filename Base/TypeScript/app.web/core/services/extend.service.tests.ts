
describe("app.services.extendService.extend", function () {

    //it("general test", function () {
    //    var value = "2015-05-05";
    //    var iso8601RegEx = /^(\d{4})-(\d{2})-(\d{2})(?:(T|\s)(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([\-+])(\d{2}):(\d{2}))?)?$/;
    //    var matches = value.match(iso8601RegEx)

    //    expect(1).toEqual(1);
    //});

    it("date string '2015-07-10' should be converted to date object", function () {
        var a = {
            datum: null
        }

        var b = {
            datum: "2015-07-10"
        }

        var service = new app.services.ExtendService(new app.services.ValidationService());
        a = service.extend(a, b);
        expect(a.datum).toEqual(new Date(2015, 6, 10, 0, 0, 0, 0));
    });

    it("date string '2015-07-10T03:10:10.999Z' should be converted to date object", function () {
        var a = {
            datum: null
        }

        var b = {
            datum: "2015-07-10T03:10:10.999Z"
        }

        var service = new app.services.ExtendService(new app.services.ValidationService());
        a = service.extend(a, b);
        expect(a.datum).toEqual(new Date(2015, 6, 10, 3, 10, 10, 999));
    });

    it("date string '2015-07-13T00:00:00' should be converted to date object", function () {
        var a = {
            datum: null
        }

        var b = {
            datum: "2015-07-13T00:00:00"
        }

        var service = new app.services.ExtendService(new app.services.ValidationService());
        a = service.extend(a, b);
        expect(a.datum).toEqual(new Date(2015, 6, 13, 0, 0, 0, 0));
    });
    
})