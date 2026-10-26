/* 通用点选生成器（词语树版）：点开类目展开词条，点词拼提示词，自动复制，记住选项（仅 localStorage）。 */
var genSelected = [];
var genExtra = "";
var genLastAdded = null;
var LS_TREE_GEN = "prompttool_tree_gen";

function saveTreeGen() {
  try {
    localStorage.setItem(LS_TREE_GEN, JSON.stringify({ selected: genSelected, extra: genExtra }));
  } catch (e) {}
}
function loadTreeGen() {
  try {
    var o = JSON.parse(localStorage.getItem(LS_TREE_GEN) || "{}");
    genSelected = o.selected || [];
    genExtra = o.extra || "";
  } catch (e) { genSelected = []; genExtra = ""; }
}
function genToggle(cat, word) {
  var was = isSel(genSelected, cat, word);
  toggleSel(genSelected, cat, word);
  if (!was) genLastAdded = { cat: cat, word: word };
  else if (genLastAdded && genLastAdded.cat === cat && genLastAdded.word === word) genLastAdded = null;
  saveTreeGen();
  renderTreeGen();
}
function renderTreeGen() {
  renderTree("treeBox", genSelected, genToggle);
  renderSelected("selBox", genSelected, genToggle);
  bindTreeSearch("treeSearch", "searchResults", function () { return genSelected; }, genToggle);
  renderSearchResults("treeSearch", "searchResults", genSelected, genToggle);
  renderQuickZone("quickZone", genSelected, genToggle);
  renderReco("recoBox", genSelected, genLastAdded, genToggle, function (list) {
    var n = 0;
    list.forEach(function (r) {
      if (!isSel(genSelected, r.cat, r.word)) { genSelected.push({ cat: r.cat, word: r.word }); n++; }
    });
    saveTreeGen();
    renderTreeGen();
    toast("已加上 " + n + " 个搭配词");
  });
  var inp = document.getElementById("extraInput");
  if (inp && inp.value !== genExtra) inp.value = genExtra;
}
function genPromptTree() {
  var p = composePrompt(genSelected, genExtra.trim());
  var out = document.getElementById("genOutput");
  if (!p) { out.textContent = "请至少从词语树点一个词，或填一句补充要求，再生成。"; return; }
  out.textContent = p;
  copyText(p, "提示词已自动复制到剪贴板");
  document.getElementById("genResult").style.display = "block";
  renderAiButtons("genAiRow", function () { return composePrompt(genSelected, genExtra.trim()); });
}
document.addEventListener("DOMContentLoaded", function () {
  /* 模板库单镜套用跳转过来时：把轮播定位到首词类目，并显示一次提示（阅后即焚）。 */
  var pendingNote = null;
  try {
    var tb = document.getElementById("treeBox");
    var di = sessionStorage.getItem("prompttool_deck_index");
    if (di !== null && tb) tb._deckIndex = parseInt(di, 10);
    sessionStorage.removeItem("prompttool_deck_index");
    pendingNote = sessionStorage.getItem("prompttool_tpl_note");
    sessionStorage.removeItem("prompttool_tpl_note");
  } catch (e) {}
  loadTreeGen();
  renderTreeGen();
  if (pendingNote) toast(pendingNote);
  var inp = document.getElementById("extraInput");
  if (inp) {
    inp.value = genExtra;
    inp.oninput = function () { genExtra = inp.value; saveTreeGen(); };
  }
  document.getElementById("genBtn2").onclick = genPromptTree;
  document.getElementById("fabGen2").onclick = genPromptTree;
  document.getElementById("clearBtn").onclick = function () {
    genSelected = [];
    genLastAdded = null;
    saveTreeGen();
    renderTreeGen();
    toast("已清空已选词");
  };
});
