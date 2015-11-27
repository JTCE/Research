/// <reference path="app.ts" />

describe("angularjs.calendar.services.DateService.getFirstOfPreviousMonth", function () {

    it("Should handle year transition", function () {
        var ds = new angularjs.calendar.services.DateService();
        var result = ds.getFirstOfPreviousMonth(new Date(2015, 0, 12, 0, 0, 0, 0));

        expect(new Date(2014, 11, 1, 0, 0, 0, 0)).toEqual(result);
    });
});

describe("angularjs.calendar.services.DateService.getPrecedingDatesOfMonth", function () {

    it("Should return correct preceding dates", function () {
        var ds = new angularjs.calendar.services.DateService();
        var date = new Date(2015, 6, 7, 0, 0, 0, 0);
        var firstDateOfMonth = ds.getFirstOfMonth(date);
        var dates = ds.getPrecedingDatesOfMonth(firstDateOfMonth, 1);
        expect(2).toEqual(dates.length);
        expect(new Date(2015, 5, 29, 0, 0, 0, 0)).toEqual(dates[0]);
    });
});

describe("angularjs.calendar.services.DateService.getSucceedingDatesOfMonth", function () {

    it("Should return correct succeeding dates", function () {
        var ds = new angularjs.calendar.services.DateService();
        var date = new Date(2015, 6, 7, 0, 0, 0, 0);
        var lastDateOfMonth = ds.getLastOfMonth(date);
        var dates = ds.getSucceedingDatesOfMonth(lastDateOfMonth, 1);
        expect(2).toEqual(dates.length);
        expect(new Date(2015, 7, 1, 0, 0, 0, 0)).toEqual(dates[0]);
    });
});

describe("angularjs.calendar.viewmodels.Calendar.initialize", function () {

    it("Should fill Calendar", function () {
        var calendar = new angularjs.calendar.viewmodels.Calendar();
        calendar.date = new Date();
        calendar.numberOfMonths = 12;
        calendar.initializeMonths();

        expect(12).toEqual(calendar.months.length);
    });
});