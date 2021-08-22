# CALENDAR MODULE

Create Calender library.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Demo](#demo)
- [Installation,Download](#installationdownload)
- [Using](#using)
  - [NPM Usage](#npm-usage)
  - [Basic Standalone Usage](#basic-standalone-usage)
- [API](#api)
  - [Options](#options)
- [Dependencies](#dependencies)
- [Licence](#licence)
- [Author](#author)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

<br>

## Demo

## Installation,Download

- npm -> [https://www.npmjs.com/package/js-calendar-module](https://www.npmjs.com/package/js-calendar-module)

<br>

## Using

### NPM Usage

``` bash
# install npm.
npm install --save js-calendar-module
```

``` javascript
// import.
import CALENDAR_MODULE from 'js-calendar-module';
```

### Basic Standalone Usage

``` html
<script src="./js-calendar-module.js"></script>
<script>
  let CM =  new CALENDAR_MODULE({
    monday_start     : false,
    day_of_week_list : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    auto_render      : true,
    on: {
      Load: function(date){
        console.log(date);
      },
      Change: function(date){
        console.log(date);
      }
    }
  });
</script>
```

<br>

## API

### Options

| Parameter | Type   | Default      | Description |
| :---      | :---:  | :---:        | :---        |

<br><br><br>

## Dependencies

none

<br><br><br>

___

## Licence

[MIT](https://github.com/yama-dev/js-calendar-module/blob/master/LICENSE)

<br>

## Author

[yama-dev](https://github.com/yama-dev)

