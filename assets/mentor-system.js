(function () {
  'use strict';

  var storageKey = 'ayatify.mentorSystem.dashboard.v1';
  var notice = document.getElementById('mentorNotice');
  var storageAvailable = true;
  var storageError = '';
  var noticeTimer;

  function localDateKey(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  function offsetDateKey(offset) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    return localDateKey(date);
  }

  function makeId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
  }

  function initialState() {
    var now = new Date();
    var groups = [
      { id: 'group-tahfidz', name: 'Tahfidz Al-Falaq' },
      { id: 'group-tilawah', name: 'Halaqah Tilawah' }
    ];
    var students = [
      { id: 'student-salma', name: 'Salma Putri', groupId: groups[0].id, juz: 3, surah: 12, ayat: 284 },
      { id: 'student-rafi', name: 'Rafi Hidayat', groupId: groups[0].id, juz: 2, surah: 8, ayat: 190 },
      { id: 'student-naila', name: 'Naila Zahra', groupId: groups[1].id, juz: 5, surah: 17, ayat: 402 },
      { id: 'student-umar', name: 'Umar Faruq', groupId: groups[1].id, juz: 1, surah: 5, ayat: 104 }
    ];
    return {
      version: 1,
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      mentorName: 'Ustaz Ahmad',
      groups: groups,
      students: students,
      submissions: [
        { id: 'submission-1', studentId: 'student-salma', surah: 'Al-Mulk', range: '1-10', type: 'Hafalan baru', submittedAt: new Date(now.getTime() - 45 * 60000).toISOString(), status: 'pending', feedback: '' },
        { id: 'submission-2', studentId: 'student-rafi', surah: 'Al-Kahfi', range: '1-8', type: 'Murajaah', submittedAt: new Date(now.getTime() - 3 * 3600000).toISOString(), status: 'pending', feedback: '' },
        { id: 'submission-3', studentId: 'student-naila', surah: 'Maryam', range: '1-6', type: 'Hafalan baru', submittedAt: new Date(now.getTime() - 86400000).toISOString(), status: 'approved', feedback: 'Bacaan sudah baik. Jaga ketelitian pada panjang pendek.' }
      ],
      assignments: [
        { id: 'assignment-1', title: 'Murajaah Al-Fatihah dan Al-Ikhlas', type: 'Murajaah', due: offsetDateKey(2), completedBy: ['student-naila'] },
        { id: 'assignment-2', title: 'Membaca Al-Baqarah ayat 1-10', type: 'Membaca', due: offsetDateKey(4), completedBy: [] }
      ],
      schedule: [
        { id: 'schedule-1', title: 'Setoran hafalan pekanan', groupId: groups[0].id, date: offsetDateKey(1), time: '08:00' },
        { id: 'schedule-2', title: 'Halaqah tilawah', groupId: groups[1].id, date: offsetDateKey(3), time: '15:30' }
      ],
      evaluations: [
        { id: 'evaluation-1', studentId: 'student-naila', rating: 4, feedback: 'Kelancaran semakin baik. Pertahankan murajaah harian dan perhatikan makhraj.', at: new Date(now.getTime() - 86400000).toISOString() }
      ],
      attendance: [
        { id: 'attendance-1', studentId: 'student-salma', date: localDateKey(now), status: 'present' },
        { id: 'attendance-2', studentId: 'student-rafi', date: localDateKey(now), status: 'present' },
        { id: 'attendance-3', studentId: 'student-naila', date: localDateKey(now), status: 'absent' }
      ]
    };
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isText(value) {
    return typeof value === 'string';
  }

  function isCount(value, max) {
    return Number.isInteger(value) && value >= 0 && value <= max;
  }

  function validState(data) {
    return isObject(data) && data.version === 1 &&
      (data.theme === 'light' || data.theme === 'dark') &&
      isText(data.mentorName) &&
      Array.isArray(data.groups) && data.groups.every(function (group) {
        return isObject(group) && isText(group.id) && isText(group.name);
      }) &&
      Array.isArray(data.students) && data.students.every(function (student) {
        return isObject(student) && isText(student.id) && isText(student.name) &&
          isText(student.groupId) && isCount(student.juz, 30) &&
          isCount(student.surah, 114) && isCount(student.ayat, 6236);
      }) &&
      Array.isArray(data.submissions) && data.submissions.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.studentId) &&
          isText(item.surah) && isText(item.range) && isText(item.type) &&
          isText(item.submittedAt) && ['pending', 'approved', 'revision'].indexOf(item.status) !== -1 &&
          isText(item.feedback);
      }) &&
      Array.isArray(data.assignments) && data.assignments.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isText(item.type) && isText(item.due) && Array.isArray(item.completedBy) &&
          item.completedBy.every(isText);
      }) &&
      Array.isArray(data.schedule) && data.schedule.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isText(item.groupId) && isText(item.date) && isText(item.time);
      }) &&
      Array.isArray(data.evaluations) && data.evaluations.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.studentId) &&
          isCount(item.rating, 5) && item.rating > 0 && isText(item.feedback) && isText(item.at);
      }) &&
      Array.isArray(data.attendance) && data.attendance.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.studentId) &&
          isText(item.date) && ['present', 'absent'].indexOf(item.status) !== -1;
      });
  }

  function announce(message, kind) {
    notice.textContent = message;
    notice.dataset.kind = kind || 'success';
    notice.hidden = false;
    window.clearTimeout(noticeTimer);
    if (kind !== 'error') {
      noticeTimer = window.setTimeout(function () { notice.hidden = true; }, 4000);
    }
  }

  function readState() {
    try {
      var serialized = window.localStorage.getItem(storageKey);
      if (!serialized) return initialState();
      var saved = JSON.parse(serialized);
      if (!validState(saved)) throw new Error('Format data Mentor System tidak dikenali.');
      return saved;
    } catch (error) {
      storageAvailable = false;
      storageError = error instanceof SyntaxError
        ? 'Data Mentor System tersimpan tidak dapat dibaca.'
        : error.message || 'Penyimpanan browser tidak tersedia.';
      return initialState();
    }
  }

  var state = readState();

  function saveState(message) {
    if (!storageAvailable) {
      announce(storageError + ' Perubahan hanya berlaku selama halaman ini terbuka.', 'error');
      return false;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
      announce(message || 'Perubahan berhasil disimpan di browser ini.');
      return true;
    } catch (error) {
      storageAvailable = false;
      storageError = 'Gagal menyimpan data Mentor System ke browser.';
      announce(storageError + ' Pastikan ruang penyimpanan tersedia.', 'error');
      return false;
    }
  }

  function formatDate(value, options) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join('');
  }

  function studentById(id) {
    return state.students.find(function (student) { return student.id === id; });
  }

  function groupById(id) {
    return state.groups.find(function (group) { return group.id === id; });
  }

  function emptyItem(message) {
    var item = document.createElement('li');
    item.className = 'dashboard-empty-state';
    item.textContent = message;
    return item;
  }

  function setFormVisibility(form, visible) {
    form.hidden = !visible;
    var controller = document.querySelector('[aria-controls="' + form.id + '"]');
    if (controller) controller.setAttribute('aria-expanded', String(visible));
  }

  function toggleForm(form, button) {
    var open = form.hidden;
    setFormVisibility(form, open);
    if (button) button.setAttribute('aria-expanded', String(open));
    if (open) {
      var field = form.querySelector('input:not([type="hidden"]), textarea, select');
      if (field) field.focus();
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

  function applyTheme() {
    var button = document.getElementById('mentorThemeToggle');
    var dark = state.theme === 'dark';
    document.body.dataset.theme = state.theme;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    button.innerHTML = dark
      ? '<i class="bi bi-sun" aria-hidden="true"></i><span>Mode terang</span>'
      : '<i class="bi bi-moon-stars" aria-hidden="true"></i><span>Mode gelap</span>';
  }

  function renderClock() {
    var now = new Date();
    document.getElementById('mentorDate').textContent = formatDate(now, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById('mentorTime').textContent = formatDate(now, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function populateSelect(select, items, selectedId, emptyLabel) {
    select.replaceChildren();
    if (!items.length) {
      var empty = document.createElement('option');
      empty.value = '';
      empty.textContent = emptyLabel;
      select.appendChild(empty);
      select.disabled = true;
      return;
    }
    select.disabled = false;
    items.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      option.selected = item.id === selectedId;
      select.appendChild(option);
    });
  }

  function renderOverview() {
    var total = state.students.length;
    var today = localDateKey(new Date());
    var attendance = state.attendance.filter(function (item) { return item.date === today; });
    var present = attendance.filter(function (item) { return item.status === 'present'; }).length;
    var percent = total ? Math.round(present / total * 100) : 0;
    document.getElementById('mentorName').textContent = state.mentorName;
    document.getElementById('overviewStudents').textContent = total;
    document.getElementById('overviewGroups').textContent = state.groups.length;
    document.getElementById('overviewSubmissions').textContent = state.submissions.filter(function (item) { return item.status === 'pending'; }).length;
    document.getElementById('overviewAttendance').textContent = percent + '%';
  }

  function renderStudents() {
    var list = document.getElementById('studentList');
    var groupInput = document.getElementById('studentGroupInput');
    var progressInput = document.getElementById('progressStudentInput');
    var evaluationInput = document.getElementById('evaluationStudentInput');
    list.replaceChildren();
    populateSelect(groupInput, state.groups, groupInput.value, 'Buat kelompok terlebih dahulu');
    populateSelect(progressInput, state.students, progressInput.value, 'Tambahkan murid terlebih dahulu');
    populateSelect(evaluationInput, state.students, evaluationInput.value, 'Tambahkan murid terlebih dahulu');
    if (!state.students.length) {
      list.appendChild(emptyItem('Belum ada murid. Tambahkan murid untuk memulai pendampingan.'));
      return;
    }
    state.students.forEach(function (student) {
      var item = document.createElement('li');
      item.className = 'mentor-student-item';
      var avatar = document.createElement('span');
      avatar.className = 'mentor-mini-avatar';
      avatar.textContent = initials(student.name);
      var copy = document.createElement('span');
      copy.className = 'mentor-item-copy';
      var name = document.createElement('strong');
      name.textContent = student.name;
      var group = groupById(student.groupId);
      var details = document.createElement('span');
      details.textContent = (group ? group.name : 'Tanpa kelompok') + ' · ' + student.juz + ' juz';
      copy.append(name, details);
      item.append(avatar, copy);
      list.appendChild(item);
    });
  }

  function renderGroups() {
    var list = document.getElementById('groupList');
    var scheduleGroup = document.getElementById('scheduleGroupInput');
    list.replaceChildren();
    populateSelect(scheduleGroup, state.groups, scheduleGroup.value, 'Buat kelompok terlebih dahulu');
    if (!state.groups.length) {
      list.appendChild(emptyItem('Belum ada kelompok belajar.'));
      return;
    }
    state.groups.forEach(function (group) {
      var item = document.createElement('li');
      item.className = 'mentor-group-item';
      var avatar = document.createElement('span');
      avatar.className = 'mentor-mini-avatar';
      avatar.innerHTML = '<i class="bi bi-people-fill" aria-hidden="true"></i>';
      var copy = document.createElement('span');
      copy.className = 'mentor-item-copy';
      var name = document.createElement('strong');
      name.textContent = group.name;
      var count = state.students.filter(function (student) { return student.groupId === group.id; }).length;
      var meta = document.createElement('span');
      meta.className = 'mentor-group-meta';
      meta.textContent = count + ' murid';
      copy.append(name, meta);
      item.append(avatar, copy);
      list.appendChild(item);
    });
  }

  function renderProgress() {
    var body = document.getElementById('progressTableBody');
    body.replaceChildren();
    if (!state.students.length) {
      var row = document.createElement('tr');
      var cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'Tambahkan murid untuk melihat progres hafalan.';
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }
    state.students.forEach(function (student) {
      var row = document.createElement('tr');
      var name = document.createElement('td');
      name.textContent = student.name;
      var groupCell = document.createElement('td');
      var group = groupById(student.groupId);
      groupCell.textContent = group ? group.name : '-';
      var progress = document.createElement('td');
      progress.className = 'mentor-progress-cell';
      var progressText = document.createElement('span');
      progressText.textContent = student.juz + ' juz · ' + student.surah + ' surah · ' + student.ayat + ' ayat';
      var meter = document.createElement('div');
      meter.className = 'dashboard-meter dashboard-meter--small';
      meter.setAttribute('role', 'progressbar');
      meter.setAttribute('aria-label', 'Progres hafalan ' + student.name);
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      var bar = document.createElement('span');
      var percent = Math.min(100, Math.round(student.juz / 30 * 100));
      meter.setAttribute('aria-valuenow', String(percent));
      bar.style.width = percent + '%';
      meter.appendChild(bar);
      progress.append(progressText, meter);
      var milestone = document.createElement('td');
      milestone.textContent = student.juz >= 30 ? 'Target 30 juz tercapai' : 'Menuju ' + Math.min(30, Math.ceil((student.juz + 1) / 5) * 5) + ' juz';
      row.append(name, groupCell, progress, milestone);
      body.appendChild(row);
    });
  }

  function renderSubmissions() {
    var list = document.getElementById('submissionList');
    var pending = state.submissions.filter(function (item) { return item.status === 'pending'; }).length;
    list.replaceChildren();
    document.getElementById('pendingSubmissionBadge').textContent = pending + ' menunggu';
    var sorted = state.submissions.slice().sort(function (a, b) { return b.submittedAt.localeCompare(a.submittedAt); });
    if (!sorted.length) {
      list.appendChild(emptyItem('Belum ada setoran hafalan yang masuk.'));
      return;
    }
    sorted.slice(0, 8).forEach(function (submission) {
      var item = document.createElement('li');
      item.className = 'mentor-submission-item';
      var heading = document.createElement('div');
      heading.className = 'mentor-submission-heading';
      var title = document.createElement('strong');
      var student = studentById(submission.studentId);
      title.textContent = (student ? student.name : 'Murid') + ' · ' + submission.surah + ' ' + submission.range;
      var status = document.createElement('span');
      status.className = 'mentor-status-badge';
      status.dataset.status = submission.status;
      status.textContent = submission.status === 'pending' ? 'Menunggu' : submission.status === 'approved' ? 'Diterima' : 'Perlu diperbaiki';
      heading.append(title, status);
      var meta = document.createElement('span');
      meta.className = 'mentor-submission-meta';
      meta.textContent = submission.type + ' · ' + formatDate(submission.submittedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      var feedback = document.createElement('textarea');
      feedback.rows = 2;
      feedback.maxLength = 400;
      feedback.value = submission.feedback;
      feedback.setAttribute('aria-label', 'Masukan untuk setoran ' + (student ? student.name : 'murid'));
      feedback.placeholder = 'Masukan singkat untuk murid (opsional untuk setoran diterima)';
      var actions = document.createElement('div');
      actions.className = 'mentor-item-actions';
      var approve = document.createElement('button');
      approve.type = 'button';
      approve.className = 'dashboard-button';
      approve.textContent = 'Terima setoran';
      approve.disabled = submission.status === 'approved';
      approve.addEventListener('click', function () {
        submission.status = 'approved';
        submission.feedback = feedback.value.trim();
        renderAll();
        saveState('Setoran diterima dan evaluasi tersimpan.');
      });
      var revision = document.createElement('button');
      revision.type = 'button';
      revision.className = 'dashboard-quiet-button';
      revision.textContent = 'Perlu diperbaiki';
      revision.disabled = submission.status === 'revision';
      revision.addEventListener('click', function () {
        var note = feedback.value.trim();
        if (!note) {
          announce('Tuliskan masukan sebelum meminta murid memperbaiki setoran.', 'error');
          feedback.focus();
          return;
        }
        submission.status = 'revision';
        submission.feedback = note;
        renderAll();
        saveState('Masukan perbaikan berhasil dikirim.');
      });
      actions.append(approve, revision);
      item.append(heading, meta, feedback, actions);
      if (submission.feedback) {
        var savedFeedback = document.createElement('span');
        savedFeedback.className = 'mentor-submission-meta';
        savedFeedback.textContent = 'Masukan tersimpan: ' + submission.feedback;
        item.appendChild(savedFeedback);
      }
      list.appendChild(item);
    });
  }

  function renderAssignments() {
    var list = document.getElementById('assignmentList');
    list.replaceChildren();
    if (!state.assignments.length) {
      list.appendChild(emptyItem('Belum ada tugas. Buat tugas membaca atau menghafal untuk murid.'));
      return;
    }
    state.assignments.slice().sort(function (a, b) { return a.due.localeCompare(b.due); }).forEach(function (assignment) {
      var item = document.createElement('li');
      item.className = 'mentor-assignment-item';
      var heading = document.createElement('div');
      heading.className = 'mentor-assignment-heading';
      var title = document.createElement('strong');
      title.textContent = assignment.title;
      var count = document.createElement('span');
      count.className = 'mentor-status-badge';
      count.textContent = assignment.completedBy.length + '/' + state.students.length + ' selesai';
      heading.append(title, count);
      var meta = document.createElement('span');
      meta.className = 'mentor-assignment-meta';
      meta.textContent = assignment.type + ' · Batas ' + formatDate(assignment.due, { day: 'numeric', month: 'long', year: 'numeric' });
      item.append(heading, meta);
      if (state.students.length) {
        var controls = document.createElement('div');
        controls.className = 'mentor-assignment-controls';
        var select = document.createElement('select');
        select.setAttribute('aria-label', 'Pilih murid untuk tugas ' + assignment.title);
        populateSelect(select, state.students.filter(function (student) {
          return assignment.completedBy.indexOf(student.id) === -1;
        }), '', 'Semua murid sudah menyelesaikan');
        var complete = document.createElement('button');
        complete.type = 'button';
        complete.className = 'dashboard-quiet-button dashboard-button--small';
        complete.textContent = 'Catat selesai';
        complete.disabled = select.disabled;
        complete.addEventListener('click', function () {
          if (!select.value) return;
          assignment.completedBy.push(select.value);
          renderAll();
          saveState('Penyelesaian tugas murid berhasil dicatat.');
        });
        controls.append(select, complete);
        item.appendChild(controls);
      }
      list.appendChild(item);
    });
  }

  function renderSchedule() {
    var list = document.getElementById('scheduleList');
    list.replaceChildren();
    var sorted = state.schedule.slice().sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });
    if (!sorted.length) {
      list.appendChild(emptyItem('Belum ada jadwal pembelajaran.'));
      return;
    }
    sorted.forEach(function (event) {
      var item = document.createElement('li');
      item.className = 'dashboard-list-item';
      var copy = document.createElement('span');
      copy.className = 'dashboard-list-item-main';
      var title = document.createElement('strong');
      title.textContent = event.title;
      var group = groupById(event.groupId);
      var details = document.createElement('span');
      details.textContent = (group ? group.name : 'Kelompok dihapus') + ' · ' + formatDate(event.date, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + event.time;
      copy.append(title, details);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'dashboard-list-delete';
      remove.setAttribute('aria-label', 'Hapus jadwal ' + event.title);
      remove.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
      remove.addEventListener('click', function () {
        state.schedule = state.schedule.filter(function (candidate) { return candidate.id !== event.id; });
        renderAll();
        saveState('Jadwal berhasil dihapus.');
      });
      item.append(copy, remove);
      list.appendChild(item);
    });
  }

  function renderEvaluations() {
    var list = document.getElementById('evaluationList');
    list.replaceChildren();
    if (!state.evaluations.length) {
      list.appendChild(emptyItem('Evaluasi yang diberikan kepada murid akan muncul di sini.'));
      return;
    }
    state.evaluations.slice().sort(function (a, b) { return b.at.localeCompare(a.at); }).slice(0, 4).forEach(function (evaluation) {
      var item = document.createElement('li');
      item.className = 'mentor-feedback-item';
      var heading = document.createElement('div');
      heading.className = 'mentor-feedback-heading';
      var name = document.createElement('strong');
      var student = studentById(evaluation.studentId);
      name.textContent = student ? student.name : 'Murid';
      var rating = document.createElement('span');
      rating.className = 'mentor-status-badge';
      rating.textContent = evaluation.rating + '/5';
      heading.append(name, rating);
      var feedback = document.createElement('p');
      feedback.textContent = evaluation.feedback;
      var date = document.createElement('span');
      date.className = 'mentor-feedback-meta';
      date.textContent = formatDate(evaluation.at, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
      item.append(heading, feedback, date);
      list.appendChild(item);
    });
  }

  function renderAttendance() {
    var list = document.getElementById('attendanceList');
    var dateInput = document.getElementById('attendanceDateInput');
    var date = dateInput.value || localDateKey(new Date());
    list.replaceChildren();
    if (!state.students.length) {
      list.appendChild(emptyItem('Tambahkan murid untuk mulai mencatat kehadiran.'));
      return;
    }
    state.students.forEach(function (student) {
      var row = document.createElement('label');
      row.className = 'mentor-attendance-row';
      var name = document.createElement('span');
      name.textContent = student.name;
      var select = document.createElement('select');
      select.dataset.attendanceStudent = student.id;
      select.setAttribute('aria-label', 'Kehadiran ' + student.name);
      var record = state.attendance.find(function (item) { return item.studentId === student.id && item.date === date; });
      [
        { value: 'unmarked', label: 'Belum ditandai' },
        { value: 'present', label: 'Hadir' },
        { value: 'absent', label: 'Tidak hadir' }
      ].forEach(function (optionData) {
        var option = document.createElement('option');
        option.value = optionData.value;
        option.textContent = optionData.label;
        option.selected = record ? record.status === optionData.value : optionData.value === 'unmarked';
        select.appendChild(option);
      });
      row.append(name, select);
      list.appendChild(row);
    });
  }

  function renderReports() {
    var today = localDateKey(new Date());
    var attendance = state.attendance.filter(function (item) { return item.date === today; });
    var present = attendance.filter(function (item) { return item.status === 'present'; }).length;
    var averageJuz = state.students.length
      ? (state.students.reduce(function (sum, student) { return sum + student.juz; }, 0) / state.students.length).toFixed(1)
      : '0';
    var approved = state.submissions.filter(function (item) { return item.status === 'approved'; }).length;
    var stats = [
      { value: averageJuz, label: 'Rata-rata juz murid' },
      { value: present + '/' + state.students.length, label: 'Hadir hari ini' },
      { value: approved, label: 'Setoran diterima' }
    ];
    var container = document.getElementById('reportStats');
    container.replaceChildren();
    stats.forEach(function (stat) {
      var item = document.createElement('div');
      item.className = 'mentor-report-stat';
      var value = document.createElement('strong');
      value.textContent = stat.value;
      var label = document.createElement('span');
      label.textContent = stat.label;
      item.append(value, label);
      container.appendChild(item);
    });
    var studentList = document.getElementById('reportStudentList');
    studentList.replaceChildren();
    if (!state.students.length) {
      studentList.appendChild(emptyItem('Laporan akan tersedia setelah murid ditambahkan.'));
      return;
    }
    state.students.forEach(function (student) {
      var item = document.createElement('li');
      item.className = 'mentor-report-row';
      var name = document.createElement('strong');
      name.textContent = student.name;
      var progress = document.createElement('span');
      progress.textContent = student.juz + '/30 juz · ' + student.ayat + ' ayat';
      var meter = document.createElement('div');
      meter.className = 'dashboard-meter dashboard-meter--small';
      var bar = document.createElement('span');
      bar.style.width = Math.min(100, Math.round(student.juz / 30 * 100)) + '%';
      meter.appendChild(bar);
      item.append(name, progress, meter);
      studentList.appendChild(item);
    });
  }

  function renderAll() {
    renderClock();
    renderOverview();
    renderStudents();
    renderGroups();
    renderProgress();
    renderSubmissions();
    renderAssignments();
    renderSchedule();
    renderEvaluations();
    renderAttendance();
    renderReports();
    applyTheme();
  }

  function bindForms() {
    var studentForm = document.getElementById('studentForm');
    document.getElementById('studentFormToggle').addEventListener('click', function () { toggleForm(studentForm, this); });
    studentForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('studentNameInput').value.trim();
      var groupId = document.getElementById('studentGroupInput').value;
      if (!name || !groupById(groupId)) {
        announce('Isi nama murid dan pilih kelompok belajar yang tersedia.', 'error');
        return;
      }
      state.students.push({ id: makeId('student'), name: name, groupId: groupId, juz: 0, surah: 0, ayat: 0 });
      studentForm.reset();
      setFormVisibility(studentForm, false);
      renderAll();
      saveState('Murid berhasil ditambahkan.');
    });

    var groupForm = document.getElementById('groupForm');
    document.getElementById('groupFormToggle').addEventListener('click', function () { toggleForm(groupForm, this); });
    groupForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('groupNameInput').value.trim();
      if (!name) {
        announce('Masukkan nama kelompok belajar.', 'error');
        return;
      }
      state.groups.push({ id: makeId('group'), name: name });
      groupForm.reset();
      setFormVisibility(groupForm, false);
      renderAll();
      saveState('Kelompok belajar berhasil dibuat.');
    });

    document.getElementById('progressForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var student = studentById(document.getElementById('progressStudentInput').value);
      if (!student) {
        announce('Pilih murid yang progresnya akan diperbarui.', 'error');
        return;
      }
      student.juz = Number(document.getElementById('progressJuzInput').value);
      student.surah = Number(document.getElementById('progressSurahInput').value);
      student.ayat = Number(document.getElementById('progressAyatInput').value);
      renderAll();
      saveState('Perkembangan hafalan murid berhasil diperbarui.');
    });

    var assignmentForm = document.getElementById('assignmentForm');
    document.getElementById('assignmentFormToggle').addEventListener('click', function () { toggleForm(assignmentForm, this); });
    assignmentForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var title = document.getElementById('assignmentTitleInput').value.trim();
      var type = document.getElementById('assignmentTypeInput').value;
      var due = document.getElementById('assignmentDueInput').value;
      if (!title || !due || due < localDateKey(new Date())) {
        announce('Lengkapi nama tugas dan pilih batas waktu hari ini atau setelahnya.', 'error');
        return;
      }
      state.assignments.unshift({ id: makeId('assignment'), title: title, type: type, due: due, completedBy: [] });
      assignmentForm.reset();
      setFormVisibility(assignmentForm, false);
      renderAll();
      saveState('Tugas baru berhasil dibuat.');
    });

    var scheduleForm = document.getElementById('scheduleForm');
    document.getElementById('scheduleFormToggle').addEventListener('click', function () {
      var date = document.getElementById('scheduleDateInput');
      date.min = localDateKey(new Date());
      if (!date.value) date.value = offsetDateKey(1);
      toggleForm(scheduleForm, this);
    });
    scheduleForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var title = document.getElementById('scheduleTitleInput').value.trim();
      var groupId = document.getElementById('scheduleGroupInput').value;
      var date = document.getElementById('scheduleDateInput').value;
      var time = document.getElementById('scheduleTimeInput').value;
      if (!title || !groupById(groupId) || !date || !time || date < localDateKey(new Date())) {
        announce('Lengkapi kegiatan, kelompok, tanggal hari ini atau setelahnya, dan waktu.', 'error');
        return;
      }
      state.schedule.push({ id: makeId('schedule'), title: title, groupId: groupId, date: date, time: time });
      scheduleForm.reset();
      setFormVisibility(scheduleForm, false);
      renderAll();
      saveState('Jadwal pembelajaran berhasil ditambahkan.');
    });

    document.getElementById('evaluationForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var studentId = document.getElementById('evaluationStudentInput').value;
      var feedback = document.getElementById('evaluationFeedbackInput').value.trim();
      if (!studentById(studentId) || !feedback) {
        announce('Pilih murid dan tuliskan masukan evaluasi.', 'error');
        return;
      }
      state.evaluations.unshift({
        id: makeId('evaluation'),
        studentId: studentId,
        rating: Number(document.getElementById('evaluationRatingInput').value),
        feedback: feedback,
        at: new Date().toISOString()
      });
      state.evaluations = state.evaluations.slice(0, 30);
      event.currentTarget.reset();
      renderAll();
      saveState('Evaluasi dan masukan berhasil disimpan.');
    });

    var attendanceDate = document.getElementById('attendanceDateInput');
    attendanceDate.value = localDateKey(new Date());
    attendanceDate.addEventListener('change', renderAttendance);
    document.getElementById('attendanceForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var date = attendanceDate.value;
      if (!date) {
        announce('Pilih tanggal absensi.', 'error');
        return;
      }
      document.querySelectorAll('[data-attendance-student]').forEach(function (select) {
        state.attendance = state.attendance.filter(function (record) {
          return !(record.studentId === select.dataset.attendanceStudent && record.date === date);
        });
        if (select.value !== 'unmarked') {
          state.attendance.push({
            id: makeId('attendance'),
            studentId: select.dataset.attendanceStudent,
            date: date,
            status: select.value
          });
        }
      });
      renderAll();
      saveState('Kehadiran murid berhasil disimpan.');
    });

    document.getElementById('downloadReport').addEventListener('click', function () {
      var report = [
        'LAPORAN MENTOR SYSTEM AYATIFY',
        'Mentor: ' + state.mentorName,
        'Dibuat: ' + formatDate(new Date(), { dateStyle: 'full', timeStyle: 'short' }),
        'Jumlah murid: ' + state.students.length,
        'Jumlah kelompok: ' + state.groups.length,
        'Setoran menunggu: ' + state.submissions.filter(function (item) { return item.status === 'pending'; }).length,
        '',
        'PERKEMBANGAN MURID',
        state.students.map(function (student) {
          var group = groupById(student.groupId);
          return '- ' + student.name + ' | ' + (group ? group.name : '-') + ' | ' +
            student.juz + ' juz, ' + student.surah + ' surah, ' + student.ayat + ' ayat';
        }).join('\n'),
        '',
        'TUGAS',
        state.assignments.map(function (assignment) {
          return '- ' + assignment.title + ' (' + assignment.type + '), selesai ' +
            assignment.completedBy.length + '/' + state.students.length + ', batas ' + assignment.due;
        }).join('\n')
      ].join('\n');
      try {
        var url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
        var link = document.createElement('a');
        link.href = url;
        link.download = 'laporan-mentor-ayatify.txt';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        announce('Laporan perkembangan berhasil diunduh.');
      } catch (error) {
        announce('Laporan tidak dapat diunduh pada browser ini.', 'error');
      }
    });

    document.getElementById('mentorThemeToggle').addEventListener('click', function () {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      saveState('Mode ' + (state.theme === 'dark' ? 'gelap' : 'terang') + ' diaktifkan.');
    });
    bindCancelButtons();
  }

  function initialize() {
    renderAll();
    bindForms();
    window.setInterval(renderClock, 1000);
    if (storageError) announce(storageError + ' Data contoh ditampilkan; perubahan tidak akan disimpan.', 'error');
  }

  initialize();
})();
