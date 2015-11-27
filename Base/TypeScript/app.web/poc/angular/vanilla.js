var vanilla;
(function (vanilla) {
    var services;
    (function (services) {
        "use strict";
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
            DateService.prototype.getWeekdays = function (firstDayOfWeek) {
                var days = [];
                for (var i = firstDayOfWeek; i < 7; i += 1) {
                    days.push(i);
                }
                for (var i = 0; i < firstDayOfWeek; i += 1) {
                    days.push(i);
                }
                return days;
            };
            return DateService;
        })();
        services.DateService = DateService;
        var RenderService = (function () {
            function RenderService() {
            }
            // We except "{{name}}" as "{{ name }}" in template placeholders.
            RenderService.prototype.replace = function (template, name, value) {
                var regEx = new RegExp("{{\\s*" + name + "\\s*}}", "g");
                var result = template.replace(regEx, value);
                return result;
            };
            return RenderService;
        })();
        services.RenderService = RenderService;
    })(services = vanilla.services || (vanilla.services = {}));
})(vanilla || (vanilla = {}));
var vanilla;
(function (vanilla) {
    var components;
    (function (components) {
        "use strict";
        var Calendar = (function () {
            function Calendar(dateService, renderService) {
                this.months = [];
                this.dateService = dateService || new vanilla.services.DateService();
                this.renderService = renderService || new vanilla.services.RenderService();
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
                    dayToProcess = this.dateService.copyDate(dayToProcess);
                    dayToProcess.setDate(i + 1);
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
                var day = new vanilla.components.Day();
                day.id = counter;
                day.date = this.dateService.copyDate(date);
                day.dayOfMonth = day.date.getDate();
                day.dayOfWeek = day.date.getDay();
                day.dayOfWeekShortName = this.dateService.weekDayShortNames[day.dayOfWeek];
                return day;
            };
            Calendar.prototype.getMonth = function (dateInMonth, counter) {
                var month = new vanilla.components.Month();
                month.id = counter + 1;
                month.firstDate = this.dateService.getFirstOfMonth(dateInMonth);
                month.lastDate = this.dateService.getLastOfMonth(dateInMonth);
                month.title = this.dateService.monthNames[month.firstDate.getMonth()] + " " + month.firstDate.getFullYear().toString();
                month.days = this.getDays(month);
                return month;
            };
            Calendar.prototype.initializeMonths = function () {
                for (var i = 0, length = this.numberOfMonths; i < length; i += 1) {
                    var dateToProcess = this.getDateToProcess(this.date, i, this.numberOfMonths);
                    var month = this.getMonth(dateToProcess, i);
                    this.months.push(month);
                }
            };
            Calendar.prototype.render = function (selector) {
                var elements = document.getElementsByTagName("calendar");
                var element = elements[0];
                for (var i = 0, length = elements.length; i < length; i += 1) {
                    this.renderCalendar(elements[i]);
                }
            };
            Calendar.prototype.renderCalendar = function (element) {
                var result = '';
                for (var i = 0, length = this.months.length; i < length; i += 1) {
                    result += this.months[i].render();
                }
                var wrapper = document.createElement('div');
                wrapper.innerHTML = result;
                element.appendChild(wrapper);
            };
            return Calendar;
        })();
        components.Calendar = Calendar;
        var Month = (function () {
            function Month(dateService, renderService) {
                this.days = [];
                this.template = '<month>' + ' <div class="header">{{title}}</div>' + ' <table>' + '     <thead>' + '         <tr>' + '             {{daysOfWeek}}' + '         </tr>' + '     </thead>' + '     <tbody>{{daysOfMonth}}</tbody>' + ' </table>' + '</month>';
                this.templateDayOfWeek = '<th>{{dayOfWeek}}</th>';
                this.dateService = dateService || new vanilla.services.DateService();
                this.renderService = renderService || new vanilla.services.RenderService();
            }
            Month.prototype.getDaysOfMonthView = function () {
                var daysOfMonthView = '';
                while (this.days.length > 0) {
                    daysOfMonthView += '<tr>';
                    var chunk = this.days.splice(0, 7);
                    for (var i = 0, length = chunk.length; i < length; i += 1) {
                        daysOfMonthView += chunk[i].render();
                    }
                    daysOfMonthView += '</tr>';
                }
                return daysOfMonthView;
            };
            Month.prototype.getDaysOfWeekView = function () {
                var daysOfWeekView = '';
                var weekdays = this.dateService.getWeekdays(1);
                for (var i = 0, length = weekdays.length; i < length; i += 1) {
                    daysOfWeekView += this.renderService.replace(this.templateDayOfWeek, 'dayOfWeek', this.dateService.weekDayShortNames[weekdays[i]]);
                }
                return daysOfWeekView;
            };
            Month.prototype.render = function (selector) {
                var result = this.renderService.replace(this.template, 'title', this.title);
                var daysOfWeekView = this.getDaysOfWeekView();
                result = this.renderService.replace(result, 'daysOfWeek', daysOfWeekView);
                var daysOfMonthView = this.getDaysOfMonthView();
                result = this.renderService.replace(result, 'daysOfMonth', daysOfMonthView);
                return result;
            };
            return Month;
        })();
        components.Month = Month;
        var Day = (function () {
            function Day(renderService) {
                this.css = "";
                this.dayOfMonth = 0;
                this.dayOfWeek = 0;
                this.dayOfWeekShortName = "";
                this.isDisabled = false;
                this.isError = false;
                this.isWarning = false;
                this.template = '<td class="{{css}}">{{dayOfMonth}}</td>';
                this.renderService = renderService || new vanilla.services.RenderService();
            }
            Day.prototype.render = function (selector) {
                this.css = (this.isDisabled) ? "disabled" : this.css;
                var view = this.renderService.replace(this.template, 'css', this.css);
                view = this.renderService.replace(view, 'dayOfMonth', this.dayOfMonth.toString());
                return view;
            };
            return Day;
        })();
        components.Day = Day;
    })(components = vanilla.components || (vanilla.components = {}));
})(vanilla || (vanilla = {}));
var vanilla;
(function (vanilla) {
    "use strict";
    var App = (function () {
        function App() {
        }
        App.prototype.start = function () {
            var calendar = new vanilla.components.Calendar();
            calendar.date = new Date();
            calendar.numberOfMonths = 12;
            calendar.initializeMonths();
            calendar.render();
        };
        return App;
    })();
    vanilla.App = App;
    var app = new vanilla.App();
    app.start();
})(vanilla || (vanilla = {}));
//# sourceMappingURL=vanilla.js.map