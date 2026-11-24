(function () {
  'use strict';

  var storageKey = 'ayatify.personalLearning.dashboard.v1';
  var timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  var notice = document.getElementById('dashboardNotice');
  var storageAvailable = true;
  var storageLoadError = '';
  var noticeTimer;

  function localDateKey(date) {
    var parts = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date).forEach(function (part) {
      parts[part.type] = part.value;
    });
    return parts.year + '-' + parts.month + '-' + parts.day;
  }

  function offsetDateKey(offset) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    return localDateKey(date);
  }

  function newId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
  }

  function initialState() {
    var now = new Date();
    return {
      name: 'Sahabat Qur’an',
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      progress: { juz: 2, surah: 8, ayat: 216 },
      continuation: { surah: 'Al-Baqarah', ayah: 120, updatedAt: new Date(now.getTime() - 3600000).toISOString() },
      reviews: [
        { id: 'review-fatihah', surah: 'Al-Fatihah', range: '1-7', due: 'Hari ini' },
        { id: 'review-mulk', surah: 'Al-Mulk', range: '1-10', due: 'Hari ini' },
        { id: 'review-ikhlas', surah: 'Al-Ikhlas', range: '1-4', due: 'Besok' }
      ],
      ziyadah: { completed: 7, target: 20 },
      dailyGoals: {
        date: localDateKey(now),
        reading: { done: 3, target: 5 },
        memorizing: { done: 1, target: 3 }
      },
      activities: [
        { id: 'activity-1', title: 'Membaca Al-Baqarah ayat 111-120', at: new Date(now.getTime() - 3600000).toISOString() },
        { id: 'activity-2', title: 'Murajaah Al-Fatihah ayat 1-7', at: new Date(now.getTime() - 86400000).toISOString() }
      ],
      notes: '',
      upcomingGoals: [
        { id: 'goal-1', title: 'Murajaah Juz 30', date: offsetDateKey(2), done: false },
        { id: 'goal-2', title: 'Menyelesaikan target ziyadah', date: offsetDateKey(5), done: false }
      ]
    };
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isCount(value, max) {
    return Number.isInteger(value) && value >= 0 && value <= max;
  }

  function validState(data) {
    return isObject(data) &&
      typeof data.name === 'string' &&
      (data.theme === 'light' || data.theme === 'dark') &&
      isObject(data.progress) &&
      isCount(data.progress.juz, 30) &&
      isCount(data.progress.surah, 114) &&
      isCount(data.progress.ayat, 6236) &&
      isObject(data.continuation) &&
      typeof data.continuation.surah === 'string' &&
      isCount(data.continuation.ayah, 6236) &&
      typeof data.continuation.updatedAt === 'string' &&
      Array.isArray(data.reviews) &&
      data.reviews.every(function (item) {
        return isObject(item) && typeof item.id === 'string' &&
          typeof item.surah === 'string' && typeof item.range === 'string' &&
          typeof item.due === 'string';
      }) &&
      isObject(data.ziyadah) &&
      isCount(data.ziyadah.completed, 100000) &&
      Number.isInteger(data.ziyadah.target) && data.ziyadah.target >= 1 && data.ziyadah.target <= 1000 &&
      isObject(data.dailyGoals) &&
      typeof data.dailyGoals.date === 'string' &&
      isObject(data.dailyGoals.reading) &&
      isCount(data.dailyGoals.reading.done, 100000) &&
      Number.isInteger(data.dailyGoals.reading.target) && data.dailyGoals.reading.target >= 1 && data.dailyGoals.reading.target <= 1000 &&
      isObject(data.dailyGoals.memorizing) &&
      isCount(data.dailyGoals.memorizing.done, 100000) &&
      Number.isInteger(data.dailyGoals.memorizing.target) && data.dailyGoals.memorizing.target >= 1 && data.dailyGoals.memorizing.target <= 1000 &&
      Array.isArray(data.activities) &&
      data.activities.every(function (item) {
        return isObject(item) && typeof item.id === 'string' &&
          typeof item.title === 'string' && typeof item.at === 'string';
      }) &&
      typeof data.notes === 'string' &&
      Array.isArray(data.upcomingGoals) &&
      data.upcomingGoals.every(function (item) {
        return isObject(item) && typeof item.id === 'string' &&
          typeof item.title === 'string' && typeof item.date === 'string' &&
          typeof item.done === 'boolean';
      });
  }

  function announce(message, kind) {
    notice.textContent = message;
    notice.dataset.kind = kind || 'success';
    notice.hidden = false;
    window.clearTimeout(noticeTimer);
    if (kind !== 'error') {
      noticeTimer = window.setTimeout(function () {
        notice.hidden = true;
      }, 4000);
    }
  }

  function readState() {
    try {
      var serialized = window.localStorage.getItem(storageKey);
      if (!serialized) return initialState();
      var saved = JSON.parse(serialized);
      if (!isObject(saved) || saved.version !== 1 || !validState(saved.data)) {
        throw new Error('Format data dashboard tidak dikenali.');
      }
      return saved.data;
    } catch (error) {
      storageAvailable = false;
      storageLoadError = error instanceof SyntaxError
        ? 'Data dashboard tersimpan tidak dapat dibaca.'
        : error.message || 'Penyimpanan lokal tidak tersedia.';
      return initialState();
    }
  }

  var state = readState();

  function persistState(message) {
    if (!storageAvailable) {
      announce(storageLoadError + ' Perubahan hanya berlaku selama halaman ini terbuka.', 'error');
      return false;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, data: state }));
      announce(message || 'Perubahan berhasil disimpan di browser ini.');
      return true;
    } catch (error) {
      storageAvailable = false;
      storageLoadError = 'Gagal menyimpan perubahan ke penyimpanan browser.';
      announce(storageLoadError + ' Pastikan penyimpanan browser tersedia.', 'error');
      return false;
    }
  }

  function addActivity(title) {
    state.activities.unshift({ id: newId('activity'), title: title, at: new Date().toISOString() });
    state.activities = state.activities.slice(0, 8);
  }

  function persistCompletedActivity(message) {
    return persistState(message);
  }

  function formatDateTime(value, options) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Baru saja';
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  }

  function renderClock() {
    var now = new Date();
    var today = localDateKey(now);
    document.getElementById('dashboardDate').textContent = formatDateTime(now, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    document.getElementById('dashboardTime').textContent = formatDateTime(now, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    var hour = now.getHours();
    document.getElementById('greeting').textContent = hour < 11
      ? 'Selamat pagi'
      : hour < 15
        ? 'Selamat siang'
        : hour < 18
          ? 'Selamat sore'
          : 'Selamat malam';

    if (state.dailyGoals.date !== today) {
      state.dailyGoals.date = today;
      state.dailyGoals.reading.done = 0;
      state.dailyGoals.memorizing.done = 0;
      renderDailyGoals();
      persistState('Target harian diperbarui untuk hari ini.');
    }
  }

  function applyTheme() {
    var button = document.getElementById('themeToggle');
    var dark = state.theme === 'dark';
    document.body.dataset.theme = state.theme;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    button.innerHTML = dark
      ? '<i class="bi bi-sun" aria-hidden="true"></i><span>Mode terang</span>'
      : '<i class="bi bi-moon-stars" aria-hidden="true"></i><span>Mode gelap</span>';
  }

  function renderWelcome() {
    document.getElementById('userName').textContent = state.name;
    document.getElementById('nameInput').value = state.name;
    var motivations = [
      'Sedikit tetapi konsisten adalah langkah baik dalam perjalanan belajar.',
      'Luangkan waktu hari ini untuk membaca, memahami, dan merenungkan ayat.',
      'Setiap pengulangan membantu menjaga hafalan tetap dekat di hati.',
      'Belajar dengan tenang; setiap usaha memiliki nilai.'
    ];
    var dayOfYear = Math.floor((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    document.getElementById('dailyMotivation').textContent = motivations[dayOfYear % motivations.length];
  }

  function renderProgress() {
    document.getElementById('progressJuz').textContent = state.progress.juz;
    document.getElementById('progressSurah').textContent = state.progress.surah;
    document.getElementById('progressAyat').textContent = state.progress.ayat.toLocaleString('id-ID');
    document.getElementById('progressJuzInput').value = state.progress.juz;
    document.getElementById('progressSurahInput').value = state.progress.surah;
    document.getElementById('progressAyatInput').value = state.progress.ayat;
  }

  function renderContinue() {
    document.getElementById('continueLocation').textContent = state.continuation.surah + ', ayat ' + state.continuation.ayah;
    document.getElementById('continueUpdated').textContent = 'Terakhir dicatat ' + formatDateTime(state.continuation.updatedAt, {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById('continueSurahInput').value = state.continuation.surah;
    document.getElementById('continueAyatInput').value = state.continuation.ayah;
  }

  function emptyList(message) {
    var item = document.createElement('li');
    item.className = 'dashboard-empty-state';
    item.textContent = message;
    return item;
  }

  function renderReviews() {
    var list = document.getElementById('reviewList');
    list.replaceChildren();
    if (!state.reviews.length) {
      list.appendChild(emptyList('Belum ada hafalan dalam daftar murajaah.'));
      return;
    }
    state.reviews.forEach(function (review) {
      var item = document.createElement('li');
      item.className = 'dashboard-list-item';
      var main = document.createElement('div');
      main.className = 'dashboard-list-item-main';
      var title = document.createElement('strong');
      title.textContent = review.surah;
      var detail = document.createElement('span');
      detail.textContent = 'Ayat ' + review.range + ' · ' + review.due;
      var action = document.createElement('button');
      action.type = 'button';
      action.className = 'dashboard-list-action';
      action.textContent = 'Selesai';
      action.setAttribute('aria-label', 'Tandai murajaah ' + review.surah + ' ayat ' + review.range + ' selesai');
      action.addEventListener('click', function () {
        state.reviews = state.reviews.filter(function (candidate) { return candidate.id !== review.id; });
        addActivity('Menyelesaikan murajaah ' + review.surah + ' ayat ' + review.range);
        renderAll();
        persistCompletedActivity('Murajaah ditandai selesai.');
      });
      main.append(title, detail);
      item.append(main, action);
      list.appendChild(item);
    });
  }

  function setMeter(meterId, barId, completed, target) {
    var percent = target > 0 ? Math.min(100, Math.round(completed / target * 100)) : 0;
    document.getElementById(barId).style.width = percent + '%';
    document.getElementById(meterId).setAttribute('aria-valuenow', String(percent));
  }

  function renderZiyadah() {
    var percent = state.ziyadah.target > 0
      ? Math.min(100, Math.round(state.ziyadah.completed / state.ziyadah.target * 100))
      : 0;
    document.getElementById('ziyadahCompleted').textContent = state.ziyadah.completed;
    document.getElementById('ziyadahTarget').textContent = state.ziyadah.target;
    document.getElementById('ziyadahPercent').textContent = percent + '%';
    document.getElementById('ziyadahBar').style.width = percent + '%';
    document.getElementById('ziyadahMeter').setAttribute('aria-valuenow', String(percent));
    document.getElementById('ziyadahTargetInput').value = state.ziyadah.target;
  }

  function renderDailyGoals() {
    document.getElementById('readingDone').textContent = state.dailyGoals.reading.done;
    document.getElementById('readingTarget').textContent = state.dailyGoals.reading.target;
    document.getElementById('memorizingDone').textContent = state.dailyGoals.memorizing.done;
    document.getElementById('memorizingTarget').textContent = state.dailyGoals.memorizing.target;
    setMeter('readingMeter', 'readingBar', state.dailyGoals.reading.done, state.dailyGoals.reading.target);
    setMeter('memorizingMeter', 'memorizingBar', state.dailyGoals.memorizing.done, state.dailyGoals.memorizing.target);
    document.getElementById('readingTargetInput').value = state.dailyGoals.reading.target;
    document.getElementById('memorizingTargetInput').value = state.dailyGoals.memorizing.target;
    document.querySelectorAll('.daily-goal-action').forEach(function (button) {
      var goal = state.dailyGoals[button.dataset.goal];
      button.disabled = goal.done >= goal.target;
      if (button.disabled) button.setAttribute('aria-label', 'Target hari ini sudah tercapai');
      else button.removeAttribute('aria-label');
    });
  }

  function renderActivities() {
    var list = document.getElementById('activityList');
    list.replaceChildren();
    if (!state.activities.length) {
      list.appendChild(emptyList('Aktivitas belajar yang dicatat akan muncul di sini.'));
      return;
    }
    state.activities.slice(0, 6).forEach(function (activity) {
      var item = document.createElement('li');
      item.className = 'dashboard-activity-item';
      var icon = document.createElement('span');
      icon.className = 'activity-dot';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<i class="bi bi-check2"></i>';
      var title = document.createElement('strong');
      title.textContent = activity.title;
      var time = document.createElement('time');
      time.dateTime = activity.at;
      time.textContent = formatDateTime(activity.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      item.append(icon, title, time);
      list.appendChild(item);
    });
  }

  function renderUpcomingGoals() {
    var list = document.getElementById('upcomingList');
    list.replaceChildren();
    if (!state.upcomingGoals.length) {
      list.appendChild(emptyList('Belum ada target mendatang. Tambahkan target baru.'));
      return;
    }
    state.upcomingGoals.forEach(function (goal) {
      var item = document.createElement('li');
      item.className = 'dashboard-list-item dashboard-goal-item' + (goal.done ? ' is-complete' : '');
      var main = document.createElement('div');
      main.className = 'dashboard-list-item-main';
      var title = document.createElement('strong');
      title.textContent = goal.title;
      var due = document.createElement('span');
      due.textContent = 'Target ' + formatDateTime(goal.date + 'T00:00:00', { day: 'numeric', month: 'long' });
      var actions = document.createElement('div');
      actions.className = 'dashboard-list-actions';
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'dashboard-list-action';
      toggle.setAttribute('aria-pressed', String(goal.done));
      toggle.textContent = goal.done ? 'Selesai' : 'Tandai';
      toggle.addEventListener('click', function () {
        goal.done = !goal.done;
        addActivity((goal.done ? 'Menyelesaikan target: ' : 'Membuka kembali target: ') + goal.title);
        renderAll();
        if (goal.done) persistCompletedActivity('Target ditandai selesai.');
        else persistState('Target dibuka kembali.');
      });
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'dashboard-list-delete';
      remove.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
      remove.setAttribute('aria-label', 'Hapus target ' + goal.title);
      remove.addEventListener('click', function () {
        state.upcomingGoals = state.upcomingGoals.filter(function (candidate) { return candidate.id !== goal.id; });
        renderUpcomingGoals();
        persistState('Target dihapus.');
      });
      main.append(title, due);
      actions.append(toggle, remove);
      item.append(main, actions);
      list.appendChild(item);
    });
  }

  function renderNotes() {
    var input = document.getElementById('notesInput');
    if (input.dataset.loaded !== 'true') {
      input.value = state.notes;
      input.dataset.loaded = 'true';
    }
  }

  function renderAll() {
    renderWelcome();
    renderProgress();
    renderContinue();
    renderReviews();
    renderZiyadah();
    renderDailyGoals();
    renderActivities();
    renderUpcomingGoals();
    renderNotes();
    applyTheme();
  }

  function setFormVisibility(form, visible) {
    form.hidden = !visible;
    var controller = document.querySelector('[aria-controls="' + form.id + '"]');
    if (controller) controller.setAttribute('aria-expanded', String(visible));
  }

  function toggleForm(form, button) {
    var shouldOpen = form.hidden;
    setFormVisibility(form, shouldOpen);
    if (button) button.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) {
      var firstInput = form.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  function bindCancelButtons() {
    document.querySelectorAll('[data-cancel-form]').forEach(function (button) {
      button.addEventListener('click', function () {
        var form = button.closest('form');
        if (form) setFormVisibility(form, false);
      });
    });
  }

  function bindForms() {
    var nameForm = document.getElementById('nameForm');
    document.getElementById('editNameToggle').addEventListener('click', function () {
      toggleForm(nameForm, this);
    });
    document.getElementById('cancelNameEdit').addEventListener('click', function () {
      setFormVisibility(nameForm, false);
      document.getElementById('nameInput').value = state.name;
    });
    nameForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('nameInput').value.trim();
      if (!name) {
        announce('Nama sapaan tidak boleh kosong.', 'error');
        return;
      }
      state.name = name;
      setFormVisibility(nameForm, false);
      renderWelcome();
      persistState('Nama sapaan berhasil diperbarui.');
    });

    var progressForm = document.getElementById('progressForm');
    document.getElementById('editProgressToggle').addEventListener('click', function () {
      toggleForm(progressForm, this);
    });
    progressForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.progress = {
        juz: Number(document.getElementById('progressJuzInput').value),
        surah: Number(document.getElementById('progressSurahInput').value),
        ayat: Number(document.getElementById('progressAyatInput').value)
      };
      addActivity('Memperbarui progres Al-Qur’an');
      setFormVisibility(progressForm, false);
      renderAll();
      persistState('Progres Al-Qur’an berhasil diperbarui.');
    });

    var continueForm = document.getElementById('continueForm');
    document.getElementById('continueToggle').addEventListener('click', function () {
      toggleForm(continueForm, this);
    });
    continueForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var surah = document.getElementById('continueSurahInput').value.trim();
      var ayah = Number(document.getElementById('continueAyatInput').value);
      if (!surah || !Number.isInteger(ayah) || ayah < 1 || ayah > 6236) {
        announce('Masukkan nama surah dan nomor ayat yang valid.', 'error');
        return;
      }
      state.continuation = { surah: surah, ayah: ayah, updatedAt: new Date().toISOString() };
      state.progress.ayat = Math.min(6236, state.progress.ayat + 1);
      if (state.dailyGoals.reading.done < state.dailyGoals.reading.target) state.dailyGoals.reading.done += 1;
      addActivity('Melanjutkan belajar ' + surah + ' ayat ' + ayah);
      setFormVisibility(continueForm, false);
      renderAll();
      persistCompletedActivity('Sesi belajar dan lokasi terakhir berhasil dicatat.');
    });

    var reviewForm = document.getElementById('reviewForm');
    document.getElementById('addReviewToggle').addEventListener('click', function () {
      toggleForm(reviewForm, this);
    });
    reviewForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var surah = document.getElementById('reviewSurahInput').value.trim();
      var range = document.getElementById('reviewRangeInput').value.trim();
      if (!surah || !range) {
        announce('Lengkapi nama surah dan rentang ayat untuk murajaah.', 'error');
        return;
      }
      state.reviews.unshift({ id: newId('review'), surah: surah, range: range, due: 'Hari ini' });
      addActivity('Menambahkan murajaah ' + surah + ' ayat ' + range);
      reviewForm.reset();
      setFormVisibility(reviewForm, false);
      renderAll();
      persistState('Hafalan ditambahkan ke daftar murajaah.');
    });

    document.getElementById('addZiyadahAyat').addEventListener('click', function () {
      state.ziyadah.completed += 1;
      addActivity('Menambahkan 1 ayat pada progres ziyadah');
      renderAll();
      persistCompletedActivity('Progres ziyadah diperbarui.');
    });
    var ziyadahForm = document.getElementById('ziyadahForm');
    document.getElementById('ziyadahGoalToggle').addEventListener('click', function () {
      toggleForm(ziyadahForm, this);
    });
    ziyadahForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.ziyadah.target = Number(document.getElementById('ziyadahTargetInput').value);
      setFormVisibility(ziyadahForm, false);
      renderZiyadah();
      persistState('Target ziyadah berhasil diperbarui.');
    });

    var dailyGoalsForm = document.getElementById('dailyGoalsForm');
    document.getElementById('dailyGoalsToggle').addEventListener('click', function () {
      toggleForm(dailyGoalsForm, this);
    });
    dailyGoalsForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.dailyGoals.reading.target = Number(document.getElementById('readingTargetInput').value);
      state.dailyGoals.memorizing.target = Number(document.getElementById('memorizingTargetInput').value);
      setFormVisibility(dailyGoalsForm, false);
      renderDailyGoals();
      persistState('Target harian berhasil diperbarui.');
    });
    document.querySelectorAll('.daily-goal-action').forEach(function (button) {
      button.addEventListener('click', function () {
        var goal = state.dailyGoals[button.dataset.goal];
        if (goal.done >= goal.target) return;
        goal.done += 1;
        addActivity(button.dataset.goal === 'reading' ? 'Mencatat 1 ayat bacaan harian' : 'Mencatat 1 ayat hafalan harian');
        renderAll();
        persistCompletedActivity('Progres target harian diperbarui.');
      });
    });

    var upcomingForm = document.getElementById('upcomingForm');
    document.getElementById('addGoalToggle').addEventListener('click', function () {
      var dateInput = document.getElementById('upcomingDateInput');
      dateInput.min = localDateKey(new Date());
      if (!dateInput.value) dateInput.value = offsetDateKey(3);
      toggleForm(upcomingForm, this);
    });
    upcomingForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var title = document.getElementById('upcomingTitleInput').value.trim();
      var date = document.getElementById('upcomingDateInput').value;
      if (!title || !date || date < localDateKey(new Date())) {
        announce('Masukkan target dan tanggal hari ini atau setelahnya.', 'error');
        return;
      }
      state.upcomingGoals.push({ id: newId('goal'), title: title, date: date, done: false });
      addActivity('Menambahkan target belajar: ' + title);
      upcomingForm.reset();
      setFormVisibility(upcomingForm, false);
      renderAll();
      persistState('Target belajar berhasil ditambahkan.');
    });

    var notesForm = document.getElementById('notesForm');
    notesForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.notes = document.getElementById('notesInput').value;
      addActivity('Menyimpan catatan perjalanan mengaji');
      renderActivities();
      document.getElementById('notesSaved').textContent = 'Tersimpan ' + formatDateTime(new Date(), { hour: '2-digit', minute: '2-digit' });
      persistState('Catatan berhasil disimpan.');
    });

    document.getElementById('themeToggle').addEventListener('click', function () {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      persistState('Tampilan ' + (state.theme === 'dark' ? 'gelap' : 'terang') + ' diaktifkan.');
    });
    bindCancelButtons();
  }

  function initialize() {
    if (state.dailyGoals.date !== localDateKey(new Date())) {
      state.dailyGoals.date = localDateKey(new Date());
      state.dailyGoals.reading.done = 0;
      state.dailyGoals.memorizing.done = 0;
    }
    renderAll();
    renderClock();
    bindForms();
    window.setInterval(renderClock, 1000);
    if (storageLoadError) announce(storageLoadError + ' Data contoh ditampilkan; perubahan tidak akan disimpan.', 'error');
  }

  initialize();
})();
