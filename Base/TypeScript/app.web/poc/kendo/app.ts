module app.services {
    export class DateService {
        monthNames: Array<string> = [
            'januari'
            , 'februari'
            , 'maart'
            , 'april'
            , 'mei'
            , 'juni'
            , 'juli'
            , 'augustus'
            , 'september'
            , 'oktober'
            , 'november'
            , 'december'
        ];

        weekDayShortNames: Array<string> = [
            'zo'
            , 'ma'
            , 'di'
            , 'wo'
            , 'do'
            , 'vr'
            , 'za'
        ];

        copyDate(date: Date) {
            var copy = new Date(date.getTime());
            copy.setHours(0);
            copy.setMinutes(0);
            copy.setSeconds(0);
            copy.setMilliseconds(0);
            return copy;
        }

        getFirstOfMonth(date: Date) {
            var result = this.copyDate(date);
            result.setDate(1);
            return result;
        }

        getFirstOfPreviousMonth(date: Date) {
            var result = this.getFirstOfMonth(date);
            result.setMonth(result.getMonth() - 1);
            return result;
        }

        getLastOfMonth(date: Date) {
            var result = this.copyDate(date);
            result.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
            return result;
        }

        getLastWeekDay(firstWeekDay: number) {
            var lastWeekDay = firstWeekDay - 1;
            if (lastWeekDay === -1) {
                lastWeekDay = 6;
            }
            return lastWeekDay;
        }

        getPrecedingDatesOfMonth(firstDateOfMonth: Date, firstWeekDay: number) {
            var dates: Array<Date> = [];
            var totalDaysToAdd = this.getTotalPrecedingDatesToAdd(firstDateOfMonth, firstWeekDay);

            for (var i = 0, length = totalDaysToAdd; i < totalDaysToAdd; i += 1) {
                var dateToAdd = this.copyDate(firstDateOfMonth);
                dateToAdd.setDate((i + 1) - totalDaysToAdd);
                dates.push(dateToAdd);
            }

            return dates;
        }

        getSucceedingDatesOfMonth(lastDateOfMonth: Date, firstWeekDay: number) {
            var dates: Array<Date> = [];
            var totalDaysToAdd = this.getTotalSucceedingDatesToAdd(lastDateOfMonth, firstWeekDay);

            for (var i = 0, length = totalDaysToAdd; i < totalDaysToAdd; i += 1) {
                var dateToAdd = this.copyDate(lastDateOfMonth);
                dateToAdd.setDate(lastDateOfMonth.getDate() + i + 1);
                dates.push(dateToAdd);
            }

            return dates;
        }

        getTotalPrecedingDatesToAdd(firstDateOfMonth: Date, firstWeekDay: number) {
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
        }

        getTotalSucceedingDatesToAdd(lastDateOfMonth: Date, firstWeekDay: number) {
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
        }
    }
}

module app.viewmodels {

    export class Calendar {
        dateService: app.services.DateService;
        months: Array<Month> = [];
        
        constructor(dateService?: app.services.DateService) {
            this.dateService = dateService || new app.services.DateService();
        }

        convertToDays(dates: Array<Date>) {
            var days: Array<app.viewmodels.Day> = [];
            for (var i = 1, length = dates.length; i <= length; i += 1) {
                var day = this.getDay(dates[i - 1], i);
                day.isDisabled = true;
                days.push(day);
            }
            return days;
        }

        getDaysOfMonth(month: app.viewmodels.Month) {
            var days: Array<app.viewmodels.Day> = [];
            var lastDateNumber = month.lastDate.getDate();
            var dayToProcess = month.firstDate;
            for (var i = 1, length = lastDateNumber; i <= lastDateNumber; i += 1) {
                var day = this.getDay(dayToProcess, i);
                days.push(day);
            }
            return days
        }

        getDays(month: app.viewmodels.Month) {
            var precedingDays = this.convertToDays(this.dateService.getPrecedingDatesOfMonth(month.firstDate, 1));
            var monthDays = this.getDaysOfMonth(month);
            var succeedingDays = this.convertToDays(this.dateService.getSucceedingDatesOfMonth(month.lastDate, 1));

            return precedingDays.concat(monthDays).concat(succeedingDays);
        }

        getDateToProcess(date: Date, counter: number, numberOfMonths: number) {
            var dateToProcess = this.dateService.copyDate(date);
            var monthNumber = dateToProcess.getMonth();
            dateToProcess.setMonth((monthNumber + 1 + counter) - numberOfMonths);
            return dateToProcess;
        }

        getDay(date: Date, counter: number) {
            var day = new app.viewmodels.Day();
            day.id = counter;
            day.date = this.dateService.copyDate(date);
            day.dayOfMonth = day.date.getDate();
            day.dayOfWeek = day.date.getDay();
            day.dayOfWeekShortName = this.dateService.weekDayShortNames[day.dayOfWeek];
            return day;
        }

        getMonth(dateInMonth: Date, counter: number) {
            var month = new app.viewmodels.Month();

            month.id = counter + 1;
            month.firstDate = this.dateService.getFirstOfMonth(dateInMonth);
            month.lastDate = this.dateService.getLastOfMonth(dateInMonth);
            month.title = this.dateService.monthNames[month.firstDate.getMonth()] + " " + month.firstDate.getFullYear().toString();
            month.days = this.getDays(month);

            return month;
        }

        initializeMonths(date: Date, numberOfMonths: number) {
            for (var i = 0, length = numberOfMonths; i < length; i += 1) {
                var dateToProcess = this.getDateToProcess(date, i, numberOfMonths);
                var month = this.getMonth(dateToProcess, i);
                this.months.push(month);
            }
        }
    }

    export class Month {
        days: Array<Day> = [];
        firstDate: Date;
        id: number;
        lastDate: Date;
        title: string;
    }

    export class Day {
        css = "";
        date: Date;
        dayOfMonth = 0;
        dayOfWeek = 0;
        dayOfWeekShortName = "";
        id: number;
        isDisabled = false;
        isError = false;
        isWarning = false;
        
    }
}

module app {
    "use strict";

    // Module
    function run() {
        kendo.culture("nl-NL");
    }
    angular.module("app", ["kendo.directives"]).run(run);

    export interface KalenderScope extends ng.IScope {
        vm: KalenderViewModel;
    }
    export class KalenderViewModel {
        title: string;

        jan: Date;
        feb: Date;
        mrt: Date;
        apr: Date;
        mei: Date;
        jun: Date;
        jul: Date;
        aug: Date;
        sep: Date;
        okt: Date;
        nov: Date;
        dec: Date;
    }

    // Controller
    function controller($scope: KalenderScope) {
        $scope.vm = new KalenderViewModel();
        $scope.vm.title = "Dit is een welkomst bericht."

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
}
