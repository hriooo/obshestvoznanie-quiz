// Хранение прогресса ученика в localStorage.
// Всё хранится локально в браузере — никакого сервера не нужно.

var STORAGE_KEY = "oe_quiz_progress_v1";

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sections: {} };
    var parsed = JSON.parse(raw);
    if (!parsed.sections) parsed.sections = {};
    return parsed;
  } catch (e) {
    console.warn("Не удалось прочитать прогресс из localStorage:", e);
    return { sections: {} };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Не удалось сохранить прогресс в localStorage:", e);
  }
}

// Записать результат ответа на один вопрос.
// score — число от 0 до 1 (см. js/scoring.js)
function recordAnswer(sectionId, questionId, score, selectedIndices) {
  var state = loadState();
  var secKey = String(sectionId);
  if (!state.sections[secKey]) state.sections[secKey] = {};
  var prev = state.sections[secKey][questionId];
  var bestScore = prev ? Math.max(prev.bestScore, score) : score;
  var timesAnswered = prev ? prev.timesAnswered + 1 : 1;
  state.sections[secKey][questionId] = {
    bestScore: bestScore,
    lastScore: score,
    lastSelected: selectedIndices,
    timesAnswered: timesAnswered,
    lastAt: Date.now()
  };
  saveState(state);
}

// Зафиксировать факт прохождения теста целиком (для истории попыток).
function recordAttempt(sectionId, questionsCount, avgScorePct) {
  var state = loadState();
  if (!state.history) state.history = [];
  state.history.push({
    sectionId: sectionId,
    date: Date.now(),
    questionsCount: questionsCount,
    avgScorePct: avgScorePct
  });
  // храним не более 200 последних попыток, чтобы не раздувать localStorage
  if (state.history.length > 200) {
    state.history = state.history.slice(state.history.length - 200);
  }
  saveState(state);
}

// Прогресс по одному разделу.
// totalQuestions — сколько вопросов всего в разделе.
function getSectionProgress(sectionId, totalQuestions) {
  var state = loadState();
  var sec = state.sections[String(sectionId)] || {};
  var ids = Object.keys(sec);
  var solvedCount = ids.length;
  var sumBest = 0;
  var sumLast = 0;
  ids.forEach(function (qId) {
    sumBest += sec[qId].bestScore;
    sumLast += sec[qId].lastScore;
  });
  var masteryPct = totalQuestions > 0 ? Math.round((sumBest / totalQuestions) * 100) : 0;
  var avgOfSolvedPct = solvedCount > 0 ? Math.round((sumBest / solvedCount) * 100) : 0;
  return {
    solvedCount: solvedCount,
    totalQuestions: totalQuestions,
    masteryPct: masteryPct,
    avgOfSolvedPct: avgOfSolvedPct
  };
}

// Общий прогресс по всем разделам сразу.
function getOverallProgress(sectionsMeta, questionsCountBySection) {
  var totalQuestions = 0;
  var sumBest = 0;
  var solvedCount = 0;
  var state = loadState();
  sectionsMeta.forEach(function (meta) {
    var total = questionsCountBySection[meta.id] || 0;
    totalQuestions += total;
    var sec = state.sections[String(meta.id)] || {};
    var ids = Object.keys(sec);
    solvedCount += ids.length;
    ids.forEach(function (qId) {
      sumBest += sec[qId].bestScore;
    });
  });
  var masteryPct = totalQuestions > 0 ? Math.round((sumBest / totalQuestions) * 100) : 0;
  return {
    totalQuestions: totalQuestions,
    solvedCount: solvedCount,
    masteryPct: masteryPct
  };
}

// Список вопросов, где последний ответ не полностью верный (это и есть "ошибки").
// sectionId необязателен: если не передан, отдаёт ошибки по всем разделам.
function getMistakes(sectionId) {
  var state = loadState();
  var result = [];
  var sectionIds = sectionId ? [String(sectionId)] : Object.keys(state.sections);
  sectionIds.forEach(function (secKey) {
    var sec = state.sections[secKey] || {};
    Object.keys(sec).forEach(function (qId) {
      var entry = sec[qId];
      if (entry.lastScore < 1) {
        result.push({
          sectionId: Number(secKey),
          questionId: qId,
          lastScore: entry.lastScore,
          lastSelected: entry.lastSelected,
          timesAnswered: entry.timesAnswered,
          lastAt: entry.lastAt
        });
      }
    });
  });
  // сначала самые "провальные" (score 0), потом частично верные; внутри — недавние выше
  result.sort(function (a, b) {
    if (a.lastScore !== b.lastScore) return a.lastScore - b.lastScore;
    return b.lastAt - a.lastAt;
  });
  return result;
}

function resetSection(sectionId) {
  var state = loadState();
  delete state.sections[String(sectionId)];
  saveState(state);
}

function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
}
