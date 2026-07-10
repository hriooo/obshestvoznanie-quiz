// Логика страницы "Мои ошибки".

(function () {
  var OPTION_LABELS = ["а", "б", "в", "г"];

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  var sectionSelect = document.getElementById("sectionFilter");
  SECTIONS_META.forEach(function (meta) {
    var opt = document.createElement("option");
    opt.value = String(meta.id);
    opt.textContent = "Раздел " + meta.id + ". " + meta.title;
    sectionSelect.appendChild(opt);
  });

  var initialSection = getParam("section");
  if (initialSection) sectionSelect.value = initialSection;

  sectionSelect.addEventListener("change", render);
  render();

  function findQuestionById(sectionId, questionId) {
    var questions = getSectionQuestions(sectionId);
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === questionId) return questions[i];
    }
    return null;
  }

  function render() {
    var sectionFilter = sectionSelect.value ? Number(sectionSelect.value) : undefined;
    var mistakes = getMistakes(sectionFilter);
    var listEl = document.getElementById("mistakesList");
    var mistakeWord = ruPlural(mistakes.length, ["вопрос", "вопроса", "вопросов"]);
    var mistakeVerb = (mistakes.length % 10 === 1 && mistakes.length % 100 !== 11) ? "требует" : "требуют";
    document.getElementById("mistakesCount").textContent =
      mistakes.length + " " + mistakeWord + " " + mistakeVerb + " повторения";

    if (mistakes.length === 0) {
      listEl.innerHTML =
        '<div class="empty-state"><div class="emoji">🎉</div>' +
        '<p>Ошибок не найдено — либо вы ещё не проходили тесты, либо всё решено верно!</p>' +
        '<a class="btn" href="index.html">К разделам</a></div>';
      return;
    }

    listEl.innerHTML = "";
    mistakes.forEach(function (m) {
      var meta = getSectionMeta(m.sectionId);
      var question = findQuestionById(m.sectionId, m.questionId);
      if (!question) return;

      var item = document.createElement("div");
      item.className = "mistake-item";

      var optionsHtml = question.options.map(function (opt, i) {
        var isCorrect = question.correct.indexOf(i) !== -1;
        var wasSelected = m.lastSelected.indexOf(i) !== -1;
        var cls = isCorrect ? "correct-answer" : (wasSelected ? "wrong-selected" : "");
        return (
          '<div class="option-row ' + cls + '" style="cursor:default;">' +
          '<span>' + OPTION_LABELS[i] + ') ' + opt + (wasSelected ? " — ваш выбор" : "") + '</span>' +
          '</div>'
        );
      }).join("");

      var scoreLabel = m.lastScore === 0 ? "Неверно" : "Частично верно (" + Math.round(m.lastScore * 100) + "%)";

      item.innerHTML =
        '<span class="topic-tag">Раздел ' + m.sectionId + ' · ' + (meta ? meta.title : "") + ' · ' + question.topic + '</span>' +
        '<p class="q-text" style="font-weight:600;margin:6px 0 10px;">' + question.question + '</p>' +
        '<div class="options">' + optionsHtml + '</div>' +
        '<div class="result-banner ' + (m.lastScore === 0 ? "wrong" : "partial") + '" style="margin-top:10px;">' + scoreLabel + '</div>' +
        (question.explanation ? '<div class="explanation">💡 ' + question.explanation + '</div>' : "");

      listEl.appendChild(item);
    });
  }
})();
