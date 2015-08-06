// High Performance Javascript
// version 2.2

function onReady() {

    var adambiroEu = eu.adambiro;//eu&adambiro are two calls
    //to save it in one var we save 6 calls this is massive save in a loop
    var clock  = new adambiroEu.AlarmClock('clock');
    var clock2 = new adambiroEu.TextClock('clock2', -7200000, 'ETC');
    var clock3 = new adambiroEu.Clock('clock3', -7200000, 'ETC');
    var d = new Date();
}


/**
 * @constructor
 */
function LiveDate(a, b, c) {
    console.log(this, a, b, c);
}

//Static properties
Date.__interval = 0;
Date.__aDates = [];
/**
 * Static method
 * @param date
 */
Date.addToInterval = function (date) {
    this.__aDates.push(date);

    if (!Date.__interval) {
        Date.__interval = setInterval(function () {
            Date.updateDates()
        }, 1000)
    }
};

Date.updateDates = function () {
    for (var i = 0; i < this.__aDates.length; i++) {
        if (this.__aDates[i] instanceof Date) {
            this.__aDates[i].updateSeconds();
        } else {
            if (this.__aDates[i] instanceof Function) {
                this.__aDates[i]();
            }
        }
    }
}
/**
 * Updating seconds
 */
Date.prototype.updateSeconds = function () {
    this.setSeconds(this.getSeconds() + 1);
};


/**
 * Auto update
 * @param isAuto
 */
Date.prototype.autoClock = function (isAuto) {
    clearInterval(this.clockInterval);
    if (isAuto) {
        Date.addToInterval(this);
    }
};

// namespace setting
var eu = eu || {}; //do not override the eu folder if it exists
eu.adambiro = eu.adambiro || {};


/**
 * Clock constructor
 *
 * @param id
 * @param offset
 * @param label
 * @constructor
 */
eu.adambiro.Clock = function (id, offset, label) {
    offset = offset || 0;
    label = label || 'UTC';
    var d = new Date();
    var offset = (offset + d.getTimezoneOffset()) * 60 * 1000;
    //turn minutes to sec(*60) and millisecond(*1000)
    this.d = new Date(offset + d.getTime());
    this.d.autoClock(true);
    this.id = id;
    this.label = label;

    this.tick(true);
    var that = this;
    Date.addToInterval(function () {
        that.updateClock();
    });
};

/**
 * separated method for ticking
 * @param isTick
 */
eu.adambiro.Clock.prototype.tick = function (isTick) {
    this.isTicking = isTick;
    this.updateClock();
};

/**
 * Update clock to
 */
eu.adambiro.Clock.prototype.updateClock = function () {
    var clock, date, time;
    if (this.isTicking) {
        date = this.d;
        //date.updateSeconds();
        clock = document.getElementById(this.id);
        clock.innerHTML = this.formatOutput(
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            this.label
        );
    };
};

/**
 * Format Clock output
 *
 * @param h
 * @param m
 * @param s
 * @param label
 * @returns {string}
 */
eu.adambiro.Clock.prototype.formatOutput = function (h, m, s, label) {
    return this.formatDigits(h) + ":"
        + this.formatDigits(m) + ":"
        + this.formatDigits(s) + " " + label;
};

/**
 * Convert digits to 0X format if they are smaller than 10
 *
 * @param num
 * @returns {Number}
 */
eu.adambiro.Clock.prototype.formatDigits = function (num) {
    num = parseInt(num);
    if (num < 10) {
        num = '0' + num;
    }

    return num;
};
/**
 * New TextClock constructor
 *
 * @param id
 * @param offset
 * @param label
 * @constructor
 */
eu.adambiro.TextClock = function (id, offset, label) {
    eu.adambiro.Clock.apply(this, arguments);
    console.log(this.version);
};

eu.adambiro.TextClock.prototype = createObject(eu.adambiro.Clock.prototype, eu.adambiro.TextClock);

/**
 * Overwrite the default Functionality of the Clock constructor obj
 *
 * @param h
 * @param m
 * @param s
 * @param label
 * @returns {string}
 */
eu.adambiro.TextClock.prototype.formatOutput = function (h, m, s, label) {
    return this.formatDigits(h) + " Hour "
        + this.formatDigits(m) + " Minutes "
        + this.formatDigits(s) + " Seconds " + label;
};


/**
 * AlarmClock constructor
 *
 * @param id
 * @param offset
 * @param label
 * @constructor
 */
eu.adambiro.AlarmClock = function (id, offset, label) {
    eu.adambiro.Clock.apply(this, arguments);

    this.dom = document.getElementById(id);
    this.dom.contentEditable = true;
    var that = this;

    this.dom.addEventListener('focus', function () {
        this.innerHTML = this.innerHTML.slice(0, this.innerHTML.lastIndexOf(':'));
        console.log(this.innerHTML);
        that.tick(false);
    });

    this.dom.addEventListener('blur', function () {
        var a = this.innerHTML.split(':');
        that.almHour = parseInt(a[0]);
        that.almMinutes = parseInt(a[1]);
        console.log('logged', that.almHour, that.almMinutes);
        if ((that.almHour >= 0 && that.almHour < 24) &&
            (that.almMinutes >= 0 && that.almMinutes < 60)) {
            var event = new Event('restart_tick');
            this.dispatchEvent(event);//dispatch event
        }
        that.tick(true);
    });

    this.dom.addEventListener('restart_tick', function () {
        that.tick(true);
    })
};


eu.adambiro.AlarmClock.prototype = createObject(eu.adambiro.Clock.prototype, eu.adambiro.AlarmClock);

/**
 * AlarmClock format output
 *
 * @param h
 * @param m
 * @param s
 * @param label
 * @returns {*}
 */
eu.adambiro.AlarmClock.prototype.formatOutput = function (h, m, s, label) {
    var output;

    if (h == this.almHour && m == this.almMinutes) {
        var sound = new Audio();
        sound.src = '../ringtone/wake_up.mp3';
        output = 'ALARM WAKE UP!';
        sound.play();
    } else {
        //use the default Clock formatOutput with the following params
        output = eu.adambiro.Clock.prototype.formatOutput.apply(this, arguments);
    }

    return output;
};


/**
 * Object Creator method for back and forth
 *
 * @param proto
 * @param construct
 * @returns {createObject.c}
 */
function createObject(proto, construct) {
    function c() {
    }

    c.prototype = proto;
    c.prototype.constructor = construct;
    return new c();
};

window.onload = onReady;