import { Calendar } from 'calendar';

import dayjs from 'dayjs';

import { Str2Mustache } from '@yama-dev/js-parse-module/libs/str2mustache';
import { Str2DateFormat } from '@yama-dev/js-parse-module/libs/str2dateformat';

export class CALENDAR_MODULE {
  constructor(options = {}) {
    this.version = process.env.VERSION;

    // Set config, options.
    this.config = {
      elem: '.js-calendar',
      elem_title: '.js-calendar-title',
      elem_title_week: '.js-calendar-title-week',
      elem_content: '.js-calendar-content',

      day_of_week_list: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      monday_start: 0,

      current_date: new Date(),

      auto_render: true,

      schedule_data: [],

      template: {},
      classname: {},

      ...options
    };

    // Adjust 'config' setting.
    this.config.monday_start = this.config.monday_start ? 1 : 0;

    if(!options.template) options.template = {};
    this.config.template = {
      title: '<span class="year">{{year}}</span>/<span class="month">{{month_str}}</span>',
      title_week: '<span>{{week}}</span>',
      date: '<div class="{{class_name}}">{{date}} {{date_data}}</div>',
      date_data: '<div class="date_data"><div class="title">{{title}}</div><div class="article">{{article}}</div></div>',
      ...options.template
    };

    if(!options.classname) options.classname = {};
    this.config.classname = {
      today: 'u-is-today',
      date: 'js-calendar-item',
      date_disable: 'u-hidden',
      date_hasevent: 'u-has-eventdata',
      date_noevent: 'u-no-eventdata',
      ...options.classname
    };

    // Date Now.
    this.NowDt = dayjs(this.config.current_date);
    this.SetDt = dayjs(this.config.current_date);

    // State
    this.state = {
      year: this.NowDt.year(),
      month: this.NowDt.month() + 1,
      month_id: this.NowDt.month(),
      date: this.NowDt.date(),

      html: '',

      flg: {
        loaded: false,
      },
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
    let _day_of_week_list = this.config.day_of_week_list.concat();
    if(this.config.monday_start){
      let _shift = _day_of_week_list.shift();
      _day_of_week_list.push(_shift);
    }
    this.state.week_data = _day_of_week_list;

    // Data Calendar(obj).
    this.CalendarData = new Calendar(this.config.monday_start).monthDays(this.state.year, this.state.month_id);

    // CacheElement
    this._cacheElement();

    // Create&Set Calendar
    this.state.calendar_data = this.CreateCalendarData({
      toHtml: false,
      year: this.state.year,
      month_id: this.state.month_id,
      day: 1,
    });
    // Create&Set Calendar (html)
    this.state.html = this.state.calendar_data.html;

    // Render Calendar.
    this._render();

    // Event On Load.
    this._onLoad();
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
    if(typeof this.config.template.title === 'function' ){
      let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);
      _return = Str2Mustache(this.config.template.title(_date), _obj);
    } else {
      _return = Str2Mustache(this.config.template.title, _obj);
    }

    return _return;
  }
  HtmlTitleWeek() {
    let _return = '';

    this.state.week_data.map(val => {
      let _obj = {
        week: val
      };
      if(typeof this.config.template.title_week === 'function' ){
        let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);
        _return += Str2Mustache(this.config.template.title_week(_date), _obj);
      } else {
        _return += Str2Mustache(this.config.template.title_week, _obj);
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

  _cacheElement() {
    this.$uiElem = document.querySelector(this.config.elem);
    this.$uiElemContent = document.querySelector(this.config.elem_content);
    this.$uiElemTitle = document.querySelector(this.config.elem_title);
    this.$uiElemTitleWeek = document.querySelector(this.config.elem_title_week);
  }

  CreateCalendarData(obj = {}) {
    let _data = [];
    let _data_html = '';

    if (!obj) return [];

    const {
      calendar = this.CalendarData,
      year = this.state.year,
      month = this.state.month,
      month_id = null,
      month_str = null,
      day = 1,
      count = 31,
      countType = 'default',
      toHtml = false,
    } = obj;

    let m = Number(month) - 1;
    if(month_id !== null && month_id !== undefined && month_id !== '') m = month_id;
    if(month_str !== null && month_str !== undefined && month_str !== '') m = Number(month_str) - 1;

    let _dt_set = dayjs(`${year}/${m + 1}/${day}`);

    if(countType === 'default'){
      // Create Calendar HTML data for one month.

      calendar.map((val_week, index_week) => {
        calendar[index_week].map((val_date, index_date) => {

          let _one_day_obj = this.CreateCalendarDataItem({
            index_date,
            year: this.state.year,
            month_id: this.state.month_id,
            day: val_date,
          });

          _data.push(_one_day_obj);

          if(typeof this.config.template.title === 'function' ){
            _data_html += Str2Mustache(this.config.template.date(_one_day_obj), _one_day_obj);
          } else {
            _data_html += Str2Mustache(this.config.template.date, _one_day_obj);
          }
        });
      });

    } else if(countType === 'day' || countType === 'week' || countType === 'month' || countType === 'year'){
      // 特定の期間でカウントの場合

      for (var _i = 0; _i < count; _i++) {
        let _dt = _dt_set.add(_i, countType);

        let _one_day_obj = this.CreateCalendarDataItem({
          index_date: _dt.day(),
          year: _dt.year(),
          month_id: _dt.month(),
          day: _dt.date(),
        });

        _data.push(_one_day_obj);
        if(typeof this.config.template.title === 'function' ){
          _data_html += Str2Mustache(this.config.template.date(_one_day_obj), _one_day_obj);
        } else {
          _data_html += Str2Mustache(this.config.template.date, _one_day_obj);
        }
      }
    }

    let _return = '';
    if (toHtml) {
      _return = _data_html;
    } else {
      _return = {
        result: _data,
        html: _data_html,
      };
    }

    if(countType === 'day' || countType === 'week' || countType === 'month' || countType === 'year'){
      let _dt_prev = _dt_set.subtract(count, countType);
      let _dt_next = _dt_set.add(count, countType);

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

    return _return;
  }

  // parent function 'CreateCalendarData'
  // for iterative function.
  CreateCalendarDataItem(obj = {}) {
    const {
      index_date,
      year,
      month_id,
      day,
    } = obj;

    let _class_name = this.config.classname.date;

    // Get Event-Data on Target-Day.
    let _date_event_data_obj = this.GetEventData({
      year: year,
      month_id: month_id,
      day: day,
    });
    let _date_event_data = _date_event_data_obj.result;

    // Set day-of-week.
    let _date_day_of_week = this.state.week_data[index_date % 7];

    // On Today.
    if (
      day === this.NowDt.date() &&
      this.state.year === this.NowDt.year() &&
      this.state.month_id === this.NowDt.month()
    ) {
      _class_name += ` ${this.config.classname.today}`;
    }

    // Not this Month.
    if (!day) _class_name += ` ${this.config.classname.date_disable}`;

    // When has event data.
    if (_date_event_data.length) {
      _class_name += ` ${this.config.classname.date_hasevent}`;
    } else {
      _class_name += ` ${this.config.classname.date_noevent}`;
    }

    let _date_event = [];
    let _date_event_html = '';
    if(_date_event_data.length){
      // Create Event data.

      let _class_name_parent = '';

      _date_event_data.map((val, index) => {
        if(val.category_en){
          _class_name_parent += ` u-has-${val.category_en}`;
        }
        _date_event.push(val);

        if(typeof this.config.template.date_data === 'function' ){
          _date_event_html += Str2Mustache(this.config.template.date_data(val), val);
        } else {
          _date_event_html += Str2Mustache(this.config.template.date_data, val);
        }

      });
      _class_name += _class_name_parent;
    }

    let _date = CALENDAR_MODULE.AnalyzeDate(year, month_id, day).current;

    // Create Calendar HTML data for one day.
    let _return = Object.assign(_date,
      {
        index: index_date,
        class_name: _class_name,
        day_of_week: _date_day_of_week,
        date_data: _date_event_html,
        date_data_ary: _date_event
      }
    );

    return _return;
  }

  // Get Event.
  GetEventData(obj) {

    if (!obj) return [];

    const {
      year: y,
      month,
      month_id = null,
      month_str = null,
      day: d,
      count = 1,
      countType = 'day', // 'day' | 'number'
      toHtml = false,
    } = obj;

    let m = month;
    if(month_id !== null && month_id !== undefined && month_id !== '') m = month_id;
    if(month_str !== null && month_str !== undefined && month_str !== '') m = Number(month_str) - 1;

    // Invalid value return.
    if(d == 0){
      if (toHtml) {
        return '';
      } else {
        return {
          result: [],
          html: ''
        };
      }
    }

    let _dt_set = dayjs(`${y}/${m + 1}/${d}`);
    let _dt = '';
    let _event_item = [];
    let _event_item_html = '';

    let _set_item_count = 0;

    this.config.schedule_data.map((val, index) => {
      let _d = Str2DateFormat(val.date);

      if (_d.split('-')[0].match(/\d{4}/)) {
        _dt = dayjs(_d);
      } else {
        // 年の指定がない場合(毎年と判断)
        // 当年でフォーマットを整形
        _d = this.NowDt.year() + '-' + _d;
        _dt = dayjs(_d);
      }

      if(_dt.diff(_dt_set) >= 0 && _set_item_count < count){
        if(countType === 'number'){
          // 個数カウントの場合

          _set_item_count++;

          if(typeof this.config.template.date_data === 'function' ){
            _event_item_html += Str2Mustache(this.config.template.date_data(val), val);
          } else {
            _event_item_html += Str2Mustache(this.config.template.date_data, val);
          }

          _event_item.push(val);

        } else if(countType === 'day' || countType === 'week' || countType === 'month' || countType === 'year'){
          // 特定の期間でカウントの場合

          let _dt_end = _dt_set.add(count - 1, countType);

          if(_dt.diff(_dt_end) <= 0){
            if(typeof this.config.template.date_data === 'function' ){
              _event_item_html += Str2Mustache(this.config.template.date_data(val), val);
            } else {
              _event_item_html += Str2Mustache(this.config.template.date_data, val);
            }
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
        let _dt_prev = _dt_set.subtract(count , countType);
        let _dt_next = _dt_set.add(count, countType);

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

    if(!this.state.flg.loaded) return false;

    let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);

    this.state.year = _date.prev.year;
    this.state.month = _date.prev.month;
    this.state.month_id = _date.prev.month_id;

    this._changeDate();
  }

  Next() {
    // Next.

    if(!this.state.flg.loaded) return false;

    let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);

    this.state.year = _date.next.year;
    this.state.month = _date.next.month;
    this.state.month_id = _date.next.month_id;

    this._changeDate();
  }

  Change({year, month_id}) {
    // Change.
    if(!this.state.flg.loaded) return false;
    if(!year) return false;
    if(!month_id && month_id !== 0) return false;

    let _date = CALENDAR_MODULE.AnalyzeDate(year, month_id);

    this.state.year = _date.current.year;
    this.state.month = _date.current.month;
    this.state.month_id = _date.current.month_id;

    this._changeDate();
  }

  _changeDate() {
    // ChangeDate.

    this.CalendarData = new Calendar(this.config.monday_start).monthDays(this.state.year, this.state.month_id);

    // Set Target Date.
    this.SetDt = dayjs(`${this.state.year}/${this.state.month_id + 1}`);

    // Create&Set Calendar
    this.state.calendar_data = this.CreateCalendarData({toHtml:false});
    this.state.html = this.state.calendar_data.html;
    this._render();

    this._onChange();
  }

  AddData(_add_data = [], isRender = true) {
    if(!this.state.flg.loaded) return false;

    // Merge '_add_data' in 'schedule_data'
    if(_add_data.length <= 0) return false;

    let _data = [...this.config.schedule_data, ..._add_data];

    let values = [];
    const uniqueObjects = _data.filter(e => {
      if (values.indexOf(e['id']) === -1) {
        values.push(e['id']);
        return e;
      }
    });

    this.config.schedule_data = uniqueObjects;

    // Create&Set Calendar
    this.state.calendar_data = this.CreateCalendarData({toHtml:false});

    let _html_calendar = this.state.calendar_data.html;

    if(this.state.html !== _html_calendar){
      this.state.html = _html_calendar;
      this._onChange();
      if(isRender){
        this._render();
      }
    }
  }

  Update(isRender = true) {
    if(!this.state.flg.loaded) return false;

    // Create&Set Calendar
    this.state.calendar_data = this.CreateCalendarData({toHtml:false});

    let _html_calendar = this.state.calendar_data.html;

    if(this.state.html !== _html_calendar){
      this.state.html = _html_calendar;
      this._onChange();
      if(isRender){
        this._render();
      }
    }
  }

  _render() {
    // Auto Render in first time.
    if (this.config.auto_render === false) {
      this.config.auto_render = true;
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
      this.$uiElemContent.innerHTML = this.state.html;
    }
  }

  _onLoad() {
    this.state.flg.loaded = true;

    let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);
    if (this.on.Load && typeof this.on.Load === 'function') this.on.Load(_date, this.state, this);
  }

  _onChange() {
    let _date = CALENDAR_MODULE.AnalyzeDate(this.state.year, this.state.month_id);
    if (this.on.Change && typeof this.on.Change === 'function') this.on.Change(_date, this.state, this);
  }

}
