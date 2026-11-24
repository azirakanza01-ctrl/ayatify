(function () {
  'use strict';

  var storageKey = 'ayatify.groupLearning.dashboard.v1';
  var notice = document.getElementById('groupNotice');
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

  function makeInviteCode(groups) {
    var code;
    do {
      code = 'AYAT-' + Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, 'X');
    } while (groups.some(function (group) { return group.inviteCode === code; }));
    return code;
  }

  function createGroup(name, description, creatorName, creatorRole, code) {
    var createdAt = new Date();
    var creatorId = makeId('member');
    return {
      id: makeId('group'),
      name: name,
      description: description,
      inviteCode: code,
      createdAt: createdAt.toISOString(),
      members: [
        { id: creatorId, name: creatorName, role: creatorRole, points: 0, isCurrentUser: true }
      ],
      goals: {
        reading: { done: 0, target: 200 },
        memorizing: { done: 0, target: 40 }
      },
      ziyadah: [{ memberId: creatorId, done: 0, target: 10 }],
      activities: [],
      events: [],
      discussions: [],
      challenges: [],
      notes: [],
      announcements: []
    };
  }

  function initialState() {
    var now = new Date();
    var members = [
      { id: 'member-aisyah', name: 'Aisyah Rahma', role: 'Ketua', points: 24, isCurrentUser: false },
      { id: 'member-farhan', name: 'Farhan Hakim', role: 'Mentor', points: 19, isCurrentUser: false },
      { id: 'member-nadia', name: 'Nadia Putri', role: 'Anggota', points: 15, isCurrentUser: false },
      { id: 'member-hana', name: 'Hana Safitri', role: 'Anggota', points: 12, isCurrentUser: false },
      { id: 'member-current', name: 'Sahabat Qur’an', role: 'Mentor', points: 9, isCurrentUser: true }
    ];
    var group = {
      id: 'group-halaqah-cahaya',
      name: 'Halaqah Cahaya Qur’an',
      description: 'Tempat belajar, menyetorkan hafalan, dan saling menjaga semangat dalam perjalanan Al-Qur’an.',
      inviteCode: 'AYAT-CAHAYA',
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
      members: members,
      goals: {
        reading: { done: 320, target: 500 },
        memorizing: { done: 42, target: 60 }
      },
      ziyadah: [
        { memberId: 'member-aisyah', done: 8, target: 10 },
        { memberId: 'member-farhan', done: 6, target: 10 },
        { memberId: 'member-nadia', done: 5, target: 8 },
        { memberId: 'member-hana', done: 4, target: 8 },
        { memberId: 'member-current', done: 3, target: 8 }
      ],
      activities: [
        { id: 'activity-1', text: 'Nadia menyelesaikan target membaca hari ini.', at: new Date(now.getTime() - 3600000).toISOString() },
        { id: 'activity-2', text: 'Halaqah pekanan dijadwalkan untuk akhir pekan.', at: new Date(now.getTime() - 5 * 3600000).toISOString() },
        { id: 'activity-3', text: 'Farhan menambahkan hafalan baru.', at: new Date(now.getTime() - 86400000).toISOString() }
      ],
      events: [
        { id: 'event-1', title: 'Murajaah Juz 30', type: 'Murajaah', date: offsetDateKey(1), time: '19:30', done: false },
        { id: 'event-2', title: 'Setoran hafalan pekanan', type: 'Setoran', date: offsetDateKey(3), time: '09:00', done: false },
        { id: 'event-3', title: 'Halaqah dan diskusi ayat', type: 'Halaqah', date: offsetDateKey(5), time: '16:00', done: false }
      ],
      discussions: [
        { id: 'message-1', author: 'Aisyah Rahma', text: 'Assalamu’alaikum, teman-teman. Jangan lupa sesi murajaah besok malam, ya.', at: new Date(now.getTime() - 2 * 3600000).toISOString() },
        { id: 'message-2', author: 'Farhan Hakim', text: 'Wa’alaikumussalam. Saya sudah menyiapkan materi pengulangan Juz 30.', at: new Date(now.getTime() - 90 * 60000).toISOString() }
      ],
      challenges: [
        { id: 'challenge-1', title: 'Konsisten membaca 7 hari', done: 3, target: 7, unit: 'hari' },
        { id: 'challenge-2', title: 'Membaca 100 ayat bersama', done: 34, target: 100, unit: 'ayat' }
      ],
      notes: [
        { id: 'note-1', title: 'Adab menuntut ilmu', body: 'Mulai dengan niat yang baik, menyimak dengan saksama, dan mengulang pelajaran.', author: 'Aisyah Rahma', at: new Date(now.getTime() - 2 * 86400000).toISOString() }
      ],
      announcements: [
        { id: 'announcement-1', title: 'Jadwal halaqah pekan ini', body: 'Halaqah berlangsung hari Sabtu pukul 16.00. Siapkan catatan ayat yang ingin didiskusikan.', author: 'Aisyah Rahma', at: new Date(now.getTime() - 4 * 3600000).toISOString() }
      ]
    };
    return {
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      userName: 'Sahabat Qur’an',
      activeGroupId: group.id,
      groups: [group]
    };
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isCount(value) {
    return Number.isInteger(value) && value >= 0 && value <= 1000000;
  }

  function isText(value) {
    return typeof value === 'string';
  }

  function validGroup(group) {
    return isObject(group) &&
      isText(group.id) && isText(group.name) && isText(group.description) &&
      isText(group.inviteCode) && isText(group.createdAt) &&
      Array.isArray(group.members) && group.members.every(function (member) {
        return isObject(member) && isText(member.id) && isText(member.name) &&
          ['Ketua', 'Mentor', 'Anggota'].indexOf(member.role) !== -1 &&
          isCount(member.points) && typeof member.isCurrentUser === 'boolean';
      }) &&
      isObject(group.goals) &&
      ['reading', 'memorizing'].every(function (key) {
        return isObject(group.goals[key]) && isCount(group.goals[key].done) &&
          Number.isInteger(group.goals[key].target) && group.goals[key].target > 0;
      }) &&
      Array.isArray(group.ziyadah) && group.ziyadah.every(function (entry) {
        return isObject(entry) && isText(entry.memberId) && isCount(entry.done) &&
          Number.isInteger(entry.target) && entry.target > 0;
      }) &&
      Array.isArray(group.activities) && group.activities.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.text) && isText(item.at);
      }) &&
      Array.isArray(group.events) && group.events.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isText(item.type) && isText(item.date) && isText(item.time) &&
          typeof item.done === 'boolean';
      }) &&
      Array.isArray(group.discussions) && group.discussions.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.author) &&
          isText(item.text) && isText(item.at);
      }) &&
      Array.isArray(group.challenges) && group.challenges.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isCount(item.done) && Number.isInteger(item.target) && item.target > 0 &&
          isText(item.unit);
      }) &&
      Array.isArray(group.notes) && group.notes.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isText(item.body) && isText(item.author) && isText(item.at);
      }) &&
      Array.isArray(group.announcements) && group.announcements.every(function (item) {
        return isObject(item) && isText(item.id) && isText(item.title) &&
          isText(item.body) && isText(item.author) && isText(item.at);
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
      if (!isObject(saved) || saved.version !== 1 || !isText(saved.userName) ||
          (saved.theme !== 'light' && saved.theme !== 'dark') ||
          !isText(saved.activeGroupId) || !Array.isArray(saved.groups) ||
          saved.groups.length === 0 || !saved.groups.every(validGroup) ||
          !saved.groups.some(function (group) { return group.id === saved.activeGroupId; })) {
        throw new Error('Format data Group Learning tidak dikenali.');
      }
      return saved;
    } catch (error) {
      storageAvailable = false;
      storageError = error instanceof SyntaxError
        ? 'Data kelompok tersimpan tidak dapat dibaca.'
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
      window.localStorage.setItem(storageKey, JSON.stringify({
        version: 1,
        userName: state.userName,
        theme: state.theme,
        activeGroupId: state.activeGroupId,
        groups: state.groups
      }));
      announce(message || 'Perubahan berhasil disimpan di browser ini.');
      return true;
    } catch (error) {
      storageAvailable = false;
      storageError = 'Gagal menyimpan data kelompok ke browser.';
      announce(storageError + ' Pastikan ruang penyimpanan tersedia.', 'error');
      return false;
    }
  }

  function activeGroup() {
    return state.groups.find(function (group) { return group.id === state.activeGroupId; }) || state.groups[0];
  }

  function currentMember(group) {
    return group.members.find(function (member) { return member.isCurrentUser; }) || null;
  }

  function logActivity(group, text) {
    group.activities.unshift({ id: makeId('activity'), text: text, at: new Date().toISOString() });
    group.activities = group.activities.slice(0, 30);
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

  function applyTheme() {
    var button = document.getElementById('groupThemeToggle');
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
    document.getElementById('groupDate').textContent = formatDate(now, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById('groupTime').textContent = formatDate(now, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function renderGroupSelect(group) {
    var select = document.getElementById('groupSelect');
    select.replaceChildren();
    state.groups.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      option.selected = item.id === group.id;
      select.appendChild(option);
    });
  }

  function renderOverview(group) {
    var member = currentMember(group);
    renderGroupSelect(group);
    document.getElementById('activeGroupName').textContent = group.name;
    document.getElementById('activeGroupDescription').textContent = group.description;
    document.getElementById('groupMemberCount').textContent = group.members.length;
    document.getElementById('groupCreatedDate').textContent = formatDate(group.createdAt, { month: 'short', year: 'numeric' });
    document.getElementById('groupInviteCode').textContent = group.inviteCode;
    document.getElementById('currentRoleBadge').textContent = member ? member.role : 'Pengunjung';
    document.getElementById('editGroupName').value = group.name;
    document.getElementById('editGroupDescription').value = group.description;
    document.getElementById('groupWelcomeText').textContent = 'Saling mendukung di ' + group.name + ' untuk membaca, menghafal, dan bertumbuh bersama.';
  }

  function emptyItem(message) {
    var item = document.createElement('li');
    item.className = 'dashboard-empty-state';
    item.textContent = message;
    return item;
  }

  function renderMembers(group) {
    var list = document.getElementById('memberList');
    list.replaceChildren();
    if (!group.members.length) {
      list.appendChild(emptyItem('Belum ada anggota di kelompok ini.'));
      return;
    }
    group.members.forEach(function (member) {
      var item = document.createElement('li');
      item.className = 'group-member-item';
      var avatar = document.createElement('span');
      avatar.className = 'group-member-avatar';
      avatar.textContent = initials(member.name);
      var copy = document.createElement('span');
      copy.className = 'group-member-copy';
      var name = document.createElement('strong');
      name.textContent = member.name + (member.isCurrentUser ? ' (Kamu)' : '');
      var points = document.createElement('span');
      points.textContent = member.points + ' poin kontribusi';
      var role = document.createElement('span');
      role.className = 'group-member-role';
      role.textContent = member.role;
      copy.append(name, points);
      item.append(avatar, copy, role);
      if (!member.isCurrentUser) {
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'group-member-remove';
        remove.innerHTML = '<i class="bi bi-person-dash" aria-hidden="true"></i>';
        remove.setAttribute('aria-label', 'Hapus anggota ' + member.name);
        remove.addEventListener('click', function () {
          group.members = group.members.filter(function (candidate) { return candidate.id !== member.id; });
          group.ziyadah = group.ziyadah.filter(function (entry) { return entry.memberId !== member.id; });
          logActivity(group, member.name + ' dihapus dari daftar anggota.');
          renderAll();
          saveState('Anggota berhasil dihapus.');
        });
        item.appendChild(remove);
      }
      list.appendChild(item);
    });
  }

  function setMeter(meterId, barId, done, target) {
    var percent = target > 0 ? Math.min(100, Math.round(done / target * 100)) : 0;
    document.getElementById(barId).style.width = percent + '%';
    document.getElementById(meterId).setAttribute('aria-valuenow', String(percent));
  }

  function renderSharedGoals(group) {
    ['reading', 'memorizing'].forEach(function (key) {
      var goal = group.goals[key];
      var prefix = key === 'reading' ? 'sharedReading' : 'sharedMemorizing';
      document.getElementById(prefix + 'Done').textContent = goal.done;
      document.getElementById(prefix + 'Target').textContent = goal.target;
      setMeter(prefix + 'Meter', prefix + 'Bar', goal.done, goal.target);
      document.querySelector('[data-shared-goal="' + key + '"]').disabled = goal.done >= goal.target;
    });
    document.getElementById('sharedReadingTargetInput').value = group.goals.reading.target;
    document.getElementById('sharedMemorizingTargetInput').value = group.goals.memorizing.target;
  }

  function renderActivities(group) {
    var list = document.getElementById('groupActivityList');
    list.replaceChildren();
    if (!group.activities.length) {
      list.appendChild(emptyItem('Aktivitas kelompok akan tampil di sini.'));
      return;
    }
    group.activities.slice(0, 7).forEach(function (activity) {
      var item = document.createElement('li');
      item.className = 'dashboard-activity-item';
      var icon = document.createElement('span');
      icon.className = 'activity-dot';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<i class="bi bi-people"></i>';
      var text = document.createElement('strong');
      text.textContent = activity.text;
      var time = document.createElement('time');
      time.dateTime = activity.at;
      time.textContent = formatDate(activity.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      item.append(icon, text, time);
      list.appendChild(item);
    });
  }

  function compareEvents(a, b) {
    return (a.date + a.time).localeCompare(b.date + b.time);
  }

  function makeEventItem(group, event, allowComplete) {
    var item = document.createElement('li');
    item.className = allowComplete ? 'group-event-item' : 'group-event-item';
    var dateCard = document.createElement('span');
    dateCard.className = 'group-event-date';
    var date = new Date(event.date + 'T00:00:00');
    var day = document.createElement('strong');
    day.textContent = Number.isNaN(date.getTime()) ? '-' : String(date.getDate());
    var month = document.createElement('span');
    month.textContent = Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
    dateCard.append(day, month);
    var copy = document.createElement('span');
    copy.className = 'group-event-copy';
    var title = document.createElement('strong');
    title.textContent = event.title;
    if (event.done) title.className = 'group-event-done';
    var type = document.createElement('span');
    type.className = 'group-event-type';
    type.textContent = event.type;
    var details = document.createElement('span');
    details.textContent = event.time + (event.done ? ' · Selesai' : '');
    copy.append(title, type, details);
    item.append(dateCard, copy);
    if (allowComplete) {
      var complete = document.createElement('button');
      complete.type = 'button';
      complete.className = 'dashboard-list-action';
      complete.textContent = event.done ? 'Batal' : 'Selesai';
      complete.setAttribute('aria-pressed', String(event.done));
      complete.setAttribute('aria-label', (event.done ? 'Buka kembali ' : 'Tandai selesai ') + event.title);
      complete.addEventListener('click', function () {
        event.done = !event.done;
        if (event.done) {
          var member = currentMember(group);
          if (member) member.points += 1;
          logActivity(group, 'Kelompok menyelesaikan kegiatan ' + event.title + '.');
        }
        renderAll();
        saveState(event.done ? 'Kegiatan ditandai selesai.' : 'Kegiatan dibuka kembali.');
      });
      item.appendChild(complete);
    }
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'group-event-remove';
    remove.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
    remove.setAttribute('aria-label', 'Hapus jadwal ' + event.title);
    remove.addEventListener('click', function () {
      group.events = group.events.filter(function (candidate) { return candidate.id !== event.id; });
      logActivity(group, 'Jadwal dihapus: ' + event.title + '.');
      renderAll();
      saveState('Jadwal berhasil dihapus.');
    });
    item.appendChild(remove);
    return item;
  }

  function renderEvents(group) {
    var reviews = document.getElementById('murajaahList');
    var calendar = document.getElementById('calendarList');
    reviews.replaceChildren();
    calendar.replaceChildren();
    var sorted = group.events.slice().sort(compareEvents);
    var murajaahEvents = sorted.filter(function (event) { return event.type === 'Murajaah'; });
    if (!murajaahEvents.length) reviews.appendChild(emptyItem('Belum ada jadwal murajaah bersama.'));
    else murajaahEvents.forEach(function (event) { reviews.appendChild(makeEventItem(group, event, true)); });
    if (!sorted.length) calendar.appendChild(emptyItem('Belum ada jadwal kelompok.'));
    else sorted.forEach(function (event) { calendar.appendChild(makeEventItem(group, event, true)); });
  }

  function renderZiyadah(group) {
    var list = document.getElementById('groupZiyadahList');
    var memberSelect = document.getElementById('ziyadahMemberSelect');
    list.replaceChildren();
    memberSelect.replaceChildren();
    group.members.forEach(function (member) {
      var entry = group.ziyadah.find(function (candidate) { return candidate.memberId === member.id; });
      if (!entry) {
        entry = { memberId: member.id, done: 0, target: 8 };
        group.ziyadah.push(entry);
      }
      var option = document.createElement('option');
      option.value = member.id;
      option.textContent = member.name;
      memberSelect.appendChild(option);

      var item = document.createElement('li');
      item.className = 'group-ziyadah-item';
      var name = document.createElement('strong');
      name.textContent = member.name;
      var count = document.createElement('span');
      count.textContent = entry.done + '/' + entry.target + ' ayat';
      var meter = document.createElement('div');
      meter.className = 'dashboard-meter dashboard-meter--small';
      meter.setAttribute('role', 'progressbar');
      meter.setAttribute('aria-label', 'Progres ziyadah ' + member.name);
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      var bar = document.createElement('span');
      var percent = Math.min(100, Math.round(entry.done / entry.target * 100));
      meter.setAttribute('aria-valuenow', String(percent));
      bar.style.width = percent + '%';
      meter.appendChild(bar);
      var action = document.createElement('button');
      action.type = 'button';
      action.textContent = entry.done >= entry.target ? 'Target tercapai' : '+1 ayat';
      action.disabled = entry.done >= entry.target;
      action.setAttribute('aria-label', 'Tambah hafalan ziyadah ' + member.name);
      action.addEventListener('click', function () {
        entry.done += 1;
        member.points += 1;
        logActivity(group, member.name + ' menambah 1 ayat hafalan baru.');
        renderAll();
        saveState('Progres ziyadah anggota diperbarui.');
      });
      item.append(name, count, meter, action);
      list.appendChild(item);
    });
    if (!group.members.length) list.appendChild(emptyItem('Tambahkan anggota untuk melihat progres ziyadah.'));
  }

  function renderDiscussion(group) {
    var list = document.getElementById('discussionList');
    list.replaceChildren();
    if (!group.discussions.length) {
      list.appendChild(emptyItem('Mulai diskusi dengan mengirim pesan pertama.'));
      return;
    }
    group.discussions.slice(-30).forEach(function (message) {
      var item = document.createElement('li');
      item.className = 'group-message' + (message.author === state.userName ? ' is-current-user' : '');
      var header = document.createElement('div');
      header.className = 'group-message-header';
      var author = document.createElement('strong');
      author.textContent = message.author;
      var time = document.createElement('time');
      time.dateTime = message.at;
      time.textContent = formatDate(message.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      var text = document.createElement('p');
      text.textContent = message.text;
      header.append(author, time);
      item.append(header, text);
      list.appendChild(item);
    });
    list.scrollTop = list.scrollHeight;
  }

  function renderLeaderboard(group) {
    var list = document.getElementById('leaderboardList');
    list.replaceChildren();
    var sorted = group.members.slice().sort(function (a, b) {
      return b.points - a.points || a.name.localeCompare(b.name, 'id');
    });
    if (!sorted.length) {
      list.appendChild(emptyItem('Peringkat akan tersedia setelah anggota bergabung.'));
      return;
    }
    sorted.forEach(function (member) {
      var item = document.createElement('li');
      item.className = 'group-rank-item' + (member.isCurrentUser ? ' is-current' : '');
      var rank = document.createElement('span');
      rank.className = 'group-rank-number';
      rank.setAttribute('aria-label', 'Peringkat');
      var avatar = document.createElement('span');
      avatar.className = 'group-member-avatar';
      avatar.textContent = initials(member.name);
      var name = document.createElement('strong');
      name.className = 'group-member-copy';
      name.textContent = member.name + (member.isCurrentUser ? ' (Kamu)' : '');
      var points = document.createElement('span');
      points.className = 'group-rank-points';
      points.textContent = member.points + ' poin';
      item.append(rank, avatar, name, points);
      list.appendChild(item);
    });
  }

  function renderChallenges(group) {
    var list = document.getElementById('challengeList');
    list.replaceChildren();
    if (!group.challenges.length) {
      list.appendChild(emptyItem('Belum ada tantangan. Buat tantangan bersama yang pertama.'));
      return;
    }
    group.challenges.forEach(function (challenge) {
      var item = document.createElement('li');
      item.className = 'group-challenge-item';
      var heading = document.createElement('div');
      heading.className = 'group-challenge-heading';
      var title = document.createElement('strong');
      title.textContent = challenge.title;
      var count = document.createElement('span');
      count.className = 'dashboard-small-muted';
      count.textContent = challenge.done + '/' + challenge.target + ' ' + challenge.unit;
      heading.append(title, count);
      var meter = document.createElement('div');
      meter.className = 'dashboard-meter dashboard-meter--small';
      meter.setAttribute('role', 'progressbar');
      meter.setAttribute('aria-label', 'Progres tantangan ' + challenge.title);
      meter.setAttribute('aria-valuemin', '0');
      meter.setAttribute('aria-valuemax', '100');
      var bar = document.createElement('span');
      var percent = Math.min(100, Math.round(challenge.done / challenge.target * 100));
      meter.setAttribute('aria-valuenow', String(percent));
      bar.style.width = percent + '%';
      meter.appendChild(bar);
      var actions = document.createElement('div');
      actions.className = 'group-challenge-actions';
      var note = document.createElement('span');
      note.textContent = challenge.done >= challenge.target ? 'Tantangan tercapai!' : 'Ajak anggota ikut berkontribusi';
      var action = document.createElement('button');
      action.type = 'button';
      action.textContent = challenge.done >= challenge.target ? 'Tercapai' : '+1 ' + challenge.unit;
      action.disabled = challenge.done >= challenge.target;
      action.addEventListener('click', function () {
        challenge.done += 1;
        var member = currentMember(group);
        if (member) member.points += 1;
        logActivity(group, 'Kontribusi baru pada tantangan ' + challenge.title + '.');
        renderAll();
        saveState('Progres tantangan diperbarui.');
      });
      actions.append(note, action);
      item.append(heading, meter, actions);
      list.appendChild(item);
    });
  }

  function renderNotes(group) {
    var list = document.getElementById('sharedNotesList');
    list.replaceChildren();
    if (!group.notes.length) {
      list.appendChild(emptyItem('Catatan materi yang dibagikan anggota akan muncul di sini.'));
      return;
    }
    group.notes.slice(0, 8).forEach(function (note) {
      var item = document.createElement('li');
      item.className = 'group-shared-note';
      var heading = document.createElement('div');
      heading.className = 'group-note-heading';
      var title = document.createElement('strong');
      title.textContent = note.title;
      heading.appendChild(title);
      if (note.author === state.userName) {
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'group-note-delete';
        remove.textContent = 'Hapus';
        remove.setAttribute('aria-label', 'Hapus catatan ' + note.title);
        remove.addEventListener('click', function () {
          group.notes = group.notes.filter(function (candidate) { return candidate.id !== note.id; });
          logActivity(group, state.userName + ' menghapus catatan bersama: ' + note.title + '.');
          renderAll();
          saveState('Catatan bersama berhasil dihapus.');
        });
        heading.appendChild(remove);
      }
      var body = document.createElement('p');
      body.textContent = note.body;
      var meta = document.createElement('div');
      meta.className = 'group-announcement-meta';
      meta.textContent = note.author + ' · ' + formatDate(note.at, { day: 'numeric', month: 'short' });
      item.append(heading, body, meta);
      list.appendChild(item);
    });
  }

  function renderAnnouncements(group) {
    var list = document.getElementById('announcementList');
    var form = document.getElementById('announcementForm');
    var toggle = document.getElementById('announcementToggle');
    var permission = document.getElementById('announcementPermission');
    var member = currentMember(group);
    var allowed = member && (member.role === 'Ketua' || member.role === 'Mentor');
    list.replaceChildren();
    toggle.hidden = !allowed;
    permission.hidden = Boolean(allowed);
    if (!allowed) setFormVisibility(form, false);
    if (!group.announcements.length) {
      list.appendChild(emptyItem('Belum ada pengumuman dari ketua atau mentor.'));
    } else {
      group.announcements.slice(0, 5).forEach(function (announcement) {
        var item = document.createElement('li');
        item.className = 'group-announcement';
        var heading = document.createElement('div');
        heading.className = 'group-announcement-heading';
        var title = document.createElement('strong');
        title.textContent = announcement.title;
        heading.appendChild(title);
        var body = document.createElement('p');
        body.textContent = announcement.body;
        var meta = document.createElement('div');
        meta.className = 'group-announcement-meta';
        meta.textContent = announcement.author + ' · ' + formatDate(announcement.at, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        item.append(heading, body, meta);
        list.appendChild(item);
      });
    }
  }

  function renderReports(group) {
    var readingPercent = Math.min(100, Math.round(group.goals.reading.done / group.goals.reading.target * 100));
    var memorizingPercent = Math.min(100, Math.round(group.goals.memorizing.done / group.goals.memorizing.target * 100));
    var completedReviews = group.events.filter(function (event) { return event.type === 'Murajaah' && event.done; }).length;
    var reportStats = [
      { value: group.members.length, label: 'Anggota aktif' },
      { value: readingPercent + '%', label: 'Target membaca' },
      { value: memorizingPercent + '%', label: 'Target menghafal' },
      { value: completedReviews, label: 'Murajaah selesai' }
    ];
    var container = document.getElementById('groupReportStats');
    container.replaceChildren();
    reportStats.forEach(function (stat) {
      var item = document.createElement('div');
      item.className = 'group-report-stat';
      var value = document.createElement('strong');
      value.textContent = stat.value;
      var label = document.createElement('span');
      label.textContent = stat.label;
      item.append(value, label);
      container.appendChild(item);
    });
    document.getElementById('groupReportSummary').textContent =
      'Kelompok ' + group.name + ' mencatat ' + group.activities.length +
      ' aktivitas, ' + group.events.filter(function (event) { return !event.done; }).length +
      ' jadwal mendatang, dan ' + group.challenges.length + ' tantangan.';
  }

  function renderAll() {
    var group = activeGroup();
    renderClock();
    renderOverview(group);
    renderMembers(group);
    renderSharedGoals(group);
    renderActivities(group);
    renderEvents(group);
    renderZiyadah(group);
    renderDiscussion(group);
    renderLeaderboard(group);
    renderChallenges(group);
    renderNotes(group);
    renderAnnouncements(group);
    renderReports(group);
    applyTheme();
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

  function bindForms() {
    var groupSelect = document.getElementById('groupSelect');
    groupSelect.addEventListener('change', function () {
      state.activeGroupId = groupSelect.value;
      renderAll();
      saveState('Kelompok aktif berhasil diganti.');
    });

    var createForm = document.getElementById('createGroupForm');
    document.getElementById('createGroupToggle').addEventListener('click', function () { toggleForm(createForm, this); });
    createForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('newGroupName').value.trim();
      var description = document.getElementById('newGroupDescription').value.trim();
      if (!name || !description) {
        announce('Lengkapi nama dan deskripsi kelompok.', 'error');
        return;
      }
      var group = createGroup(name, description, state.userName, 'Ketua', makeInviteCode(state.groups));
      state.groups.push(group);
      state.activeGroupId = group.id;
      logActivity(group, state.userName + ' membuat kelompok ini.');
      createForm.reset();
      setFormVisibility(createForm, false);
      renderAll();
      saveState('Kelompok baru berhasil dibuat. Bagikan kode undangan kepada teman.');
    });

    var joinForm = document.getElementById('joinGroupForm');
    document.getElementById('joinGroupToggle').addEventListener('click', function () { toggleForm(joinForm, this); });
    joinForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
      var group = state.groups.find(function (candidate) { return candidate.inviteCode.toUpperCase() === code; });
      if (!group) {
        announce('Kode tidak ditemukan di penyimpanan browser ini. Kode dari perangkat lain memerlukan server bersama.', 'error');
        return;
      }
      var existing = group.members.find(function (member) {
        return member.isCurrentUser || member.name.toLowerCase() === state.userName.toLowerCase();
      });
      if (existing) {
        existing.isCurrentUser = true;
        announce('Kamu sudah menjadi anggota kelompok ini.');
      } else {
        group.members.push({ id: makeId('member'), name: state.userName, role: 'Anggota', points: 0, isCurrentUser: true });
        logActivity(group, state.userName + ' bergabung dengan kode undangan.');
      }
      state.activeGroupId = group.id;
      joinForm.reset();
      setFormVisibility(joinForm, false);
      renderAll();
      saveState('Berhasil bergabung dengan kelompok.');
    });

    var editForm = document.getElementById('editGroupForm');
    document.getElementById('editGroupToggle').addEventListener('click', function () { toggleForm(editForm, this); });
    editForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      group.name = document.getElementById('editGroupName').value.trim();
      group.description = document.getElementById('editGroupDescription').value.trim();
      if (!group.name || !group.description) {
        announce('Nama dan deskripsi kelompok tidak boleh kosong.', 'error');
        return;
      }
      logActivity(group, 'Informasi kelompok diperbarui.');
      setFormVisibility(editForm, false);
      renderAll();
      saveState('Informasi kelompok berhasil diperbarui.');
    });

    document.getElementById('copyInviteCode').addEventListener('click', function () {
      var code = activeGroup().inviteCode;
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        announce('Salin kode ini secara manual: ' + code, 'error');
        return;
      }
      navigator.clipboard.writeText(code).then(function () {
        announce('Kode undangan berhasil disalin.');
      }).catch(function () {
        announce('Kode tidak dapat disalin otomatis. Salin kode ini: ' + code, 'error');
      });
    });

    var memberForm = document.getElementById('addMemberForm');
    document.getElementById('addMemberToggle').addEventListener('click', function () { toggleForm(memberForm, this); });
    memberForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var name = document.getElementById('memberNameInput').value.trim();
      var role = document.getElementById('memberRoleInput').value;
      if (!name) {
        announce('Nama anggota wajib diisi.', 'error');
        return;
      }
      group.members.push({ id: makeId('member'), name: name, role: role, points: 0, isCurrentUser: false });
      logActivity(group, name + ' ditambahkan sebagai ' + role.toLowerCase() + '.');
      memberForm.reset();
      setFormVisibility(memberForm, false);
      renderAll();
      saveState('Anggota berhasil ditambahkan.');
    });

    var sharedGoalsForm = document.getElementById('sharedGoalsForm');
    document.getElementById('sharedGoalsToggle').addEventListener('click', function () { toggleForm(sharedGoalsForm, this); });
    sharedGoalsForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      group.goals.reading.target = Number(document.getElementById('sharedReadingTargetInput').value);
      group.goals.memorizing.target = Number(document.getElementById('sharedMemorizingTargetInput').value);
      logActivity(group, 'Target belajar bersama diperbarui.');
      setFormVisibility(sharedGoalsForm, false);
      renderAll();
      saveState('Target belajar bersama berhasil diperbarui.');
    });
    document.querySelectorAll('.group-goal-action').forEach(function (button) {
      button.addEventListener('click', function () {
        var group = activeGroup();
        var key = button.dataset.sharedGoal;
        var goal = group.goals[key];
        if (goal.done >= goal.target) return;
        goal.done += 1;
        var member = currentMember(group);
        if (member) member.points += 1;
        logActivity(group, (member ? member.name : 'Anggota') + ' berkontribusi pada target ' + (key === 'reading' ? 'membaca' : 'menghafal') + '.');
        renderAll();
        saveState('Kontribusi target kelompok dicatat.');
      });
    });

    var activityForm = document.getElementById('activityForm');
    document.getElementById('activityToggle').addEventListener('click', function () { toggleForm(activityForm, this); });
    activityForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var text = document.getElementById('activityInput').value.trim();
      if (!text) {
        announce('Isi aktivitas kelompok terlebih dahulu.', 'error');
        return;
      }
      logActivity(group, text);
      activityForm.reset();
      setFormVisibility(activityForm, false);
      renderAll();
      saveState('Aktivitas kelompok berhasil dicatat.');
    });

    var murajaahForm = document.getElementById('murajaahForm');
    document.getElementById('murajaahToggle').addEventListener('click', function () {
      var dateInput = document.getElementById('murajaahDateInput');
      dateInput.min = localDateKey(new Date());
      if (!dateInput.value) dateInput.value = offsetDateKey(1);
      toggleForm(murajaahForm, this);
    });
    murajaahForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var title = document.getElementById('murajaahTitleInput').value.trim();
      var date = document.getElementById('murajaahDateInput').value;
      var time = document.getElementById('murajaahTimeInput').value;
      if (!title || !date || !time || date < localDateKey(new Date())) {
        announce('Lengkapi materi, tanggal hari ini atau setelahnya, dan waktu murajaah.', 'error');
        return;
      }
      group.events.push({ id: makeId('event'), title: title, type: 'Murajaah', date: date, time: time, done: false });
      logActivity(group, 'Jadwal murajaah ditambahkan: ' + title + '.');
      murajaahForm.reset();
      setFormVisibility(murajaahForm, false);
      renderAll();
      saveState('Jadwal murajaah kelompok berhasil dibuat.');
    });

    var ziyadahForm = document.getElementById('ziyadahTargetForm');
    document.getElementById('ziyadahTargetToggle').addEventListener('click', function () { toggleForm(ziyadahForm, this); });
    ziyadahForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var memberId = document.getElementById('ziyadahMemberSelect').value;
      var target = Number(document.getElementById('ziyadahMemberTarget').value);
      var entry = group.ziyadah.find(function (item) { return item.memberId === memberId; });
      if (!entry) {
        announce('Anggota yang dipilih tidak ditemukan.', 'error');
        return;
      }
      entry.target = target;
      logActivity(group, 'Target ziyadah ' + group.members.find(function (member) { return member.id === memberId; }).name + ' diperbarui.');
      setFormVisibility(ziyadahForm, false);
      renderAll();
      saveState('Target ziyadah anggota berhasil diperbarui.');
    });

    var discussionForm = document.getElementById('discussionForm');
    discussionForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var input = document.getElementById('discussionInput');
      var text = input.value.trim();
      if (!text) {
        announce('Pesan diskusi tidak boleh kosong.', 'error');
        return;
      }
      group.discussions.push({ id: makeId('message'), author: state.userName, text: text, at: new Date().toISOString() });
      group.discussions = group.discussions.slice(-60);
      logActivity(group, state.userName + ' mengirim pesan di ruang diskusi.');
      discussionForm.reset();
      renderAll();
      saveState('Pesan berhasil dikirim ke ruang diskusi lokal.');
    });

    var calendarForm = document.getElementById('calendarForm');
    document.getElementById('calendarToggle').addEventListener('click', function () {
      var dateInput = document.getElementById('eventDateInput');
      dateInput.min = localDateKey(new Date());
      if (!dateInput.value) dateInput.value = offsetDateKey(3);
      toggleForm(calendarForm, this);
    });
    calendarForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var title = document.getElementById('eventTitleInput').value.trim();
      var type = document.getElementById('eventTypeInput').value;
      var date = document.getElementById('eventDateInput').value;
      var time = document.getElementById('eventTimeInput').value;
      if (!title || !date || !time || date < localDateKey(new Date())) {
        announce('Lengkapi nama, tanggal hari ini atau setelahnya, dan waktu kegiatan.', 'error');
        return;
      }
      group.events.push({ id: makeId('event'), title: title, type: type, date: date, time: time, done: false });
      logActivity(group, 'Jadwal ' + type.toLowerCase() + ' ditambahkan: ' + title + '.');
      calendarForm.reset();
      setFormVisibility(calendarForm, false);
      renderAll();
      saveState('Jadwal kelompok berhasil ditambahkan.');
    });

    var challengeForm = document.getElementById('challengeForm');
    document.getElementById('challengeToggle').addEventListener('click', function () { toggleForm(challengeForm, this); });
    challengeForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var title = document.getElementById('challengeTitleInput').value.trim();
      var target = Number(document.getElementById('challengeTargetInput').value);
      if (!title || !Number.isInteger(target) || target < 1) {
        announce('Isi nama tantangan dan target yang valid.', 'error');
        return;
      }
      group.challenges.unshift({ id: makeId('challenge'), title: title, done: 0, target: target, unit: 'ayat' });
      logActivity(group, 'Tantangan baru dibuat: ' + title + '.');
      challengeForm.reset();
      setFormVisibility(challengeForm, false);
      renderAll();
      saveState('Tantangan kelompok berhasil dibuat.');
    });

    var noteForm = document.getElementById('sharedNoteForm');
    document.getElementById('sharedNoteToggle').addEventListener('click', function () { toggleForm(noteForm, this); });
    noteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var title = document.getElementById('sharedNoteTitleInput').value.trim();
      var body = document.getElementById('sharedNoteBodyInput').value.trim();
      if (!title || !body) {
        announce('Judul dan isi catatan wajib diisi.', 'error');
        return;
      }
      group.notes.unshift({ id: makeId('note'), title: title, body: body, author: state.userName, at: new Date().toISOString() });
      logActivity(group, state.userName + ' membagikan catatan "' + title + '".');
      noteForm.reset();
      setFormVisibility(noteForm, false);
      renderAll();
      saveState('Catatan berhasil dibagikan ke ruang kelompok lokal.');
    });

    var announcementForm = document.getElementById('announcementForm');
    var announcementToggle = document.getElementById('announcementToggle');
    announcementToggle.addEventListener('click', function () { toggleForm(announcementForm, this); });
    announcementForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var group = activeGroup();
      var member = currentMember(group);
      if (!member || (member.role !== 'Ketua' && member.role !== 'Mentor')) {
        announce('Hanya ketua atau mentor yang dapat membuat pengumuman.', 'error');
        return;
      }
      var title = document.getElementById('announcementHeadingInput').value.trim();
      var body = document.getElementById('announcementBodyInput').value.trim();
      if (!title || !body) {
        announce('Lengkapi judul dan isi pengumuman.', 'error');
        return;
      }
      group.announcements.unshift({ id: makeId('announcement'), title: title, body: body, author: state.userName, at: new Date().toISOString() });
      logActivity(group, 'Pengumuman baru diterbitkan oleh ' + state.userName + '.');
      announcementForm.reset();
      setFormVisibility(announcementForm, false);
      renderAll();
      saveState('Pengumuman berhasil diterbitkan.');
    });

    document.getElementById('downloadReport').addEventListener('click', function () {
      var group = activeGroup();
      var report = [
        'LAPORAN GROUP LEARNING AYATIFY',
        'Kelompok: ' + group.name,
        'Dibuat: ' + formatDate(new Date(), { dateStyle: 'full', timeStyle: 'short' }),
        'Jumlah anggota: ' + group.members.length,
        'Target membaca bersama: ' + group.goals.reading.done + '/' + group.goals.reading.target + ' ayat',
        'Target menghafal bersama: ' + group.goals.memorizing.done + '/' + group.goals.memorizing.target + ' ayat',
        'Jadwal murajaah selesai: ' + group.events.filter(function (item) { return item.type === 'Murajaah' && item.done; }).length,
        'Jumlah tantangan: ' + group.challenges.length,
        '',
        'ANGGOTA DAN POIN',
        group.members.map(function (member) { return '- ' + member.name + ' (' + member.role + '): ' + member.points + ' poin'; }).join('\n'),
        '',
        'JADWAL',
        group.events.slice().sort(compareEvents).map(function (item) {
          return '- ' + item.date + ' ' + item.time + ' | ' + item.type + ' | ' + item.title + (item.done ? ' (selesai)' : '');
        }).join('\n')
      ].join('\n');
      try {
        var url = URL.createObjectURL(new Blob([report], { type: 'text/plain;charset=utf-8' }));
        var link = document.createElement('a');
        link.href = url;
        link.download = 'laporan-' + group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        announce('Laporan kelompok berhasil diunduh.');
      } catch (error) {
        announce('Laporan tidak dapat diunduh pada browser ini.', 'error');
      }
    });

    document.getElementById('groupThemeToggle').addEventListener('click', function () {
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
