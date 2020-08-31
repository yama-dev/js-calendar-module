/*!
 * JS CALENDAR_MODULE (JavaScript Library)
 *   js-calendar-module.js
 * Version 0.3.0
 * Repository https://github.com/yama-dev/js-calendar-module
 * Author yama-dev
 * Licensed under the MIT license.
 */

import { Calendar } from 'calendar';
import moment from 'moment';

import { PARSE_MODULE } from 'js-parse-module';

export class CALENDAR_MODULE {
  constructor(options = {}) {
    // Set Version.
    this.Version = '0.3.0';

    // Use for discrimination by URL.
    this.CurrentUrl = location.href;

    // Data Calendar(HTML).
    this.HtmlCalendar = '';

    // Moment Now.
    this.NowMoment = moment();
    this.SetMoment = moment();

    // Adjust option template.
    if (!options.template) options.template = {};
    if (!options.template.title) options.template.title = '<div>{{year}}.{{month}}</div>';
    if (!options.template.title_week) options.template.title_week = '<div>{{week}}</div>';
    if (!options.template.date) options.template.date = '<div></div>';
    if (!options.template.date_data) options.template.date_data = '<div></div>';

    this.Setting = {
      day_of_week_list_all: [
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      ]
    };

    // Set config, options.
    this.Config = {
      elem: options.elem || '.js-calendar',
      elem_title: options.elem_title || '.js-calendar-title',
      elem_title_week: options.elem_title_week || '.js-calendar-title-week',
      elem_content: options.elem_content || '.js-calendar-content',

      year: options.year || this.NowMoment.year(),
      month: options.month || this.NowMoment.month() + 1,
      month_id: options.month - 1 || this.NowMoment.month(),
      date: options.month || this.NowMoment.date(),

      template: {
        title: options.template.title || '<div>{{year}}.{{month}}</div>',
        title_week: options.template.title_week || '<div>{{week}}</div>',
        date: options.template.date || null,
        date_data: options.template.date_data || null
      },

      day_of_week_list: options.day_of_week_list || [],

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

    if(!this.Config.monday_start){
      this.Config.day_of_week_list = this.Setting.day_of_week_list_all[0];
    } else {
      this.Config.day_of_week_list = this.Setting.day_of_week_list_all[1];
    }

    // Set callback functions.
    if (!options.on) options.on = {};
    this.on = {
      Change: options.on.Change || '',
      Load: options.on.Load || '',
      Prev: options.on.Prev || '',
      Next: options.on.Next || ''
    };

    // Data Calendar(obj).
    /** @type {Object} */
    this.CalendarData = new Calendar(this.Config.monday_start).monthDays(this.Config.year, this.Config.month_id);

    // DebugMode
    if (this.CurrentUrl.search(/localhost/) !== -1 || this.CurrentUrl.search(/192.168/) !== -1) {
      this.DebugMode();
    }

    // CacheElement
    this.CacheElement();

    // Create&Set Calendar (html)
    this.HtmlCalendar = this.CreateCalendarHtml();

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
      year: this.SetMoment.year(),
      month: this.SetMoment.month() + 1,
      month_str: this.SetMoment.format('MM'),
      month_str_en_short: this.SetMoment.format('MMM'),
      month_str_en_short_lower: this.SetMoment.format('MMM').toLowerCase(),
      month_str_en: this.SetMoment.format('MMMM'),
      month_str_en_lower: this.SetMoment.format('MMMM').toLowerCase(),
      day_of_week_str_en: this.SetMoment.format('dddd'),
      month_id: this.SetMoment.month(),
      date: this.SetMoment.date(),
      date_str: this.SetMoment.format('DD'),
      date_str_en: this.SetMoment.format('Do')
    };
    let _return = PARSE_MODULE.Str2Mustache(this.Config.template.title, _obj);

    return _return;
  }
  HtmlTitleWeek() {
    let _return = '';

    this.Config.day_of_week_list.map(val => {
      let _obj = {
        week: val
      };
      _return += PARSE_MODULE.Str2Mustache(this.Config.template.title_week, _obj);
    });

    return _return;
  }

  static AnalyzeDate(y, m, d = 1) {
    let _moment = moment([y, m, d]);
    let _momentPrev = moment([y, m, d]).subtract(1, 'months');
    let _momentNext = moment([y, m, d]).add(1, 'months');

    let _return = {
      current: {
        year: _moment.year(),
        month: _moment.month() + 1,
        month_str: _moment.format('MM'),
        month_str_en: _moment.format('MMMM'),
        day_of_week_str_en_str_en: _moment.format('mmmm'),
        month_id: _moment.month(),
        date: _moment.date()
      },
      prev: {
        year: _momentPrev.year(),
        month: _momentPrev.month() + 1,
        month_str: _momentPrev.format('MM'),
        month_str_en: _momentPrev.format('MMMM'),
        day_of_week_str_en_str_en: _momentPrev.format('mmmm'),
        month_id: _momentPrev.month(),
        date: _momentPrev.date()
      },
      next: {
        year: _momentNext.year(),
        month: _momentNext.month() + 1,
        month_str: _momentNext.format('MM'),
        month_str_en: _momentNext.format('MMMM'),
        day_of_week_str_en_str_en: _momentNext.format('mmmm'),
        month_id: _momentNext.month(),
        date: _momentNext.date()
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

  CreateCalendarHtml() {
    let _html = '';

    // Create Calendar HTML data for one month.
    this.CalendarData.map((val_week, index_week) => {
      this.CalendarData[index_week].map((val_date, index_date) => {
        let _class_name = this.Config.classname.date;
        let _date_event_data = this.GetEventData(this.Config.year, this.Config.month_id, val_date, false);
        let _date_day_of_week = this.Config.day_of_week_list[index_date % 7];

        // On Today.
        if (
          val_date === this.NowMoment.date() &&
          this.Config.year === this.NowMoment.year() &&
          this.Config.month_id === this.NowMoment.month()
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
        let _date_event_html = '';
        if(_date_event_data.length){
          // Create Event data.
          _date_event_data.map((val, index) => {
            if(val.category_en){
              _class_name_parent += ` u-has-${val.category_en}`;
            } 
            _date_event_html += PARSE_MODULE.Str2Mustache(this.Config.template.date_data, val);
          });
          _class_name += _class_name_parent;
        }

        // Create Calendar HTML data for one day.
        let obj = {
          year: this.Config.year,
          month: this.Config.month,
          month_id: this.Config.month_id,
          date: val_date,
          index: index_date,
          class_name: _class_name,
          day_of_week: _date_day_of_week,
          date_data: _date_event_html
        };
        _html += PARSE_MODULE.Str2Mustache(this.Config.template.date, obj);

      });
    });
    return _html;
  }

  GetEventData(y = this.NowMoment.year(), m = this.NowMoment.month(), d = this.NowMoment.date(), toHtml = false) {
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

    let _moment_set = moment([y, m, d]);
    let _moment = '';
    let _event_item = [];
    let _event_item_html = '';

    this.Config.schedule_data.map((val, index) => {
      let _d = PARSE_MODULE.Str2DateFormat(val.date);

      if (_d.split('-')[0].match(/\d{4}/)) {
        _moment = moment(_d);
        if (
          _moment_set.year() == _moment.year() &&
          _moment_set.month() == _moment.month() &&
          _moment_set.date() == _moment.date()
        ) {
          if (toHtml) {
            _event_item_html += PARSE_MODULE.Str2Mustache(this.Config.template.date_data, val);
          } else {
            _event_item.push(val);
          }
        }
      } else {
        // 年の指定がない場合(毎年と判断)

        // 当年でフォーマットを整形
        _d = this.NowMoment.year() + '-' + _d;
        _moment = moment(_d);

        if (_moment_set.month() == _moment.month() && _moment_set.date() == _moment.date()) {
          if (toHtml) {
            _event_item_html += PARSE_MODULE.Str2Mustache(this.Config.template.date_data, val);
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

  Prev() {
    // Prev.

    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);

    this.Config.year = _date.prev.year;
    this.Config.month = _date.prev.month;
    this.Config.month_id = _date.prev.month_id;

    this.CalendarData = new Calendar(this.Config.monday_start).monthDays(this.Config.year, this.Config.month_id);

    // Set Target Moment.
    this.SetMoment = moment([this.Config.year, this.Config.month_id]);
    this.HtmlCalendar = this.CreateCalendarHtml();
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

    // Set Target Moment.
    this.SetMoment = moment([this.Config.year, this.Config.month_id]);

    this.HtmlCalendar = this.CreateCalendarHtml();
    this.Render();

    this.OnChange();
  }

  Render() {
    // Auto Render in first time.
    if (this.Config.auto_render === false) {
      this.Config.auto_render = true;
      return false;
    }

    // Delete content.
    this.$uiElemContent.innerHTML = '';
    this.$uiElemTitle.innerHTML = '';
    this.$uiElemTitleWeek.innerHTML = '';

    // Render content.
    this.$uiElemContent.innerHTML = this.HtmlCalendar;
    this.$uiElemTitle.innerHTML = this.HtmlTitle();
    this.$uiElemTitleWeek.innerHTML = this.HtmlTitleWeek();
  }

  OnLoad() {
    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
    if (this.on.Load && typeof this.on.Load === 'function') this.on.Load(_date);
  }

  OnChange() {
    let _date = CALENDAR_MODULE.AnalyzeDate(this.Config.year, this.Config.month_id);
    if (this.on.Change && typeof this.on.Change === 'function') this.on.Change(_date);
  }
}
