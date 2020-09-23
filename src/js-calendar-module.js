import { Calendar } from 'calendar';

import dayjs from 'dayjs';

import { Str2Mustache } from '@yama-dev/js-parse-module/libs/str2mustache';
import { Str2DateFormat } from '@yama-dev/js-parse-module/libs/str2dateformat';

export class CALENDAR_MODULE {
  constructor(options = {}) {
    // Set Version.
    this.Version = process.env.VERSION;

    // Use for discrimination by URL.
    this.CurrentUrl = location.href;

    // Data Calendar(HTML).
    this.HtmlCalendar = '';

    // Date Now.
    this.NowDt = dayjs();
    this.SetDt = dayjs();

    // Adjust option template.
    if (!options.template) options.template = {};
    if (!options.template.title) options.template.title = '<span class="year">{{year}}</span>/<span class="month">{{month_str}}</span>';
    if (!options.template.title_week) options.template.title_week = '<span>{{week}}</span>';
    if (!options.template.date) options.template.date = '<div class="{{class_name}}">{{date}} {{date_data}}</div>';
    if (!options.template.date_data) options.template.date_data = '<div class="date_data"><div class="title">{{title}}</div><div class="article">{{article}}</div></div>';

    // Set config, options.
    this.Config = {
      elem: options.elem || '.js-calendar',
      elem_title: options.elem_title || '.js-calendar-title',
      elem_title_week: options.elem_title_week || '.js-calendar-title-week',
      elem_content: options.elem_content || '.js-calendar-content',

      year: options.year || this.NowDt.year(),
      month: options.month || this.NowDt.month() + 1,
      month_id: options.month - 1 || this.NowDt.month(),
      date: options.month || this.NowDt.date(),

      template: {
        title: options.template.title || null,
        title_week: options.template.title_week || null,
        date: options.template.date || null,
        date_data: options.template.date_data || null
      },

      day_of_week_list: options.day_of_week_list || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      monday_start: options.monday_start === true ? 1 : null,

      auto_render: options.auto_render === false ? false : true,

      classname: {
        today: 'u-is-today',
        date: 'js-calendar-item',
        date_disable: 'u-hidden',
        date_hasevent: 'u-has-eventdata',
        date_noevent: 'u-no-eventdata'
      },

      schedule_data: options.schedule_data || null
    };

    this.State = {
      week_data: null,
      calendar_data: null,
    };

    // Set callback functions.
    if (!options.on) options.on = {};
    this.on = {
      Change: options.on.Change || '',
      Load: options.on.Load || '',
      Prev: options.on.Prev || '',
      Next: options.on.Next || ''
    };

    // Set Day-Of-Week list. (for Display)
    let _day_of_week_list = this.Config.day_of_week_list.concat();
    if(this.Config.monday_start){
      let _shift = _day_of_week_list.shift();
      _day_of_week_list.push(_shift);
    }
    this.State.week_data = _day_of_week_list;

    // Data Calendar(obj).
    this.CalendarData = new Calendar(this.Config.monday_start).monthDays(this.Config.year, this.Config.month_id);

    // DebugMode
    if (this.CurrentUrl.search(/localhost/) !== -1 || this.CurrentUrl.search(/192.168/) !== -1) {
      this.DebugMode();
    }

    // CacheElement
    this.CacheElement();

    // Create&Set Calendar
    this.State.calendar_data = this.CreateCalendarData(false);
    // Create&Set Calendar (html)
    this.HtmlCalendar = this.CreateCalendarData();

    // Render Calendar.
    this.Render();

    // Event On Load.
    this.OnLoad();
  }

  DebugMode() {
    console.log(this);
  }

  StrYear() {
    return `${this.Config.year}`;
  }
  StrMonth() {
    return `${this.Config.month}`;
  }
  HtmlTitle() {
    let _obj = {
      year: this.SetDt.year(),
      month: this.SetDt.month() + 1,
      month_str: this.SetDt.format('MM'),
      month_str_en_short: this.SetDt.format('MMM'),
      month_str_en_short_lower: this.SetDt.format('MMM').toLowerCase(),
      month_str_en: this.SetDt.format('MMMM'),
      month_str_en_lower: this.SetDt.format('MMMM').toLowerCase(),
      day_of_week_str_en: this.SetDt.format('dddd'),
      month_id: this.SetDt.month(),
      date: this.SetDt.date(),
      date_str: this.SetDt.format('DD')
    };
    let _return = '';
    if(typeof this.Config.template.title === 'function' ){
      let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
      _return = Str2Mustache(this.Config.template.title(_date), _obj);
    } else {
      _return = Str2Mustache(this.Config.template.title, _obj);
    }

    return _return;
  }
  HtmlTitleWeek() {
    let _return = '';

    this.State.week_data.map(val => {
      let _obj = {
        week: val
      };
      if(typeof this.Config.template.title_week === 'function' ){
        let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
        _return += Str2Mustache(this.Config.template.title_week(_date), _obj);
      } else {
        _return += Str2Mustache(this.Config.template.title_week, _obj);
      }
    });

    return _return;
  }

  static AnalyzeDate(y, m, d = 1) {
    if(d <= 0 || d >= 32){
      return {
        current: {
          year: y,
          month: m + 1,
          month_str: '',
          month_str_en: '',
          day_of_week_str_en: '',
          month_id: m,
          date: '',
          date_str: '',
          date_str_en: ''
        }
      };
    }
    let _dt = dayjs(`${y}/${m + 1}/${d}`);
    let _dtPrev = dayjs(`${y}/${m + 1}/${d}`).subtract(1, 'month');
    let _dtNext = dayjs(`${y}/${m + 1}/${d}`).add(1, 'month');

    let _return = {
      current: {
        year: _dt.year(),
        month: _dt.month() + 1,
        month_str: _dt.format('MM'),
        month_str_en: _dt.format('MMMM'),
        day_of_week_str_en: _dt.format('dddd'),
        month_id: _dt.month(),
        date: _dt.date(),
        date_str: _dt.format('DD')
      },
      prev: {
        year: _dtPrev.year(),
        month: _dtPrev.month() + 1,
        month_str: _dtPrev.format('MM'),
        month_str_en: _dtPrev.format('MMMM'),
        day_of_week_str_en: _dtPrev.format('dddd'),
        month_id: _dtPrev.month(),
        date: _dtPrev.date(),
        date_str: _dtPrev.format('DD')
      },
      next: {
        year: _dtNext.year(),
        month: _dtNext.month() + 1,
        month_str: _dtNext.format('MM'),
        month_str_en: _dtNext.format('MMMM'),
        day_of_week_str_en: _dtNext.format('dddd'),
        month_id: _dtNext.month(),
        date: _dtNext.date(),
        date_str: _dtNext.format('DD')
      }
    };

    return _return;
  }

  CacheElement() {
    this.$uiElem = document.querySelector(this.Config.elem);
    this.$uiElemContent = document.querySelector(this.Config.elem_content);
    this.$uiElemTitle = document.querySelector(this.Config.elem_title);
    this.$uiElemTitleWeek = document.querySelector(this.Config.elem_title_week);
  }

  CreateCalendarData(toHtml = true) {
    let _data = [];
    let _data_html = '';

    // Create Calendar HTML data for one month.
    this.CalendarData.map((val_week, index_week) => {
      this.CalendarData[index_week].map((val_date, index_date) => {
        let _class_name = this.Config.classname.date;
        let _date_event_data = this.GetEventData(this.Config.year, this.Config.month_id, val_date, false);
        let _date_day_of_week = this.Config.day_of_week_list[index_date % 7];

        // On Today.
        if (
          val_date === this.NowDt.date() &&
          this.Config.year === this.NowDt.year() &&
          this.Config.month_id === this.NowDt.month()
        ) {
          _class_name += ` ${this.Config.classname.today}`;
        }

        // Not this Month.
        if (!val_date) _class_name += ` ${this.Config.classname.date_disable}`;

        // When has event data.
        if (_date_event_data.length) {
          _class_name += ` ${this.Config.classname.date_hasevent}`;
        } else {
          _class_name += ` ${this.Config.classname.date_noevent}`;
        }

        let _class_name_parent = '';

        let _date_event = [];
        let _date_event_html = '';

        if(_date_event_data.length){
          // Create Event data.
          _date_event_data.map((val, index) => {
            if(val.category_en){
              _class_name_parent += ` u-has-${val.category_en}`;
            }
            _date_event.push(val);
            _date_event_html += Str2Mustache(this.Config.template.date_data, val);
          });
          _class_name += _class_name_parent;
        }

        let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id, val_date).current;

        // Create Calendar HTML data for one day.
        let obj = Object.assign(_date,
          {
            index: index_date,
            class_name: _class_name,
            day_of_week: _date_day_of_week,
            date_data: _date_event_html,
            date_data_ary: _date_event
          }
        );
        if (toHtml) {
          _data_html += Str2Mustache(this.Config.template.date, obj);
        } else {
          _data.push(obj);
        }
      });
    });
    let _return = '';
    if (toHtml) {
      _return = _data_html;
    } else {
      _return = _data;
    }

    return _return;
  }

  GetEventData(y = this.NowDt.year(), m = this.NowDt.month(), d = this.NowDt.date(), toHtml = false) {
    /**
     * 1日のイベントを取得
     *
     * @attribute y
     * @type int
     * @default [now year]
     *
     * @attribute m
     * @type int
     * @default [now month] *Start From 0
     *
     * @attribute d
     * @type int
     * @default [now d]
     *
     * @attribute toHtml
     * @type boolean
     * @default false
     */

    // Invalid value return.
    if (d == 0) return [];

    let _dt_set = dayjs(`${y}/${m + 1}/${d}`);
    let _dt = '';
    let _event_item = [];
    let _event_item_html = '';

    this.Config.schedule_data.map((val, index) => {
      let _d = Str2DateFormat(val.date);

      if (_d.split('-')[0].match(/\d{4}/)) {
        _dt = dayjs(_d);
        if (
          _dt_set.year() == _dt.year() &&
          _dt_set.month() == _dt.month() &&
          _dt_set.date() == _dt.date()
        ) {
          if (toHtml) {
            _event_item_html += Str2Mustache(this.Config.template.date_data, val);
          } else {
            _event_item.push(val);
          }
        }
      } else {
        // 年の指定がない場合(毎年と判断)

        // 当年でフォーマットを整形
        _d = this.NowDt.year() + '-' + _d;
        _dt = dayjs(_d);

        if (_dt_set.month() == _dt.month() && _dt_set.date() == _dt.date()) {
          if (toHtml) {
            _event_item_html += Str2Mustache(this.Config.template.date_data, val);
          } else {
            _event_item.push(val);
          }
        }
      }
    });

    let _return = '';
    if (toHtml) {
      _return = _event_item_html;
    } else {
      _return = _event_item;
    }

    return _return;
  }

  GetEventDataCount(obj) {
    /**
     * 指定した個数のイベントを取得
     *
     * @attribute y
     * @type int
     * @default [now year]
     *
     * @attribute m
     * @type int
     * @default [now month] *Start From 0
     *
     * @attribute d
     * @type int
     * @default [now d]
     *
     * @attribute c
     * @type int
     * @default 10
     *
     * @attribute countType
     * @type str
     * @default 'number'
     *
     * @attribute toHtml
     * @type boolean
     * @default false
     */

    const {
      year: y,
      month,
      month_id = null,
      month_str = null,
      day: d,
      count: c,
      countType = 'number',
      toHtml,
    } = obj;

    let m = month;
    if(month_id) m = month_id;
    if(month_str) m = Number(month_str) - 1;

    // Invalid value return.
    if (d == 0) return [];

    let _dt_set = dayjs(`${y}/${m + 1}/${d}`);
    let _dt = '';
    let _event_item = [];
    let _event_item_html = '';

    let _set_item_count = 0;

    this.Config.schedule_data.map((val, index) => {
      let _d = Str2DateFormat(val.date);

      if (_d.split('-')[0].match(/\d{4}/)) {
        _dt = dayjs(_d);
      } else {
        // 年の指定がない場合(毎年と判断)
        // 当年でフォーマットを整形
        _d = this.NowDt.year() + '-' + _d;
        _dt = dayjs(_d);
      }

      if(_dt.diff(_dt_set) >= 0 && _set_item_count < c){
        if(countType === 'number'){
          // 個数カウントの場合

          _set_item_count++;

          _event_item_html += Str2Mustache(this.Config.template.date_data, val);
          _event_item.push(val);

        } else if(countType === 'day' || countType === 'week' || countType === 'month' || countType === 'year'){
          // 特定の期間でカウントの場合

          let _dt_end = _dt_set.add(c-1, countType);

          if(_dt.diff(_dt_end) <= 0){
            _event_item_html += Str2Mustache(this.Config.template.date_data, val);
            _event_item.push(val);
          }
        }
      }
    });

    let _return = '';
    if (toHtml) {
      _return = _event_item_html;
    } else {
      _return = {
        result: _event_item,
        html: _event_item_html
      };

      if(countType === 'day' || countType === 'week' || countType === 'month' || countType === 'year'){
        let _dt_prev = _dt_set.subtract(c+1, countType);
        let _dt_next = _dt_set.add(c, countType);

        _return.prev_data = {
          date: _dt_prev.format(),
          year: _dt_prev.year(),
          month: _dt_prev.month(),
          month_id: _dt_prev.month(),
          month_str: _dt_prev.month()+1,
          day: _dt_prev.date(),
        };

        _return.next_data = {
          date: _dt_next.format(),
          year: _dt_next.year(),
          month: _dt_next.month(),
          month_id: _dt_next.month(),
          month_str: _dt_next.month()+1,
          day: _dt_next.date(),
        };
      }
    }

    return _return;
  }

  Prev() {
    // Prev.

    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);

    this.Config.year = _date.prev.year;
    this.Config.month = _date.prev.month;
    this.Config.month_id = _date.prev.month_id;

    this.CalendarData = new Calendar(this.Config.monday_start).monthDays(this.Config.year, this.Config.month_id);

    // Set Target Date.
    this.SetDt = dayjs(`${this.Config.year}/${this.Config.month_id + 1}`);
    // Create&Set Calendar
    this.State.calendar_data = this.CreateCalendarData(false);
    this.HtmlCalendar = this.CreateCalendarData();
    this.Render();

    this.OnChange();
  }

  Next() {
    // Next.

    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);

    this.Config.year = _date.next.year;
    this.Config.month = _date.next.month;
    this.Config.month_id = _date.next.month_id;

    this.CalendarData = new Calendar(this.Config.monday_start).monthDays(this.Config.year, this.Config.month_id);

    // Set Target Date.
    this.SetDt = dayjs(`${this.Config.year}/${this.Config.month_id + 1}`);

    // Create&Set Calendar
    this.State.calendar_data = this.CreateCalendarData(false);
    this.HtmlCalendar = this.CreateCalendarData();
    this.Render();

    this.OnChange();
  }

  AddData(_add_data = [], isRender = true) {
    // Merge '_add_data' in 'schedule_data'
    if(_add_data.length <= 0) return false;

    let _data = [...this.Config.schedule_data, ..._add_data];

    let values = [];
    const uniqueObjects = _data.filter(e => {
      if (values.indexOf(e['id']) === -1) {
        values.push(e['id']);
        return e;
      }
    });

    this.Config.schedule_data = uniqueObjects;

    // Create&Set Calendar
    this.State.calendar_data = this.CreateCalendarData(false);

    let _html_calendar = this.CreateCalendarData();

    if(this.HtmlCalendar !== _html_calendar){
      this.HtmlCalendar = _html_calendar;
      this.OnChange();
      if(isRender){
        this.Render();
      }
    }
  }

  Update(isRender = true) {
    // Create&Set Calendar
    this.State.calendar_data = this.CreateCalendarData(false);

    let _html_calendar = this.CreateCalendarData();
    if(this.HtmlCalendar !== _html_calendar){
      this.HtmlCalendar = _html_calendar;
      this.OnChange();
      if(isRender){
        this.Render();
      }
    }
  }

  Render() {
    // Auto Render in first time.
    if (this.Config.auto_render === false) {
      this.Config.auto_render = true;
      return false;
    }

    // render html.
    if(this.$uiElemTitle){
    this.$uiElemTitle.innerHTML = this.HtmlTitle();
    }

    if(this.$uiElemTitleWeek){
    this.$uiElemTitleWeek.innerHTML = this.HtmlTitleWeek();
  }

    if(this.$uiElemContent){
      this.$uiElemContent.innerHTML = this.HtmlCalendar;
    }
  }

  OnLoad() {
    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
    if (this.on.Load && typeof this.on.Load === 'function') this.on.Load(_date, this.State, this);
  }

  OnChange() {
    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
    if (this.on.Change && typeof this.on.Change === 'function') this.on.Change(_date, this.State, this);
  }
}
