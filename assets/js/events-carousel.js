/**
 * Events carousel for PitCrew home page.
 * Reads event data from window.PITCREW_EVENTS (injected inline by home layout).
 * Splits past / future events, paginates at 3 per page, and handles prev/next navigation.
 */
(function () {
  var raw = window.PITCREW_EVENTS || [];
  if (!raw.length) return;

  var PAGE = 3;

  // Build today as YYYY-MM-DD without timezone offset
  var now = new Date();
  var today = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  // Sort all events ascending by date string (ISO dates compare lexicographically)
  var sorted = raw.slice().sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });

  var past   = sorted.filter(function (e) { return String(e.date) < today; });
  var future = sorted.filter(function (e) { return String(e.date) >= today; });

  // State
  var group = future.length ? 'future' : 'past';
  var page  = 0;

  function groupArr()       { return group === 'future' ? future : past; }
  function totalPages(arr)  { return Math.max(1, Math.ceil(arr.length / PAGE)); }

  function canPrev() {
    return (group === 'past'   && page > 0) ||
           (group === 'future' && (page > 0 || past.length > 0));
  }
  function canNext() {
    if (group === 'past') return page < totalPages(past) - 1 || future.length > 0;
    return page < totalPages(future) - 1;
  }

  function fmtDate(ds) {
    var parts = String(ds).split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return {
      day:   String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    };
  }

  function badgeHtml(type) {
    if (type === 'competition') return '<span class="badge badge-secondary">Competition</span>';
    if (type === 'outreach')    return '<span class="badge badge-success">Outreach</span>';
    return '<span class="badge badge-primary">Event</span>';
  }

  function cardHtml(ev) {
    var dt  = fmtDate(ev.date);
    var dim = String(ev.date) < today;
    var loc = ev.location
      ? '<p style="font-size:0.875rem;color:var(--color-text-muted);display:flex;align-items:center;gap:0.25rem;margin-top:0.25rem;">' +
          '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' +
          ev.location + '</p>'
      : '';
    var desc = ev.description
      ? '<p style="font-size:0.875rem;color:var(--color-text-muted);margin-top:0.5rem;">' + ev.description + '</p>'
      : '';
    var link = ev.url
      ? '<a href="' + ev.url + '" style="display:inline-flex;align-items:center;gap:0.25rem;color:var(--color-primary);font-size:0.875rem;margin-top:0.5rem;">Learn more <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></a>'
      : '';

    return '<div class="card" style="' + (dim ? 'opacity:0.7;' : '') + '">' +
      '<div class="card-body">' +
        '<div style="display:flex;align-items:flex-start;gap:1rem;">' +
          '<div style="flex-shrink:0;text-align:center;border-radius:0.5rem;padding:0.625rem 0.875rem;min-width:58px;position:relative;overflow:hidden;">' +
            '<div style="position:absolute;inset:0;background:var(--color-primary);opacity:0.12;" aria-hidden="true"></div>' +
            '<span style="position:relative;display:block;font-size:1.5rem;font-weight:700;color:var(--color-primary);line-height:1;">' + dt.day + '</span>' +
            '<span style="position:relative;display:block;font-size:0.75rem;color:var(--color-primary);text-transform:uppercase;margin-top:0.125rem;">' + dt.month + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="margin-bottom:0.375rem;">' + badgeHtml(ev.type) + '</div>' +
            '<h3 style="font-weight:700;font-size:1.05rem;margin:0;">' + ev.name + '</h3>' +
            loc + desc + link +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var a     = groupArr();
    var tp    = totalPages(a);
    var slice = a.slice(page * PAGE, (page + 1) * PAGE);

    document.getElementById('events-heading').textContent =
      group === 'future' ? 'Upcoming Events' : 'Past Events';

    var grid = document.getElementById('events-grid');
    grid.innerHTML = slice.length
      ? slice.map(cardHtml).join('')
      : '<p style="color:var(--color-text-muted);grid-column:1/-1;text-align:center;padding:2rem 0;">No events to display.</p>';

    // Dots
    var dotsEl = document.getElementById('events-dots');
    var html   = '';
    var groups = [];
    if (past.length)   groups.push({ g: 'past',   tp: totalPages(past)   });
    if (future.length) groups.push({ g: 'future', tp: totalPages(future) });
    groups.forEach(function (gi, gi_idx) {
      if (gi_idx > 0) html += '<span style="width:1px;height:1rem;background:var(--color-border);display:inline-block;margin:0 0.25rem;" aria-hidden="true"></span>';
      for (var i = 0; i < gi.tp; i++) {
        var active = gi.g === group && i === page;
        html += '<span style="display:inline-block;height:0.5rem;border-radius:9999px;transition:all 0.2s;background:' +
          (active ? 'var(--color-primary)' : 'var(--color-border)') +
          ';width:' + (active ? '1.25rem' : '0.5rem') + ';" aria-hidden="true"></span>';
      }
    });
    dotsEl.innerHTML = html;

    document.getElementById('events-label').textContent =
      (group === 'future' ? 'Upcoming' : 'Past') + ' · Page ' + (page + 1) + ' of ' + tp;

    // Buttons
    var cp = canPrev(), cn = canNext();
    var prevBtn = document.getElementById('events-prev');
    var nextBtn = document.getElementById('events-next');
    prevBtn.disabled      = !cp;
    prevBtn.style.opacity = cp ? '1' : '0.3';
    prevBtn.style.cursor  = cp ? 'pointer' : 'not-allowed';
    nextBtn.disabled      = !cn;
    nextBtn.style.opacity = cn ? '1' : '0.3';
    nextBtn.style.cursor  = cn ? 'pointer' : 'not-allowed';
  }

  document.getElementById('events-prev').addEventListener('click', function () {
    if (!canPrev()) return;
    if (group === 'future') {
      page > 0 ? page-- : (group = 'past', page = totalPages(past) - 1);
    } else {
      page--;
    }
    render();
  });

  document.getElementById('events-next').addEventListener('click', function () {
    if (!canNext()) return;
    if (group === 'past') {
      page < totalPages(past) - 1 ? page++ : (group = 'future', page = 0);
    } else {
      page++;
    }
    render();
  });

  render();
})();
