/* ปฏิทินธรรม — สคริปต์หลัก (jQuery) ไม่ใช้ฐานข้อมูล ข้อมูลอยู่ใน js/data.js */
(function ($) {
  'use strict';

  var DAYS = BD.DAYS;
  var ORDER = BD.DAY_ORDER;
  var DAY_MS = 86400000;
  var TZ = '+07:00'; // เวลาประเทศไทย

  var MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  var MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var WEEKDAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  var PLATFORMS = { youtube: 'YouTube', tiktok: 'TikTok', facebook: 'Facebook' };

  /* ---------- ตัวช่วย ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function thaiNum(n) {
    return String(n).replace(/\d/g, function (d) { return '๐๑๒๓๔๕๖๗๘๙'.charAt(d); });
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function parts(s) { var p = s.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function weekdayOf(s) {
    var p = parts(s);
    return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  }
  function longDate(s) {
    var p = parts(s);
    return 'วัน' + WEEKDAYS[weekdayOf(s)] + 'ที่ ' + thaiNum(p.d) + ' ' + MONTHS[p.m - 1] + ' พ.ศ. ' + thaiNum(p.y + 543);
  }
  function bangkokToday(now) {
    var t = new Date(now + 7 * 3600000);
    return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  }
  function calendarDaysUntil(s, now) {
    var p = parts(s);
    return Math.round((Date.UTC(p.y, p.m - 1, p.d) - bangkokToday(now)) / DAY_MS);
  }
  function shortName(key) { return DAYS[key].name.replace(/^วัน/, ''); }

  /* ---------- เตรียมข้อมูลวันที่ ---------- */
  var EV = $.map(BD.EVENTS, function (e) {
    var start = new Date(e.date + 'T00:00:00' + TZ).getTime();
    return { day: e.day, date: e.date, lunar: e.lunar, start: start, end: start + DAY_MS };
  }).sort(function (a, b) { return a.start - b.start; });

  function context(now) {
    var i, prev = null;
    for (i = 0; i < EV.length; i++) {
      if (EV[i].end > now) { return { next: EV[i], prev: prev }; }
      prev = EV[i];
    }
    return { next: null, prev: prev };
  }

  /* ---------- ส่วนที่ 1: นับถอยหลัง ---------- */
  var RING_LEN = 2 * Math.PI * 92;
  var shownKey = null;

  function paintHero(ev) {
    var day = DAYS[ev.day];
    $('#hero-title').text(day.name);
    $('#hero-date').text(longDate(ev.date) + ' (' + ev.lunar + ')');
    $('#hero-essence').text(day.essence);
    $('#moon-cap').text(ev.lunar);
    $('#hero-more').text('อ่านความหมายของ' + day.name);
    $('#hero-more').data('day', ev.day);
  }

  function tick() {
    var now = Date.now();
    var ctx = context(now);
    var ev = ctx.next;

    if (!ev) {
      $('#hero-kicker').text('ข้อมูลปฏิทินสิ้นสุดแล้ว');
      $('#hero-title').text('กรุณาอัปเดตวันสำคัญ');
      $('#hero-date').text('เพิ่มวันที่ใหม่ในไฟล์ js/data.js');
      $('#hero-essence').text('');
      $('#timer').hide();
      $('#hero-more').hide();
      clearInterval(timerId);
      return;
    }

    var key = ev.date + ev.day;
    if (key !== shownKey) { paintHero(ev); shownKey = key; }

    var isToday = now >= ev.start;
    var startRef = ctx.prev ? ctx.prev.start : ev.start - 90 * DAY_MS;
    var progress = isToday ? 1 : Math.max(0, Math.min(1, (now - startRef) / (ev.start - startRef)));
    $('#ring-bar').css({ 'stroke-dasharray': RING_LEN, 'stroke-dashoffset': RING_LEN * (1 - progress) });

    if (isToday) {
      $('#hero-kicker').text('วันนี้คือ');
      $('#timer').hide();
      $('#today-banner').text('ขอเชิญร่วมระลึกถึงและทำความดีตามกำลังศรัทธา').prop('hidden', false);
      return;
    }

    $('#hero-kicker').text('วันสำคัญทางพระพุทธศาสนาถัดไป');
    $('#today-banner').prop('hidden', true);
    $('#timer').show();

    var diff = ev.start - now;
    var d = Math.floor(diff / DAY_MS);
    var h = Math.floor((diff % DAY_MS) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    $('#t-d').text(d);
    $('#t-h').text(pad(h));
    $('#t-m').text(pad(m));
    $('#t-s').text(pad(s));
  }

  var timerId = setInterval(tick, 1000);

  /* ---------- ส่วนที่ 2: แท็บความหมายของวัน ---------- */
  function nextOf(key, now) {
    var i;
    for (i = 0; i < EV.length; i++) {
      if (EV[i].day === key && EV[i].end > now) { return EV[i]; }
    }
    return null;
  }

  function buildTabs() {
    var html = '';
    $.each(ORDER, function (i, key) {
      html += '<button type="button" role="tab" class="tab" id="tab-' + key + '" data-day="' + key +
        '" aria-controls="day-panel" aria-selected="false" tabindex="-1">' +
        '<span class="t-name">' + esc(shortName(key)) + '</span>' +
        '<span class="t-when">' + esc(DAYS[key].when) + '</span></button>';
    });
    $('#day-tabs').html(html);
  }

  function renderPanel(key) {
    var d = DAYS[key];
    var now = Date.now();
    var nx = nextOf(key, now);
    var story = $.map(d.story, function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var practice = $.map(d.practice, function (p) { return '<li>' + esc(p) + '</li>'; }).join('');
    var nextHtml = '';
    if (nx) {
      var n = calendarDaysUntil(nx.date, now);
      nextHtml = '<p class="next-line"><strong>ครั้งต่อไป</strong> ' + esc(longDate(nx.date)) +
        (n > 0 ? ' (อีก ' + n + ' วัน)' : ' (วันนี้)') + '</p>';
    }
    var hasVideo = $.grep(BD.VIDEOS, function (v) { return v.day === key; }).length > 0;

    var html =
      '<div class="panel-main">' +
        '<h3>' + esc(d.name) + '</h3>' +
        '<p class="lunar">' + esc(d.lunar) + '</p>' +
        '<blockquote class="essence essence-dark">' + esc(d.essence) + '</blockquote>' +
        '<p class="sum">' + esc(d.summary) + '</p>' + story +
      '</div>' +
      '<aside class="panel-side">' +
        '<h4>หลักธรรมของวันนี้</h4><p>' + esc(d.principle) + '</p>' +
        '<h4>ทำอะไรได้บ้าง</h4><ul>' + practice + '</ul>' + nextHtml +
        (hasVideo ? '<p><a class="btn btn-ghost" href="#videos" data-video-day="' + key + '">ดูวิดีโอของ' + esc(d.name) + '</a></p>' : '') +
      '</aside>';

    $('#day-panel').html(html).attr('aria-labelledby', 'tab-' + key);
  }

  function selectTab(key, focus) {
    $('#day-tabs .tab').each(function () {
      var on = $(this).data('day') === key;
      $(this).toggleClass('on', on).attr({ 'aria-selected': on ? 'true' : 'false', tabindex: on ? '0' : '-1' });
      if (on && focus) { this.focus(); }
    });
    renderPanel(key);
  }

  function initTabs() {
    buildTabs();
    var ctx = context(Date.now());
    selectTab(ctx.next ? ctx.next.day : ORDER[0], false);

    $('#day-tabs').on('click', '.tab', function () { selectTab($(this).data('day'), false); });
    $('#day-tabs').on('keydown', '.tab', function (e) {
      var i = $.inArray($(this).data('day'), ORDER);
      if (e.key === 'ArrowRight') { i = (i + 1) % ORDER.length; }
      else if (e.key === 'ArrowLeft') { i = (i - 1 + ORDER.length) % ORDER.length; }
      else if (e.key === 'Home') { i = 0; }
      else if (e.key === 'End') { i = ORDER.length - 1; }
      else { return; }
      e.preventDefault();
      selectTab(ORDER[i], true);
    });

    $('#hero-more').on('click', function () {
      var k = $(this).data('day');
      if (k) { selectTab(k, false); }
    });
    $('#day-panel').on('click', '[data-video-day]', function () {
      setVideoFilter('day', $(this).data('video-day'));
    });
  }

  /* ---------- ส่วนที่ 3: ปฏิทิน ---------- */
  function renderCalendar() {
    var now = Date.now();
    var ctx = context(now);
    var nextKey = ctx.next ? ctx.next.date + ctx.next.day : '';
    var byYear = {};
    var years = [];

    $.each(EV, function (i, e) {
      var y = parts(e.date).y;
      if (!byYear[y]) { byYear[y] = []; years.push(y); }
      byYear[y].push(e);
    });

    var html = '';
    $.each(years, function (i, y) {
      html += '<div class="cal-year"><h3>พ.ศ. ' + thaiNum(y + 543) + ' <span>ค.ศ. ' + y + '</span></h3><ul>';
      $.each(byYear[y], function (j, e) {
        var p = parts(e.date);
        var state, label;
        var n = calendarDaysUntil(e.date, now);
        if (e.end <= now) { state = 'past'; label = 'ผ่านไปแล้ว'; }
        else if (e.start <= now) { state = 'today'; label = 'วันนี้'; }
        else { state = (e.date + e.day === nextKey) ? 'next' : 'later'; label = 'อีก ' + n + ' วัน'; }
        html += '<li class="row ' + state + '">' +
          '<time datetime="' + e.date + '"><span class="d">' + p.d + '</span><span class="m">' + MONTHS_SHORT[p.m - 1] + '</span></time>' +
          '<div class="what"><strong>' + esc(DAYS[e.day].name) + '</strong>' +
          '<span>' + esc('วัน' + WEEKDAYS[weekdayOf(e.date)]) + ' ' + esc(e.lunar) + '</span></div>' +
          '<span class="state">' + esc(label) + '</span></li>';
      });
      html += '</ul></div>';
    });
    $('#cal-list').html(html);
  }

  /* ---------- ส่วนที่ 4: วิดีโอ ---------- */
  var vFilter = { day: 'all', platform: 'all' };

  function chip(group, value, label, count) {
    var on = vFilter[group] === value;
    return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-group="' + group +
      '" data-value="' + esc(value) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
      esc(label) + ' <span class="cnt">' + count + '</span></button>';
  }

  function renderChips() {
    var dayHtml = chip('day', 'all', 'ทุกวัน', BD.VIDEOS.length);
    $.each(ORDER, function (i, k) {
      var c = $.grep(BD.VIDEOS, function (v) { return v.day === k; }).length;
      if (c) { dayHtml += chip('day', k, shortName(k), c); }
    });
    $('#f-day').html(dayHtml);

    var platHtml = chip('platform', 'all', 'ทุกแพลตฟอร์ม', BD.VIDEOS.length);
    $.each(PLATFORMS, function (k, label) {
      var c = $.grep(BD.VIDEOS, function (v) { return v.platform === k; }).length;
      if (c) { platHtml += chip('platform', k, label, c); }
    });
    $('#f-platform').html(platHtml);
  }

  function posterHtml(v) {
    if (v.platform === 'youtube' && /^[\w-]{11}$/.test(v.ref)) {
      return '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.ref + '/hqdefault.jpg">';
    }
    return '';
  }

  function renderVideos() {
    var list = $.grep(BD.VIDEOS, function (v) {
      return (vFilter.day === 'all' || v.day === vFilter.day) &&
        (vFilter.platform === 'all' || v.platform === vFilter.platform);
    });
    var html = '';
    $.each(list, function (i, v) {
      var idx = $.inArray(v, BD.VIDEOS);
      html += '<li class="vitem"><button type="button" class="vcard" data-idx="' + idx + '" aria-label="เล่นวิดีโอ ' + esc(v.title) + '">' +
        '<span class="poster plat-' + esc(v.platform) + '">' + posterHtml(v) +
        '<span class="play" aria-hidden="true"></span>' +
        '<span class="badge">' + esc(PLATFORMS[v.platform] || v.platform) + '</span></span>' +
        '<span class="vtitle">' + esc(v.title) + '</span>' +
        '<span class="vnote">' + esc(v.note) + '</span>' +
        '<span class="vday">' + esc(DAYS[v.day].name) + '</span></button></li>';
    });
    $('#vgrid').html(html);
    $('#vgrid img').on('error', function () { $(this).remove(); });
    $('#v-empty').prop('hidden', list.length > 0);
  }

  function setVideoFilter(group, value) {
    vFilter[group] = value;
    renderChips();
    renderVideos();
  }

  /* หน้าต่างเล่นวิดีโอ */
  var lastFocus = null;

  function embedSrc(v) {
    if (v.platform === 'youtube' && /^[\w-]{11}$/.test(v.ref)) {
      return { src: 'https://www.youtube-nocookie.com/embed/' + v.ref + '?autoplay=1&rel=0', cls: 'wide' };
    }
    if (v.platform === 'tiktok' && /^\d+$/.test(v.ref)) {
      return { src: 'https://www.tiktok.com/embed/v2/' + v.ref, cls: 'tall' };
    }
    if (v.platform === 'facebook' && /^https:\/\/(www\.facebook\.com|fb\.watch)\//.test(v.ref)) {
      return { src: 'https://www.facebook.com/plugins/video.php?show_text=false&autoplay=true&href=' + encodeURIComponent(v.ref), cls: 'wide' };
    }
    return null;
  }

  function openVideo(v, trigger) {
    var e = embedSrc(v);
    if (!e) { return; }
    lastFocus = trigger;
    $('#modal-title').text(v.title);
    $('#modal-src').attr('href', v.url);
    var $f = $('<iframe>', {
      src: e.src, title: v.title, allowfullscreen: true, 'class': 'frame ' + e.cls,
      allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
      referrerpolicy: 'strict-origin-when-cross-origin'
    });
    $('#modal-stage').empty().append($f);
    $('#modal').prop('hidden', false);
    $('body').addClass('lock');
    $('#modal .modal-x').trigger('focus');
  }

  function closeVideo() {
    $('#modal-stage').empty();
    $('#modal').prop('hidden', true);
    $('body').removeClass('lock');
    if (lastFocus) { $(lastFocus).trigger('focus'); lastFocus = null; }
  }

  function initVideos() {
    renderChips();
    renderVideos();
    $('#filters').on('click', '.chip', function () {
      setVideoFilter($(this).data('group'), String($(this).data('value')));
    });
    $('#vgrid').on('click', '.vcard', function () {
      openVideo(BD.VIDEOS[$(this).data('idx')], this);
    });
    $('#modal').on('click', '[data-close]', closeVideo);
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && !$('#modal').prop('hidden')) { closeVideo(); }
    });
  }

  /* ---------- ส่วนที่ 5: ลิงก์และเมนู ---------- */
  function renderLinks() {
    var menu = '', list = '';
    $.each(BD.LINKS, function (i, l) {
      menu += '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.name) + '</a></li>';
      list += '<li><a class="lk" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="lk-name">' + esc(l.name) + '</span>' +
        '<span class="lk-desc">' + esc(l.desc) + '</span>' +
        '<span class="lk-host">' + esc(l.host) + '</span></a></li>';
    });
    menu += '<li class="all"><a href="#links">ดูทั้งหมดในหน้านี้</a></li>';
    $('#links-menu').html(menu);
    $('#links-list').html(list);
  }

  function initNav() {
    var $header = $('.site-header');
    var $toggle = $('.nav-toggle');
    var $menuBtn = $('.menu-btn');

    function closeSub() { $menuBtn.attr('aria-expanded', 'false'); $('.has-menu').removeClass('open'); }
    function closeAll() { closeSub(); $header.removeClass('open'); $toggle.attr('aria-expanded', 'false'); }

    $toggle.on('click', function () {
      var open = !$header.hasClass('open');
      $header.toggleClass('open', open);
      $toggle.attr('aria-expanded', open ? 'true' : 'false');
    });
    $menuBtn.on('click', function (e) {
      e.stopPropagation();
      var open = $menuBtn.attr('aria-expanded') !== 'true';
      $menuBtn.attr('aria-expanded', open ? 'true' : 'false');
      $('.has-menu').toggleClass('open', open);
    });
    $(document).on('click', function (e) {
      if (!$(e.target).closest('.has-menu').length) { closeSub(); }
    });
    $('.site-nav a').on('click', function () { closeAll(); });
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') { closeSub(); }
    });
  }

  /* ---------- เริ่มทำงาน ---------- */
  $(function () {
    renderLinks();
    initNav();
    initTabs();
    renderCalendar();
    initVideos();
    tick();
  });

})(jQuery);
