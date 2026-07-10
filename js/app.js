// Логика главной страницы: карточки разделов + общий прогресс.

(function () {
  var questionsCountBySection = {};
  SECTIONS_META.forEach(function (meta) {
    questionsCountBySection[meta.id] = getSectionQuestions(meta.id).length;
  });

  function render() {
    var overall = getOverallProgress(SECTIONS_META, questionsCountBySection);
    document.getElementById("overallPct").textContent = overall.masteryPct + "%";
    document.getElementById("overallLabel").textContent =
      "Общий прогресс по всем разделам · решено вопросов: " + overall.solvedCount + " из " + overall.totalQuestions;
    document.getElementById("overallBar").style.width = overall.masteryPct + "%";

    var grid = document.getElementById("sectionGrid");
    grid.innerHTML = "";
    SECTIONS_META.forEach(function (meta) {
      var total = questionsCountBySection[meta.id];
      var progress = getSectionProgress(meta.id, total);
      var card = document.createElement("div");
      card.className = "section-card";

      var startedLabel = progress.solvedCount > 0
        ? "Прогресс: " + progress.masteryPct + "% · решено " + progress.solvedCount + "/" + total
        : "Ещё не начато · " + total + " вопросов";

      card.innerHTML =
        '<div class="icon">' + meta.icon + '</div>' +
        '<h3>Раздел ' + meta.id + '. ' + meta.title + '</h3>' +
        '<p class="desc">' + meta.description + '</p>' +
        '<div class="progress-bar-track light"><div class="progress-bar-fill accent" style="width:' + progress.masteryPct + '%"></div></div>' +
        '<div class="stats-row"><span>' + startedLabel + '</span></div>' +
        '<div class="actions">' +
        '<a class="btn block" href="quiz.html?section=' + meta.id + '">' +
        (progress.solvedCount > 0 ? "Продолжить / пройти снова" : "Начать тест") +
        '</a>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  // Подтверждение сброса прямо в кнопке (без нативного confirm()):
  // первый клик переводит кнопку в состояние "точно?", второй клик в течение
  // 4 секунд действительно всё сбрасывает. Клик мимо или пауза — отмена.
  var resetBtn = document.getElementById("resetAllBtn");
  var resetArmed = false;
  var resetTimer = null;
  var resetDefaultLabel = resetBtn.textContent;

  function disarmReset() {
    resetArmed = false;
    resetBtn.textContent = resetDefaultLabel;
    resetBtn.classList.remove("danger-armed");
    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
  }

  resetBtn.addEventListener("click", function () {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = "⚠️ Точно сбросить? Нажмите ещё раз";
      resetBtn.classList.add("danger-armed");
      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    resetAll();
    render();
  });

  render();
})();
