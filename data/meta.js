// Метаданные разделов теста. Порядок соответствует программе вступительного
// испытания по обществознанию (МГЮА), раздел II "Содержание разделов".
const SECTIONS_META = [
  {
    id: 1,
    file: "section1.js",
    varName: "SECTION_1_QUESTIONS",
    title: "Общество и человек",
    description: "Общество как система, прогресс, цивилизации, человек, личность, мировоззрение",
    icon: "🌍"
  },
  {
    id: 2,
    file: "section2.js",
    varName: "SECTION_2_QUESTIONS",
    title: "Деятельность и познание",
    description: "Деятельность, познание, истина, научное и социальное познание",
    icon: "🧠"
  },
  {
    id: 3,
    file: "section3.js",
    varName: "SECTION_3_QUESTIONS",
    title: "Духовная жизнь общества",
    description: "Культура, мораль, религия, искусство, наука, образование",
    icon: "🎭"
  },
  {
    id: 4,
    file: "section4.js",
    varName: "SECTION_4_QUESTIONS",
    title: "Экономическая жизнь общества",
    description: "Экономика, рынок, деньги, фирмы, государство, предпринимательство",
    icon: "💰"
  },
  {
    id: 5,
    file: "section5.js",
    varName: "SECTION_5_QUESTIONS",
    title: "Социальные отношения",
    description: "Соц. структура, стратификация, конфликты, семья, молодёжь, демография",
    icon: "👥"
  },
  {
    id: 6,
    file: "section6.js",
    varName: "SECTION_6_QUESTIONS",
    title: "Политическая жизнь общества",
    description: "Государство, власть, партии, выборы, политические режимы и идеологии",
    icon: "🏛️"
  },
  {
    id: 7,
    file: "section7.js",
    varName: "SECTION_7_QUESTIONS",
    title: "Право и правовые отношения",
    description: "Право, Конституция РФ, отрасли права, правонарушения и ответственность",
    icon: "⚖️"
  }
];

function getSectionQuestions(sectionId) {
  const meta = SECTIONS_META.find(function (s) { return s.id === Number(sectionId); });
  if (!meta) return [];
  return window[meta.varName] || [];
}

function getSectionMeta(sectionId) {
  return SECTIONS_META.find(function (s) { return s.id === Number(sectionId); }) || null;
}
