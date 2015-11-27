

module vanilla.calendar.services {
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

    export class RenderService {

        // We except "{{name}}" as "{{ name }}" in template placeholders.
        replace(template: string, name:string, value: string) {    
            var regEx = new RegExp("{{\\s*" + name + "\\s*}}", "g");
            var result = template.replace(regEx, value);
            return result;
        }
    }
}

module vanilla.calendar.components {
    "use strict";

    export interface IComponent {
        renderService: vanilla.calendar.services.RenderService;
        render(selector?:string);
    }

    export class Calendar implements IComponent {
        date: Date;
        dateService: vanilla.calendar.services.DateService;
        months: Array<Month> = [];
        numberOfMonths: number;
        renderService: vanilla.calendar.services.RenderService;
                
        constructor(dateService?: vanilla.calendar.services.DateService, renderService?: vanilla.calendar.services.RenderService) {
            this.dateService = dateService || new vanilla.calendar.services.DateService();
            this.renderService = renderService || new vanilla.calendar.services.RenderService();
        }

        convertToDays(dates: Array<Date>) {
            var days: Array<vanilla.calendar.components.Day> = [];
            for (var i = 1, length = dates.length; i <= length; i += 1) {
                var day = this.getDay(dates[i - 1], i);
                day.isDisabled = true;
                days.push(day);
            }
            return days;
        }

        getDaysOfMonth(month: vanilla.calendar.components.Month) {
            var days: Array<vanilla.calendar.components.Day> = [];
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

        getDays(month: vanilla.calendar.components.Month) {
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
            var day = new vanilla.calendar.components.Day();
            day.id = counter;
            day.date = this.dateService.copyDate(date);
            day.dayOfMonth = day.date.getDate();
            day.dayOfWeek = day.date.getDay();
            day.dayOfWeekShortName = this.dateService.weekDayShortNames[day.dayOfWeek];
            return day;
        }

        getMonth(dateInMonth: Date, counter: number) {
            var month = new vanilla.calendar.components.Month();

            month.id = counter + 1;
            month.firstDate = this.dateService.getFirstOfMonth(dateInMonth);
            month.lastDate = this.dateService.getLastOfMonth(dateInMonth);
            month.title = this.dateService.monthNames[month.firstDate.getMonth()] + " " + month.firstDate.getFullYear().toString();
            month.days = this.getDays(month);

            return month;
        }

        initializeMonths() {
            this.months = [];
            for (var i = 0, length = this.numberOfMonths; i < length; i += 1) {
                var dateToProcess = this.getDateToProcess(this.date, i, this.numberOfMonths);
                var month = this.getMonth(dateToProcess, i);
                this.months.push(month);
            }
        }

        render(selector?: string) {            
            var elements = document.getElementsByTagName("calendar");
            var element = elements[0];
            for (var i = 0, length = elements.length; i < length; i += 1) {
                this.renderCalendar(elements[i]);
            }
        }

        renderCalendar(element: Node) {
            var result = '';
            for (var i = 0, length = this.months.length; i < length; i += 1) {
                result += this.months[i].render();
            }
            this.replaceCalendar(result, element);
        }

        replaceCalendar(content: string, oldCalendarElement: Node) {
            var newCalendarElement = document.createElement('calendar');
            newCalendarElement.innerHTML = content;
            var parentDiv = oldCalendarElement.parentNode;
            parentDiv.replaceChild(newCalendarElement, oldCalendarElement);      
        }
    }

    export class Month implements IComponent {
        dateService: vanilla.calendar.services.DateService;
        days: Array<Day> = [];
        firstDate: Date;
        id: number;
        lastDate: Date;
        renderService: vanilla.calendar.services.RenderService;
        template = '<month>'
        + ' <div class="header">{{title}}</div>'
        + ' <table>'
        + '     <thead>'
        + '         <tr>'
        + '             {{daysOfWeek}}'
        + '         </tr>'
        + '     </thead>'
        + '     <tbody>{{daysOfMonth}}</tbody>'
        + ' </table>'
        + '</month>'
        ;
        templateDayOfWeek = '<th>{{dayOfWeek}}</th>';
        title: string;

        constructor(dateService?: vanilla.calendar.services.DateService, renderService?: vanilla.calendar.services.RenderService) {
            this.dateService = dateService || new vanilla.calendar.services.DateService();
            this.renderService = renderService || new vanilla.calendar.services.RenderService();
        }

        getDaysOfMonthView() {
            var daysOfMonthView = '';
            while (this.days.length > 0) {
                daysOfMonthView += '<tr>';
                var chunk = this.days.splice(0, 7)
                for (var i = 0, length = chunk.length; i < length; i += 1) {
                    daysOfMonthView += chunk[i].render();
                }
                daysOfMonthView += '</tr>';
            }
            return daysOfMonthView;
        }

        getDaysOfWeekView() {
            var daysOfWeekView = '';
            var weekdays = this.dateService.getWeekdays(1);
            for (var i = 0, length = weekdays.length; i < length; i += 1) {
                daysOfWeekView += this.renderService.replace(this.templateDayOfWeek, 'dayOfWeek', this.dateService.weekDayShortNames[weekdays[i]]);
            }
            return daysOfWeekView;
        }

        render(selector?: string) {
            var result = this.renderService.replace(this.template, 'title', this.title);

            var daysOfWeekView = this.getDaysOfWeekView();
            result = this.renderService.replace(result, 'daysOfWeek', daysOfWeekView);

            var daysOfMonthView = this.getDaysOfMonthView();
            result = this.renderService.replace(result, 'daysOfMonth', daysOfMonthView);
                                    
            return result;
        }
    }

    export class Day implements IComponent {
        css = "";
        date: Date;
        dayOfMonth = 0;
        dayOfWeek = 0;
        dayOfWeekShortName = "";
        id: number;
        isDisabled = false;
        isError = false;
        isWarning = false;
        renderService: vanilla.calendar.services.RenderService;
        template = '<td class="{{css}}"><div class="circle">{{dayOfMonth}}</div></td>';

        constructor(renderService?: vanilla.calendar.services.RenderService) {
            this.renderService = renderService || new vanilla.calendar.services.RenderService();
        }

        render(selector?: string) {
            this.css = (this.isDisabled) ? "disabled" : this.css;
            var view = this.renderService.replace(this.template, 'css', this.css);
            view = this.renderService.replace(view, 'dayOfMonth', this.dayOfMonth.toString());
            return view;
        }
    }
}

module vanilla.calendar {
    "use strict";

    declare var html2canvas: any;
    declare var jsPDF: any;
    
    export class App {
        calendar: vanilla.calendar.components.Calendar;

        start() {
            this.calendar = new vanilla.calendar.components.Calendar();
            this.calendar.date = new Date();
            this.calendar.numberOfMonths = 12;
            this.calendar.initializeMonths();
            this.calendar.render();
        }

        print() {
            var self = this;
            html2canvas(document.body, {
                onrendered: function (canvas) {
                    document.body.appendChild(canvas);
                    self.savePDF();
                }
            });
        }

        savePDF() {
            var canvas: any = document.getElementsByTagName('canvas')[0];
            var imgData = canvas.toDataURL(
                'image/png');
            var doc = new jsPDF('p', 'mm');
            doc.addImage(imgData, 'PNG', 10, 10);
            doc.save('sample-file.pdf');
        }    
        
        update() {
            this.calendar.date.setMonth(this.calendar.date.getMonth() + 1);
            this.calendar.initializeMonths();
            this.calendar.render();
        }
    }
}

var myApp = new vanilla.calendar.App();
myApp.start();
