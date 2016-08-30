/**
 * This file is part of the "FnordMetric" project
 *   Copyright (c) 2014 Laura Schlimmer
 *   Copyright (c) 2014 Paul Asmuth, Google Inc.
 *
 * FnordMetric is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License v3.0. You should have received a
 * copy of the GNU General Public License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 */
var CalendarComponent = function() {
  var kNumDaysPerWeek = 7;
  var kNumWeeks = 6;
  var now = new Date();

  var default_opts = {
    /* the month to render */
    month: now.getMonth(),
    /* the year to render */
    year: now.getFullYear(),
    selection: {
      /* the timestamp of the begin of the selection */
      begin: null,
      /* the timestamp of the end of the selection */
      end: null
    },
    translations: {
      months: ["January", "February", "March", "April", "June", "July",
          "August","September", "November", "Dezember"],
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  };


  var opts;
  var this_;

  this.createdCallback = function() {
    this_ = this;
    var tpl = zTemplateUtil.getTemplate("z-calendar-base-tpl");
    this.appendChild(tpl);

    this.init();
  };

  this.setConfig = function(config) {
    opts = zObjectUtil.merge(config, default_opts);
  }

  this.render = function() {
    if (!zObjectUtil.isObject(opts)) {
      opts = default_opts;
    }

    var body = this_.querySelector("tbody");
    console.log(this_, body);
    zDomUtil.clearChildren(body);

    /* render weekdays header */
    var header = document.createElement("tr");
    for (var i = 0; i < kNumDaysPerWeek; i++) {
      var td = document. createElement("td");
      td.innerHTML = opts.translations.weekdays[i] ?
          opts.translations.weekdays[i] : default_opts.translations.weekdays[i];

      header.appendChild(td);
    }

    body.appendChild(header);

    /* get the days of the previous month*/
    var tr = document.createElement("tr");
    var rendered_days = renderDaysOfPreviousMonth(tr);
    body.appendChild(tr);

    /* render weeks of month to display */
    var days_in_month = zDateUtil.daysInMonth(opts.month, opts.year);
    var day = 0;
    for (var i = 0; i < kNumWeeks && day < days_in_month; i++) {
      tr = document.createElement("tr");

      for (var j = 0; j < kNumDaysPerWeek && day < days_in_month; j++) {
        var td = document.createElement("td");
        day++
        td.innerHTML = day;
        tr.appendChild(td);
      }

      body.appendChild(tr);
      tr = null;
    }

    rendered_days += days_in_month;

    /* render days of next month */
    var days_left = kNumWeeks * kNumDaysPerWeek - rendered_days;
    for (var i = 0; i < days_left; i++) {
      if (tr == null) {
        tr = document.createElement("tr");
        body.appendChild(tr);
      }

      var td = document.createElement("td");
      td.innerHTML = i + 1;
      tr.appendChild(td);
    }
  }


/***************************** private *********************************/

  var renderDaysOfPreviousMonth = function(tr) {
    /* month and year of the previous month */
    var prev_month = opts.month == 0 ? 11 : opts.month - 1;
    var year_prev_month = opts.month == 11 ? 11 : opts.month - 1;
    var days_in_prev_month = zDateUtil.daysInMonth(prev_month, year_prev_month);

    /* day of the week (0-6) of the first day of the month to render */
    var weekday = new Date(opts.year, opts.month).getDay();

    //FIXME
    if (weekday == 0) weekday = 6;
    if (weekday == 1) weekday = 7;

    var i = 0;
    for ( ; i < weekday; i++) {
      var td = document.createElement("td");
      td.innerHTML = days_in_prev_month - i;
      tr.appendChild(td);
    }

    return i;
  }

  this.init = function() {
    //this.render(this.getTimeStamp('data-timestamp'));

    //if (this.getAttribute('data-month-header') != "false") {
    //  this.observeMonthSelectors();
    //}
  };

  //render previous/next month onclick
  this.observeMonthSelectors = function() {
    var base = this;
    this.querySelector(".fa-chevron-left").onclick = function() {
      base.render(
        DateUtil.getMonthTimestamp(base.date.month, base.date.year, -1));
    };

    this.querySelector(".fa-chevron-right").onclick = function() {
      base.render(
        DateUtil.getMonthTimestamp(base.date.month, base.date.year, 1));
    };
  };


  this.renderMonthHeader = function() {

    if (this.getAttribute('data-month-header') != "false") {
      this.querySelector('.month_header').innerHTML = 
        human_month[this.date.month] + " " + this.date.year;
    } else {
      //without month header
      this.querySelector("table tbody").removeChild(
        this.querySelector("tr[name='month_header']")
      );
    }
  };

  this.renderWeeks = function() {
    var current_date = this.renderFirstWeek();

    for (var week = 1; week < 6; week++) {
      var tr_elem = this.querySelector(".week" + week);
      tr_elem.innerHTML = "";

      for (var day = 0; day < 7; day++) {
        //all days of current month are rendered
        if (current_date > this.date.num_days) {
          return this.renderLastWeeks(day, week, tr_elem);
        }

        tr_elem.appendChild(
          this.renderDayElem(current_date, this.date.month_timestamp, true));

        current_date++;
      }
    }
  };

  //returns last rendered date of current month
  this.renderFirstWeek = function() {
    //inidcates whether days of prev months should be displayed or not
    var preview = this.hasAttribute('data-preview')?
      this.getAttribute('data-preview') : true;

    var prev_month =
      DateUtil.getMonthTimestamp(this.date.month, this.date.year, -1);

    var prev_dates = this.datesOfPrevMonth(prev_month);
    var current_date = 1;
    var tr_elem = this.querySelector(".week0");
    tr_elem.innerHTML = '';

    //render last days of previous month
    for (var i = 0; i < prev_dates.length; i++) {
      tr_elem.appendChild(
        this.renderDayElem(prev_dates[i], prev_month, preview));
    };

    //render first days of current month
    for (day = prev_dates.length; day < 7; day ++) {
      tr_elem.appendChild(
        this.renderDayElem(current_date, this.date.month_timestamp, true));
      current_date++;
    }

    return current_date;
  };

  this.renderLastWeeks = function(day, week, tr_elem) {
    //inidcates whether days of next months should be displayed or not
    var preview = this.hasAttribute('data-preview')?
      this.getAttribute('data-preview') : true;

    var next_month =
      DateUtil.getMonthTimestamp(this.date.month, this.date.year, 1);
    var current_date = 1;

    //add for remaining weekdays of week days of next month
    for (; day < 7; day++) {
      tr_elem.appendChild(
        this.renderDayElem(current_date, next_month, preview));

      current_date++;
    }

    //render week with days of next month
    for (week++; week < 6; week++) {
      var tr_elem = this.querySelector(".week" + week);
      tr_elem.innerHTML = "";

      for (day = 0; day < 7; day++) {
        tr_elem.appendChild(
          this.renderDayElem(current_date, next_month, preview));

        current_date++;
      }
    }
  };

  this.renderDayElem = function(date, month_timestamp, displayed) {
    var td_elem = document.createElement("td");

    if (displayed && displayed != "false") {
      var timestamp = month_timestamp + (date - 1) * DateUtil.millisPerDay;

      td_elem.className = this.tdClassName(date, month_timestamp);

      if (this.isSelectable(date, month_timestamp)) {
        td_elem.classList.add("selectable");
        this.handleDateLinks(td_elem, date, month_timestamp);
      }


      td_elem.innerHTML = date;
    }

    return td_elem;
  };

  this.isSelectable = function(date, month_timestamp) {
    var now = Date.now();
    var timestamp = month_timestamp + (date - 1) * DateUtil.millisPerDay;
    var period = this.getAttribute('data-selectable');

    if (period == "past") {
      return (timestamp < now);
    }

    if (period == "future") {
      return (timestamp > now);
    }

    return true;
  };

  this.tdClassName = function(date, month_timestamp) {
    var now = Date.now();
    var timestamp = month_timestamp + (date - 1) * DateUtil.millisPerDay;
    var name = "";

    // date isn't in current month
    if (month_timestamp !== this.date.month_timestamp) {
      name += " bright";
    }

    // date is today
    if (DateUtil.isSameDay(now, timestamp)) {
      name += " highlight_border";
    }

    if (this.hasAttribute('data-from') || this.hasAttribute('data-until')) {

      var from = this.hasAttribute('data-from') ?
        this.getTimeStamp('data-from') : null;
      var until = this.hasAttribute('data-until') ?
        this.getTimeStamp('data-until') : null;

      if ((from && until && timestamp >= from && timestamp <= until) ||
          (from && !until && timestamp >= from) ||
          (until && !from && timestamp <= until) ||
          DateUtil.isSameDay(from, timestamp) ||
          DateUtil.isSameDay(until, timestamp)) {
            name+= " colored";
      }

    }

    if (this.hasAttribute('data-selected')) {
      var selected_dates = [this.getTimeStamp('data-selected')];

      for (var i = 0; i < selected_dates.length; i++) {
        // date is selected date
        if (DateUtil.isSameDay(selected_dates[i], timestamp)) {
          name += " highlight";
          break;
        }
      }
    }

    return name;
  };

  //timestamp -> beginning of last month
  this.datesOfPrevMonth = function(timestamp) {
    var dates = [];

    if (this.date.first_day == 0) {
      return dates;
    }

    var date = new Date(timestamp);
    var num_days = DateUtil.daysInMonth(date.getMonth() + 1, date.getYear());

    for (var i = this.date.first_day - 1; i >= 0; i--) {
      dates.push(num_days - i);
    }

    return dates;
  };

  this.getTimeStamp = function(attr) {
    return DateUtil.parseTimestamp(this.getAttribute(attr));
  };

  this.handleDateLinks = function(td_elem, date, month_timestamp) {
    var base = this;
    var timestamp = month_timestamp + (date - 1) * DateUtil.millisPerDay;

    td_elem.onclick = function() {
      base.setAttribute("data-timestamp", timestamp);
      base.setAttribute("data-selected", timestamp);
      base.fireDateSelectEvent(timestamp, this.classList.toString());
    };
  };

  this.fireDateSelectEvent = function(timestamp, classList) {
    var dateEvent = new CustomEvent(
      'z-calendar-select', {
        'detail': {
          'timestamp': timestamp,
          'classList' : classList
        },
        bubbles: true,
        cancealable: true
      }
    );

    this.dispatchEvent(dateEvent);
  };
};

var proto = Object.create(HTMLElement.prototype);
CalendarComponent.apply(proto);
document.registerElement("z-calendar", { prototype: proto });
