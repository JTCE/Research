
module angularjs.calendar {
    "use strict";

    angular.module("app", []);
}

module angularjs.calendar.services {
    "use strict";

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

        getWeekdays(firstDayOfWeek: number) {
            var days: Array<number> = [];

            for (var i = firstDayOfWeek; i < 7; i += 1) {
                days.push(i);
            }

            for (var i = 0; i < firstDayOfWeek; i += 1) {
                days.push(i);
            }

            return days;
        }
    }
}

module angularjs.calendar.viewmodels {
    "use strict";

    export class Calendar {
        date: Date;
        dateService: angularjs.calendar.services.DateService;
        months: Array<Month> = [];
        numberOfMonths: number;
                
        constructor(dateService?: angularjs.calendar.services.DateService) {
            this.dateService = dateService || new angularjs.calendar.services.DateService();
        }

        convertToDays(dates: Array<Date>) {
            var days: Array<angularjs.calendar.viewmodels.Day> = [];
            for (var i = 1, length = dates.length; i <= length; i += 1) {
                var day = this.getDay(dates[i - 1], i);
                day.isDisabled = true;
                days.push(day);
            }
            return days;
        }

        getDaysOfMonth(month: angularjs.calendar.viewmodels.Month) {
            var days: Array<angularjs.calendar.viewmodels.Day> = [];
            var lastDateNumber = month.lastDate.getDate();
            var dayToProcess = month.firstDate;
            for (var i = 1, length = lastDateNumber; i <= lastDateNumber; i += 1) {
                var day = this.getDay(dayToProcess, i);
                days.push(day);
                dayToProcess = this.dateService.copyDate(dayToProcess);
                dayToProcess.setDate(i + 1);
            }
            return days
        }

        getDays(month: angularjs.calendar.viewmodels.Month) {
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
            var day = new angularjs.calendar.viewmodels.Day();
            day.id = counter;
            day.date = this.dateService.copyDate(date);
            day.dayOfMonth = day.date.getDate();
            day.dayOfWeek = day.date.getDay();
            day.dayOfWeekShortName = this.dateService.weekDayShortNames[day.dayOfWeek];
            return day;
        }

        getMonth(dateInMonth: Date, counter: number) {
            var month = new angularjs.calendar.viewmodels.Month();

            month.id = counter + 1;
            month.firstDate = this.dateService.getFirstOfMonth(dateInMonth);
            month.lastDate = this.dateService.getLastOfMonth(dateInMonth);
            month.title = this.dateService.monthNames[month.firstDate.getMonth()] + " " + month.firstDate.getFullYear().toString();
            month.days = this.getDays(month);
            month.daysOfWeek = month.getDaysOfWeek();
            month.weeks = month.getWeeks();
            return month;
        }

        initializeMonths() {
            for (var i = 0, length = this.numberOfMonths; i < length; i += 1) {
                var dateToProcess = this.getDateToProcess(this.date, i, this.numberOfMonths);
                var month = this.getMonth(dateToProcess, i);
                this.months.push(month);
            }
        }
    }

    export class Month {
        dateService: angularjs.calendar.services.DateService;
        days: Array<Day> = [];
        daysOfWeek: Array<string> = [];
        firstDate: Date;
        id: number;
        lastDate: Date;
        title: string;
        weeks: Array<Week> = [];

        constructor(dateService?: angularjs.calendar.services.DateService) {
            this.dateService = dateService || new angularjs.calendar.services.DateService();
        }

        getWeeks() {
            var weeks: Array<Week> = [];

            var daysOfMonthView = '';
            while (this.days.length > 0) {
                var week = new angularjs.calendar.viewmodels.Week();
                var chunk = this.days.splice(0, 7)
                for (var i = 0, length = chunk.length; i < length; i += 1) {
                    week.days.push(chunk[i]);
                }
                weeks.push(week);
            }
            return weeks;
        }

        getDaysOfWeek() {
            var daysOfWeek: Array<string> = [];
            var weekdays = this.dateService.getWeekdays(1);
            for (var i = 0, length = weekdays.length; i < length; i += 1) {
                daysOfWeek.push(this.dateService.weekDayShortNames[weekdays[i]]);
            }
            return daysOfWeek;
        }
    }

    export class Week {
        days: Array<Day> = [];
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

module angularjs.calendar.controllers {

    export interface CalendarScope extends ng.IScope {
        vm: angularjs.calendar.viewmodels.Calendar;
    }

    function main($scope: CalendarScope) {
        var calendar = new angularjs.calendar.viewmodels.Calendar();
        calendar.date = new Date();
        calendar.numberOfMonths = 12;
        calendar.initializeMonths();
        $scope.vm = calendar;
    }
    angular
        .module("app")
        .controller("main", ["$scope", main]);
    
}
