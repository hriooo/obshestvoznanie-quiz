// Логика перемешивания вопросов/вариантов и подсчёта баллов
// с частичным зачётом — как на реальном вступительном экзамене
// (см. раздел VI программы: за неполный выбор из нескольких верных
// вариантов баллы снимаются, но не обнуляются полностью).

// Склонение русских существительных после числительного, напр.:
// ruPlural(1,["вопрос","вопроса","вопросов"]) -> "вопрос"
// ruPlural(2,["вопрос","вопроса","вопросов"]) -> "вопроса"
// ruPlural(5,["вопрос","вопроса","вопросов"]) -> "вопросов"
function ruPlural(n, forms) {
  var mod10 = n % 10;
  var mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// Готовит копию вопросов для прохождения: перемешивает порядок вопросов
// и порядок вариантов ответа внутри каждого вопроса (индексы correct
// пересчитываются под новый порядок).
function prepareQuizQuestions(rawQuestions, limit) {
  var pool = shuffleArray(rawQuestions);
  if (limit && limit > 0 && limit < pool.length) {
    pool = pool.slice(0, limit);
  }
  return pool.map(function (q) {
    var optionOrder = shuffleArray([0, 1, 2, 3]); // optionOrder[newIndex] = oldIndex
    var newOptions = optionOrder.map(function (oldIdx) { return q.options[oldIdx]; });
    var newCorrect = [];
    optionOrder.forEach(function (oldIdx, newIdx) {
      if (q.correct.indexOf(oldIdx) !== -1) newCorrect.push(newIdx);
    });
    return {
      id: q.id,
      topic: q.topic,
      question: q.question,
      options: newOptions,
      correct: newCorrect,
      explanation: q.explanation
    };
  });
}

// Считает балл за один вопрос по выбранным индексам (0..1).
// Формула: (число верно выбранных - число неверно выбранных) / (сколько верных всего)
// Итог не может быть меньше 0. Если выбрано ровно множество верных вариантов
// и ничего лишнего — балл = 1 (полный зачёт).
function scoreQuestion(question, selectedIndices) {
  var correctSet = question.correct;
  var correctSelected = 0;
  var incorrectSelected = 0;
  selectedIndices.forEach(function (idx) {
    if (correctSet.indexOf(idx) !== -1) correctSelected++;
    else incorrectSelected++;
  });
  var required = correctSet.length || 1;
  var raw = (correctSelected - incorrectSelected) / required;
  var score = Math.max(0, Math.min(1, raw));
  return {
    score: score,
    correctSelected: correctSelected,
    incorrectSelected: incorrectSelected,
    isFullyCorrect: score === 1 && incorrectSelected === 0 && correctSelected === required,
    isPartial: score > 0 && score < 1,
    isWrong: score === 0
  };
}
