// =========================================================
// BEATLAB KZ — Main Application Controller
// =========================================================

import {
  CURRICULUM,
  ROADMAP_WEEKS,
  TOP_MISTAKES,
  FREE_RESOURCES,
  QUIZ_QUESTIONS,
  GLOSSARY
} from './curriculum-data.js';
import { initDrumMachine } from './drum-machine.js';
import { initPianoLab } from './piano-lab.js';
import { initArrangement, initEqVisualizer } from './arrangement-eq.js';
import { initFlStudioGuide } from './fl-studio-guide.js';

const STORAGE_LESSONS = 'beatlab_completed_lessons_v1';
const STORAGE_ROADMAP = 'beatlab_roadmap_tasks_v1';

// Toast helper
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
}

// LocalStorage helpers
function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function saveSet(key, setObj) {
  try {
    localStorage.setItem(key, JSON.stringify([...setObj]));
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize interactive studios
  const drumApi = initDrumMachine();
  const pianoApi = initPianoLab();
  initArrangement();
  const eqApi = initEqVisualizer();
  initFlStudioGuide();

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  mobileBtn.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Hero quick-jump drum presets
  document.querySelectorAll('[data-jump-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.jumpPreset;
      document.getElementById('drum-studio').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        drumApi.loadPreset(preset, true);
        showToast(`🎧 ${preset.toUpperCase()} пресеті қосылды!`);
      }, 350);
    });
  });

  // =========================================================
  // 1. Curriculum Renderer & Progress Tracking
  // =========================================================
  const completedLessons = loadSet(STORAGE_LESSONS);
  const allLessonsFlat = CURRICULUM.flatMap((m, mIdx) =>
    m.lessons.map((l, lIdx) => ({ moduleIdx: mIdx, lessonIdx: lIdx, id: l.id }))
  );

  let activeModuleIdx = 0;
  let activeLessonIdx = 0;

  const moduleTabsEl = document.getElementById('moduleTabs');
  const lessonSidebarEl = document.getElementById('lessonSidebar');
  const lessonReaderEl = document.getElementById('lessonReader');
  const headerProgressText = document.getElementById('headerProgressText');
  const progressStatusTitle = document.getElementById('progressStatusTitle');
  const progressStatusSubtitle = document.getElementById('progressStatusSubtitle');
  const progressCounter = document.getElementById('progressCounter');
  const courseProgressFill = document.getElementById('courseProgressFill');

  function updateProgressUI() {
    const total = allLessonsFlat.length;
    const done = completedLessons.size;
    const pct = Math.round((done / total) * 100);

    headerProgressText.textContent = `${done} / ${total} сабақ`;
    progressCounter.textContent = `${done} / ${total}`;
    courseProgressFill.style.width = `${pct}%`;
    progressStatusTitle.textContent = `Оқу прогресі: ${pct}%`;

    if (done === 0) {
      progressStatusSubtitle.textContent = '1-модуль, 1-сабақтан баста — барлығы оңай түсіндірілген.';
    } else if (pct < 40) {
      progressStatusSubtitle.textContent = 'Керемет бастама! Ырғақ пен драмдарды тәжірибеде байқап отыр.';
    } else if (pct < 80) {
      progressStatusSubtitle.textContent = 'Жарты жолдан астың! Енді толық аранжировка мен миксингті меңгер.';
    } else if (done < total) {
      progressStatusSubtitle.textContent = 'PRO деңгейге бір қадам қалды — соңғы сабақтарды аяқта!';
    } else {
      progressStatusSubtitle.textContent = '🏆 ҚҰТТЫҚТАЙМЫЗ! Толық курсты бітірдің — енді күн сайын бит жаз!';
    }
  }

  function renderModuleTabs() {
    moduleTabsEl.innerHTML = '';
    CURRICULUM.forEach((mod, idx) => {
      const doneInMod = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.className = 'module-tab' + (idx === activeModuleIdx ? ' active' : '');
      btn.setAttribute('aria-selected', String(idx === activeModuleIdx));
      btn.innerHTML = `
        <span class="module-tab-num">
          <span>МОДУЛЬ ${mod.number}</span>
          <span class="module-tab-done">${doneInMod}/${mod.lessons.length}</span>
        </span>
        <span class="module-tab-title">${mod.shortTitle}</span>
      `;
      btn.addEventListener('click', () => {
        activeModuleIdx = idx;
        activeLessonIdx = 0;
        renderCurriculum();
      });
      moduleTabsEl.appendChild(btn);
    });
  }

  function renderLessonSidebar() {
    const mod = CURRICULUM[activeModuleIdx];
    lessonSidebarEl.innerHTML = `
      <div class="sidebar-module-head">
        <span>МОДУЛЬ ${mod.number}</span>
        <h3>${mod.title}</h3>
        <p>${mod.summary}</p>
      </div>
    `;

    mod.lessons.forEach((lesson, idx) => {
      const isDone = completedLessons.has(lesson.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lesson-btn' + (idx === activeLessonIdx ? ' active' : '') + (isDone ? ' completed' : '');
      btn.innerHTML = `
        <span class="lesson-check-icon">${isDone ? '✓' : lesson.code}</span>
        <span class="lesson-btn-meta">
          <strong>${lesson.title}</strong>
          <span>${lesson.duration} • ${lesson.level}</span>
        </span>
      `;
      btn.addEventListener('click', () => {
        activeLessonIdx = idx;
        renderCurriculum();
      });
      lessonSidebarEl.appendChild(btn);
    });
  }

  function renderBlocksHtml(blocks) {
    return blocks.map((b) => {
      let inner = `<h4>${b.heading}</h4>`;
      if (b.paragraphs) {
        inner += b.paragraphs.map((p) => `<p>${p}</p>`).join('');
      }
      if (b.list) {
        inner += `<ul class="lesson-list">${b.list.map((li) => `<li>${li}</li>`).join('')}</ul>`;
      }
      if (b.table) {
        inner += `
          <div class="lesson-table-wrap">
            <table class="lesson-table">
              <thead><tr>${b.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${b.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      return `<div class="lesson-block">${inner}</div>`;
    }).join('');
  }

  function handleTaskAction(task) {
    if (task.actionType === 'drum') {
      document.getElementById('drum-studio').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        drumApi.loadPreset(task.actionPayload || 'trap', false);
        showToast('🥁 Драм-машина дайын! ОЙНАТУ батырмасын бас.');
      }, 350);
    } else if (task.actionType === 'piano') {
      document.getElementById('piano-lab').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        pianoApi.configure(task.actionPayload || {});
        showToast('🎹 Пианино бапталды!');
      }, 350);
    } else if (task.actionType === 'arrangement') {
      document.getElementById('arrangement').scrollIntoView({ behavior: 'smooth' });
    } else if (task.actionType === 'eq') {
      document.getElementById('mixing').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        eqApi.selectProfile(task.actionPayload || '808');
      }, 300);
    } else if (task.actionType === 'scroll' && task.actionPayload) {
      const target = document.querySelector(task.actionPayload);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderLessonReader() {
    const mod = CURRICULUM[activeModuleIdx];
    const lesson = mod.lessons[activeLessonIdx];
    const isDone = completedLessons.has(lesson.id);
    const flatIdx = allLessonsFlat.findIndex((item) => item.id === lesson.id);

    const levelBadgeClass = lesson.level === 'PRO'
      ? 'badge-violet'
      : lesson.level === 'Орташа'
        ? 'badge-amber'
        : 'badge-emerald';

    lessonReaderEl.innerHTML = `
      <div class="lesson-top-meta">
        <span class="badge badge-amber">САБАҚ ${lesson.code}</span>
        <span class="badge ${levelBadgeClass}">${lesson.level}</span>
        <span class="mono-label">⏱ Оқу уақыты: ${lesson.duration}</span>
      </div>
      <h3 class="lesson-heading">${lesson.title}</h3>
      <p class="lesson-lead">${lesson.lead}</p>

      ${renderBlocksHtml(lesson.blocks)}

      <div class="callout callout-pro">
        <div class="callout-title">🔥 PRO МЕНТОР КЕҢЕСІ</div>
        <p>${lesson.proTip}</p>
      </div>

      <div class="callout callout-warn">
        <div class="callout-title">⚠️ ЖАҢАДАН БАСТАУШЫНЫҢ ҚАТЕСІ</div>
        <p>${lesson.mistake}</p>
      </div>

      <div class="callout callout-task">
        <div class="callout-title">🎯 ПРАКТИКАЛЫҚ ТАПСЫРМА</div>
        <p>${lesson.task.text}</p>
        ${lesson.task.actionLabel ? `<button type="button" class="task-action-btn" id="lessonTaskActionBtn">${lesson.task.actionLabel}</button>` : ''}
      </div>

      <div class="lesson-footer">
        <button type="button" class="btn-complete ${isDone ? 'is-done' : ''}" id="toggleCompleteBtn">
          ${isDone ? '✓ Сабақ аяқталды (Қайтару)' : '✓ Сабақты аяқтадым деп белгілеу'}
        </button>

        <div class="lesson-nav-btns">
          <button type="button" class="btn-ghost" id="prevLessonBtn" ${flatIdx <= 0 ? 'disabled' : ''}>← Алдыңғы</button>
          <button type="button" class="btn-ghost" id="nextLessonBtn" ${flatIdx >= allLessonsFlat.length - 1 ? 'disabled' : ''}>Келесі сабақ →</button>
        </div>
      </div>
    `;

    const actionBtn = document.getElementById('lessonTaskActionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => handleTaskAction(lesson.task));
    }

    document.getElementById('toggleCompleteBtn').addEventListener('click', () => {
      if (completedLessons.has(lesson.id)) {
        completedLessons.delete(lesson.id);
        showToast('Белгі алынды');
      } else {
        completedLessons.add(lesson.id);
        showToast(`✓ Сабақ ${lesson.code} аяқталды! Жарайсың!`);
      }
      saveSet(STORAGE_LESSONS, completedLessons);
      renderCurriculum();
    });

    document.getElementById('prevLessonBtn').addEventListener('click', () => {
      if (flatIdx > 0) {
        const prev = allLessonsFlat[flatIdx - 1];
        activeModuleIdx = prev.moduleIdx;
        activeLessonIdx = prev.lessonIdx;
        renderCurriculum();
        document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('nextLessonBtn').addEventListener('click', () => {
      if (flatIdx < allLessonsFlat.length - 1) {
        const next = allLessonsFlat[flatIdx + 1];
        activeModuleIdx = next.moduleIdx;
        activeLessonIdx = next.lessonIdx;
        renderCurriculum();
        document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function renderCurriculum() {
    updateProgressUI();
    renderModuleTabs();
    renderLessonSidebar();
    renderLessonReader();
  }

  renderCurriculum();

  // =========================================================
  // 2. 30-Day Roadmap Checklist
  // =========================================================
  const completedRoadmap = loadSet(STORAGE_ROADMAP);
  const roadmapGrid = document.getElementById('roadmapGrid');

  function renderRoadmap() {
    roadmapGrid.innerHTML = '';
    ROADMAP_WEEKS.forEach((week) => {
      const card = document.createElement('div');
      card.className = 'week-card';
      const doneCount = week.tasks.filter((t) => completedRoadmap.has(t.id)).length;

      card.innerHTML = `
        <div>
          <span class="week-badge">${week.badge} • ${doneCount}/${week.tasks.length}</span>
          <h3>${week.title}</h3>
        </div>
        <ul class="week-tasks">
          ${week.tasks.map((t) => {
            const checked = completedRoadmap.has(t.id);
            return `
              <li class="week-task-item ${checked ? 'done' : ''}">
                <label>
                  <input type="checkbox" data-task-id="${t.id}" ${checked ? 'checked' : ''} />
                  <span>${t.text}</span>
                </label>
              </li>
            `;
          }).join('')}
        </ul>
      `;

      card.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener('change', () => {
          const tid = cb.dataset.taskId;
          if (cb.checked) {
            completedRoadmap.add(tid);
            showToast('🔥 Тапсырма орындалды!');
          } else {
            completedRoadmap.delete(tid);
          }
          saveSet(STORAGE_ROADMAP, completedRoadmap);
          renderRoadmap();
        });
      });

      roadmapGrid.appendChild(card);
    });
  }
  renderRoadmap();

  // =========================================================
  // 3. Top 10 Mistakes & Free Resources
  // =========================================================
  const mistakesGrid = document.getElementById('mistakesGrid');
  mistakesGrid.innerHTML = TOP_MISTAKES.map((m) => `
    <div class="mistake-card">
      <div class="mistake-top">
        <span class="mistake-num">#${m.num}</span>
        <h4>${m.title}</h4>
      </div>
      <p class="mistake-bad">${m.bad}</p>
      <p class="mistake-fix">${m.fix}</p>
    </div>
  `).join('');

  const resourcesGrid = document.getElementById('resourcesGrid');
  resourcesGrid.innerHTML = FREE_RESOURCES.map((r) => `
    <div class="resource-card">
      <span class="resource-cat">${r.category}</span>
      <h4>${r.title}</h4>
      <p>${r.desc}</p>
      <div class="resource-tags">
        ${r.tags.map((tag) => `<span class="resource-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // =========================================================
  // 4. Interactive Quiz (10 Questions)
  // =========================================================
  const quizContainer = document.getElementById('quizContainer');
  const quizScoreBadge = document.getElementById('quizScoreBadge');
  let quizIdx = 0;
  let quizScore = 0;
  let quizAnswered = false;

  function renderQuiz() {
    quizScoreBadge.textContent = `Ұпай: ${quizScore} / ${QUIZ_QUESTIONS.length}`;

    if (quizIdx >= QUIZ_QUESTIONS.length) {
      let rank = '🎧 Жас Талант';
      let msg = 'Жақсы бастама! Сабақтарды тағы бір шолып шығып, тесті қайта тапсырып көр.';
      if (quizScore >= 9) {
        rank = '🏆 PRO БИТМЕЙКЕР';
        msg = 'Ғажап нәтиже! Сен битмейкингтің барлық басты ережелерін жетік білесің. Енді DAW ашып, хиттер жаса!';
      } else if (quizScore >= 6) {
        rank = '🔥 Студия Шебері';
        msg = 'Мықты деңгей! Негізін жақсы түсіндің, енді күнделікті тәжірибемен шыңдай бер.';
      }

      quizContainer.innerHTML = `
        <div style="text-align:center;padding:18px 0;">
          <div class="badge badge-emerald" style="font-size:0.95rem;padding:8px 18px;margin-bottom:12px;">${rank}</div>
          <h4 style="font-family:var(--font-display);font-size:1.5rem;margin:0 0 8px;">Нәтижең: ${quizScore} / ${QUIZ_QUESTIONS.length}</h4>
          <p style="color:var(--text-2);max-width:540px;margin:0 auto 20px;">${msg}</p>
          <button type="button" class="btn btn-primary" id="restartQuizBtn">Тесті қайта тапсыру</button>
        </div>
      `;
      document.getElementById('restartQuizBtn').addEventListener('click', () => {
        quizIdx = 0;
        quizScore = 0;
        quizAnswered = false;
        renderQuiz();
      });
      return;
    }

    const item = QUIZ_QUESTIONS[quizIdx];
    quizAnswered = false;

    quizContainer.innerHTML = `
      <div class="mono-label" style="margin-bottom:8px;">СҰРАҚ ${quizIdx + 1} / ${QUIZ_QUESTIONS.length}</div>
      <h4 class="quiz-q-title">${item.q}</h4>
      <div class="quiz-options">
        ${item.options.map((opt, idx) => `<button type="button" class="quiz-opt" data-opt="${idx}">${opt}</button>`).join('')}
      </div>
      <div class="quiz-feedback hidden" id="quizFeedback"></div>
      <button type="button" class="btn btn-secondary hidden" id="quizNextBtn">
        ${quizIdx === QUIZ_QUESTIONS.length - 1 ? 'Нәтижені көру →' : 'Келесі сұрақ →'}
      </button>
    `;

    const optBtns = quizContainer.querySelectorAll('.quiz-opt');
    const feedbackEl = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('quizNextBtn');

    optBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const chosen = Number(btn.dataset.opt);
        const isCorrect = chosen === item.correct;

        if (isCorrect) {
          quizScore++;
          btn.classList.add('correct');
          feedbackEl.innerHTML = `<strong style="color:#00e5a0;">✓ Дұрыс!</strong> ${item.explain}`;
        } else {
          btn.classList.add('wrong');
          optBtns[item.correct].classList.add('correct');
          feedbackEl.innerHTML = `<strong style="color:#ff7c95;">✕ Қате.</strong> ${item.explain}`;
        }

        optBtns.forEach((b) => { b.disabled = true; });
        quizScoreBadge.textContent = `Ұпай: ${quizScore} / ${QUIZ_QUESTIONS.length}`;
        feedbackEl.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
      });
    });

    nextBtn.addEventListener('click', () => {
      quizIdx++;
      renderQuiz();
    });
  }
  renderQuiz();

  // =========================================================
  // 5. Searchable Producer Glossary
  // =========================================================
  const glossarySearch = document.getElementById('glossarySearch');
  const glossaryFilters = document.querySelectorAll('#glossaryFilters .filter-pill');
  const glossaryGrid = document.getElementById('glossaryGrid');

  const CAT_LABELS = {
    basics: 'Негіздер',
    rhythm: 'Ырғақ',
    melody: 'Мелодия',
    mixing: 'Миксинг',
    business: 'Бизнес'
  };

  let activeGlossaryCat = 'all';
  let glossaryQuery = '';

  function renderGlossary() {
    const q = glossaryQuery.trim().toLowerCase();
    const filtered = GLOSSARY.filter((item) => {
      const catMatch = activeGlossaryCat === 'all' || item.cat === activeGlossaryCat;
      const textMatch = !q || item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q);
      return catMatch && textMatch;
    });

    if (filtered.length === 0) {
      glossaryGrid.innerHTML = `<p style="color:var(--text-3);grid-column:1/-1;">«${glossaryQuery}» бойынша термин табылмады.</p>`;
      return;
    }

    glossaryGrid.innerHTML = filtered.map((item) => `
      <div class="glossary-card">
        <div class="glossary-card-head">
          <span class="glossary-term">${item.term}</span>
          <span class="glossary-cat">${CAT_LABELS[item.cat] || item.cat}</span>
        </div>
        <p>${item.def}</p>
      </div>
    `).join('');
  }

  glossarySearch.addEventListener('input', (e) => {
    glossaryQuery = e.target.value;
    renderGlossary();
  });

  glossaryFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeGlossaryCat = btn.dataset.cat;
      glossaryFilters.forEach((b) => b.classList.toggle('active', b === btn));
      renderGlossary();
    });
  });

  renderGlossary();
});
