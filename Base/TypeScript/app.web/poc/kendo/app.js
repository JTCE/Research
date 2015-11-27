var app;
(function (app) {
    var services;
    (function (services) {
        var DateService = (function () {
            function DateService() {
                this.monthNames = [
                    'januari',
                    'februari',
                    'maart',
                    'april',
                    'mei',
                    'juni',
                    'juli',
                    'augustus',
                    'september',
                    'oktober',
                    'november',
                    'december'
                ];
                this.weekDayShortNames = [
                    'zo',
                    'ma',
                    'di',
                    'wo',
                    'do',
                    'vr',
                    'za'
                ];
            }
            DateService.prototype.copyDate = function (date) {
                var copy = new Date(date.getTime());
                copy.setHours(0);
                copy.setMinutes(0);
                copy.setSeconds(0);
                copy.setMilliseconds(0);
                return copy;
            };
            DateService.prototype.getFirstOfMonth = function (date) {
                var result = this.copyDate(date);
                result.setDate(1);
                return result;
            };
            DateService.prototype.getFirstOfPreviousMonth = function (date) {
                var result = this.getFirstOfMonth(date);
                result.setMonth(result.getMonth() - 1);
                return result;
            };
            DateService.prototype.getLastOfMonth = function (date) {
                var result = this.copyDate(date);
                result.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
                return result;
            };
            DateService.prototype.getLastWeekDay = function (firstWeekDay) {
                var lastWeekDay = firstWeekDay - 1;
                if (lastWeekDay === -1) {
                    lastWeekDay = 6;
                }
                return lastWeekDay;
            };
            DateService.prototype.getPrecedingDatesOfMonth = function (firstDateOfMonth, firstWeekDay) {
                var dates = [];
                var totalDaysToAdd = this.getTotalPrecedingDatesToAdd(firstDateOfMonth, firstWeekDay);
                for (var i = 0, length = totalDaysToAdd; i < totalDaysToAdd; i += 1) {
                    var dateToAdd = this.copyDate(firstDateOfMonth);
                    dateToAdd.setDate((i + 1) - totalDaysToAdd);
                    dates.push(dateToAdd);
                }
                return dates;
            };
            DateService.prototype.getSucceedingDatesOfMonth = function (lastDateOfMonth, firstWeekDay) {
                var dates = [];
                var totalDaysToAdd = this.getTotalSucceedingDatesToAdd(lastDateOfMonth, firstWeekDay);
                for (var i = 0, length = totalDaysToAdd; i < totalDaysToAdd; i += 1) {
                    var dateToAdd = this.copyDate(lastDateOfMonth);
                    dateToAdd.setDate(lastDateOfMonth.getDate() + i + 1);
                    dates.push(dateToAdd);
                }
                return dates;
            };
            DateService.prototype.getTotalPrecedingDatesToAdd = function (firstDateOfMonth, firstWeekDay) {
                var totalDaysToAdd = 0;
                var firstDateOfMonthWeekDay = firstDateOfMonth.getDay();
                if (firstDateOfMonthWeekDay !== firstWeekDay) {
                    var totalDaysToAdd = 0;
                    if (firstWeekDay < firstDateOfMonthWeekDay) {
                        totalDaysToAdd = firstDateOfMonthWeekDay - firstWeekDay;
                    }
                    if (firstWeekDay > firstDateOfMonthWeekDay) {
                        totalDaysToAdd = (7 - firstWeekDay) + firstDateOfMonthWeekDay;
                    }
                }
                return totalDaysToAdd;
            };
            DateService.prototype.getTotalSucceedingDatesToAdd = function (lastDateOfMonth, firstWeekDay) {
                var totalDaysToAdd = 0;
                var lastWeekDay = this.getLastWeekDay(firstWeekDay);
                var lastDateOfMonthWeekDay = lastDateOfMonth.getDay();
                var monthIsFebruary = (lastDateOfMonth.getMonth() === 1);
                if (lastDateOfMonthWeekDay === lastWeekDay && monthIsFebruary) {
                    totalDaysToAdd = 7;
                }
                if (lastDateOfMonthWeekDay !== lastWeekDay) {
                    if (lastDateOfMonthWeekDay < lastWeekDay) {
                        totalDaysToAdd = (lastWeekDay + 1) - lastDateOfMonthWeekDay;
                    }
                    if (lastDateOfMonthWeekDay > firstWeekDay) {
                        totalDaysToAdd = (7 - lastDateOfMonthWeekDay);
                    }
                }
                return totalDaysToAdd;
            };
            return DateService;
        })();
        services.DateService = DateService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
var app;
(function (app) {
    var viewmodels;
    (function (viewmodels) {
        var Calendar = (function () {
            function Calendar(dateService) {
                this.months = [];
                this.dateService = dateService || new app.services.DateService();
            }
            Calendar.prototype.convertToDays = function (dates) {
                var days = [];
                for (var i = 1, length = dates.length; i <= length; i += 1) {
                    var day = this.getDay(dates[i - 1], i);
                    day.isDisabled = true;
                    days.push(day);
                }
                return days;
            };
            Calendar.prototype.getDaysOfMonth = function (month) {
                var days = [];
                var lastDateNumber = month.lastDate.getDate();
                var dayToProcess = month.firstDate;
                for (var i = 1, length = lastDateNumber; i <= lastDateNumber; i += 1) {
                    var day = this.getDay(dayToProcess, i);
                    days.push(day);
                }
                return days;
            };
            Calendar.prototype.getDays = function (month) {
                var precedingDays = this.convertToDays(this.dateService.getPrecedingDatesOfMonth(month.firstDate, 1));
                var monthDays = this.getDaysOfMonth(month);
                var succeedingDays = this.convertToDays(this.dateService.getSucceedingDatesOfMonth(month.lastDate, 1));
                return precedingDays.concat(monthDays).concat(succeedingDays);
            };
            Calendar.prototype.getDateToProcess = function (date, counter, numberOfMonths) {
                var dateToProcess = this.dateService.copyDate(date);
                var monthNumber = dateToProcess.getMonth();
                dateToProcess.setMonth((monthNumber + 1 + counter) - numberOfMonths);
                return dateToProcess;
            };
            Calendar.prototype.getDay = function (date, counter) {
                var day = new app.viewmodels.Day();
                day.id = counter;
                day.date = this.dateService.copyDate(date);
                day.dayOfMonth = day.date.getDate();
                day.dayOfWeek = day.date.getDay();
                day.dayOfWeekShortName = this.dateService.weekDayShortNames[day.dayOfWeek];
                return day;
            };
            Calendar.prototype.getMonth = function (dateInMonth, counter) {
                var month = new app.viewmodels.Month();
                month.id = counter + 1;
                month.firstDate = this.dateService.getFirstOfMonth(dateInMonth);
                month.lastDate = this.dateService.getLastOfMonth(dateInMonth);
                month.title = this.dateService.monthNames[month.firstDate.getMonth()] + " " + month.firstDate.getFullYear().toString();
                month.days = this.getDays(month);
                return month;
            };
            Calendar.prototype.initializeMonths = function (date, numberOfMonths) {
                for (var i = 0, length = numberOfMonths; i < length; i += 1) {
                    var dateToProcess = this.getDateToProcess(date, i, numberOfMonths);
                    var month = this.getMonth(dateToProcess, i);
                    this.months.push(month);
                }
            };
            return Calendar;
        })();
        viewmodels.Calendar = Calendar;
        var Month = (function () {
            function Month() {
                this.days = [];
            }
            return Month;
        })();
        viewmodels.Month = Month;
        var Day = (function () {
            function Day() {
                this.css = "";
                this.dayOfMonth = 0;
                this.dayOfWeek = 0;
                this.dayOfWeekShortName = "";
                this.isDisabled = false;
                this.isError = false;
                this.isWarning = false;
            }
            return Day;
        })();
        viewmodels.Day = Day;
    })(viewmodels = app.viewmodels || (app.viewmodels = {}));
})(app || (app = {}));
var app;
(function (app) {
    "use strict";
    // Module
    function run() {
        kendo.culture("nl-NL");
    }
    angular.module("app", ["kendo.directives"]).run(run);
    var KalenderViewModel = (function () {
        function KalenderViewModel() {
        }
        return KalenderViewModel;
    })();
    app.KalenderViewModel = KalenderViewModel;
    // Controller
    function controller($scope) {
        $scope.vm = new KalenderViewModel();
        $scope.vm.title = "Dit is een welkomst bericht.";
        $scope.vm.jan = new Date(2015, 0, 1);
        $scope.vm.feb = new Date(2015, 1, 1);
        $scope.vm.mrt = new Date(2015, 2, 1);
        $scope.vm.apr = new Date(2015, 3, 1);
        $scope.vm.mei = new Date(2015, 4, 1);
        $scope.vm.jun = new Date(2015, 5, 1);
        $scope.vm.jul = new Date(2015, 6, 1);
        $scope.vm.aug = new Date(2015, 7, 1);
        $scope.vm.sep = new Date(2014, 8, 1);
        $scope.vm.okt = new Date(2014, 9, 1);
        $scope.vm.nov = new Date(2014, 10, 1);
        $scope.vm.dec = new Date(2014, 11, 1);
    }
    angular
        .module("app")
        .controller("main", ["$scope", controller]);
})(app || (app = {}));
//# sourceMappingURL=app.js.map