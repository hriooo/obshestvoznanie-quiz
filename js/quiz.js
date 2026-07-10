// Логика страницы прохождения теста по одному разделу.

(function () {
  var OPTION_LABELS = ["а", "б", "в", "г"];

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  var sectionId = Number(getParam("section"));
  var meta = getSectionMeta(sectionId);
  var quizForm = document.getElementById("quizForm");
  var instructionsCard = document.getElementById("instructionsCard");
  var summaryContainer = document.getElementById("summaryContainer");
  var currentQuestions = [];

  if (!meta) {
    document.getElementById("quizTitle").textContent = "Раздел не найден";
    instructionsCard.style.display = "none";
    return;
  }

  document.getElementById("quizTitle").textContent = "Раздел " + meta.id + ". " + meta.title;
  var rawQuestions = getSectionQuestions(sectionId);
  document.getElementById("quizMeta").textContent = "Всего вопросов в разделе: " + rawQuestions.length;

  document.getElementById("startBtn").addEventListener("click", function () {
    var limit = Number(document.getElementById("lengthSelect").value);
    startQuiz(limit);
  });

  function startQuiz(limit) {
    currentQuestions = prepareQuizQuestions(rawQuestions, limit);
    instructionsCard.style.display = "none";
    quizForm.style.display = "block";
    quizForm.innerHTML = "";
    summaryContainer.innerHTML = "";

    currentQuestions.forEach(function (q, index) {
      var card = document.createElement("div");
      card.className = "question-card";
      card.dataset.qid = q.id;

      var hint = q.correct.length === 1
        ? "Выберите один правильный вариант"
        : "Выберите " + q.correct.length + " правильных варианта(ов)";

      var optionsHtml = q.options.map(function (opt, i) {
        return (
          '<label class="option-row" data-idx="' + i + '">' +
          '<input type="checkbox" name="q_' + q.id + '" value="' + i + '">' +
          '<span>' + OPTION_LABELS[i] + ') ' + opt + '</span>' +
          '</label>'
        );
      }).join("");

      card.innerHTML =
        '<div class="q-index">Вопрос ' + (index + 1) + ' из ' + currentQuestions.length + ' · ' + q.topic + '</div>' +
        '<div class="q-hint">' + hint + '</div>' +
        '<p class="q-text">' + q.question + '</p>' +
        '<div class="options">' + optionsHtml + '</div>' +
        '<div class="feedback-slot"></div>';

      quizForm.appendChild(card);
    });

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn block";
    submitBtn.textContent = "Проверить и завершить тест";
    submitBtn.style.marginTop = "8px";
    submitBtn.addEventListener("click", gradeQuiz);
    quizForm.appendChild(submitBtn);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function gradeQuiz() {
    var totalScore = 0;
    var results = [];

    currentQuestions.forEach(function (q) {
      var card = quizForm.querySelector('.question-card[data-qid="' + q.id + '"]');
      var checked = Array.prototype.slice.call(
        card.querySelectorAll('input[type="checkbox"]:checked')
      ).map(function (el) { return Number(el.value); });

      var result = scoreQuestion(q, checked);
      totalScore += result.score;
      results.push({ question: q, selected: checked, result: result });

      recordAnswer(sectionId, q.id, result.score, checked);

      // визуальная разметка карточки
      card.classList.add("graded");
      card.querySelectorAll(".option-row").forEach(function (row) {
        var idx = Number(row.dataset.idx);
        row.querySelector("input").disabled = true;
        var isCorrectOpt = q.correct.indexOf(idx) !== -1;
        var wasSelected = checked.indexOf(idx) !== -1;
        if (isCorrectOpt) row.classList.add("correct-answer");
        else if (wasSelected) row.classList.add("wrong-selected");
      });

      var bannerClass = result.isFullyCorrect ? "full" : (result.isPartial ? "partial" : "wrong");
      var bannerText = result.isFullyCorrect
        ? "✅ Полностью верно"
        : result.isPartial
          ? "🟡 Частично верно (" + Math.round(result.score * 100) + "% балла за вопрос)"
          : "❌ Неверно";

      var feedbackSlot = card.querySelector(".feedback-slot");
      feedbackSlot.innerHTML =
        '<div class="result-banner ' + bannerClass + '">' + bannerText + '</div>' +
        (q.explanation ? '<div class="explanation">💡 ' + q.explanation + '</div>' : "");
    });

    var avgScorePct = Math.round((totalScore / currentQuestions.length) * 100);
    recordAttempt(sectionId, currentQuestions.length, avgScorePct);

    var fullCount = results.filter(function (r) { return r.result.isFullyCorrect; }).length;
    var partialCount = results.filter(function (r) { return r.result.isPartial; }).length;
    var wrongCount = results.filter(function (r) { return r.result.isWrong; }).length;

    summaryContainer.innerHTML =
      '<div class="summary-card">' +
      '<div class="score-big">' + avgScorePct + '%</div>' +
      '<div class="score-sub">Результат по разделу «' + meta.title + '»</div>' +
      '<div class="score-sub">✅ Верно: ' + fullCount + ' · 🟡 Частично: ' + partialCount + ' · ❌ Неверно: ' + wrongCount + '</div>' +
      '<div class="summary-actions">' +
      '<a class="btn secondary" href="index.html">На главную</a>' +
      '<a class="btn secondary" href="review.html?section=' + sectionId + '">Смотреть ошибки</a>' +
      '<button class="btn" id="retryBtn">Пройти ещё раз</button>' +
      '</div>' +
      '</div>';

    document.getElementById("retryBtn").addEventListener("click", function () {
      quizForm.style.display = "none";
      summaryContainer.innerHTML = "";
      instructionsCard.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
})();
