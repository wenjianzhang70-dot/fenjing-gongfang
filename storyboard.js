/* 长视频分镜生成器（词语树版）+ 已选元素注入。纯前端模板拼装，不调用任何 AI 接口。 */
var DEFAULT_STYLE = "电影感，电影级光影，浅景深，胶片质感，16:9 宽画幅";
var DURATIONS = {
"30秒": { shots: 3, per: 10},
"1分钟": { shots: 5, per: 12},
"3分钟": { shots: 12, per: 15},
"5分钟": { shots: 20, per: 15}
};
var BEATS = [
{ name: "开场", scene: function (t) { return "全景展开，交代" + t + "发生的环境，主角登场";}, narration: "旁白：故事从这里开始。", transition: "淡入"},
{ name: "引入", scene: function (t) { return "主角开始" + t + "的第一步，关键细节特写";}, narration: "旁白：一切从这一步开始。", transition: "硬切"},
{ name: "发展", scene: function (t) { return t + "逐步推进，连续动作展示完整过程";}, narration: "旁白：事情正在一步步推进。", transition: "硬切"},
{ name: "转折", scene: function (t) { return t + "出现意外或转折，主角停下、反应特写";}, narration: "音效：环境音突然安静一拍。", transition: "快速切换"},
{ name: "高潮", scene: function (t) { return t + "最精彩的一刻，多角度、快节奏呈现";}, narration: "旁白：最关键的一刻到了。", transition: "快切"},
{ name: "收尾", scene: function (t) { return t + "尘埃落定，主角回望，情绪回落";}, narration: "旁白：尘埃落定。", transition: "叠化"},
{ name: "结尾", scene: function (t) { return t + "的最后一幕，定格画面，留一句收束旁白";}, narration: "旁白：一句话收束全片。", transition: "淡出"}
];
var CAMERAS = ["全景固定机位", "缓慢推近", "跟随拍摄", "环绕镜头", "特写切换", "航拍俯瞰", "手持跟拍"];
var storySelected = [];
var currentShots = [];
var currentAnchor = "";
var LS_TREE_STORY = "prompttool_tree_story";

function saveTreeStory() {
  try { localStorage.setItem(LS_TREE_STORY, JSON.stringify(storySelected)); } catch (e) {}
}
function loadTreeStory() {
  try { storySelected = JSON.parse(localStorage.getItem(LS_TREE_STORY) || "[]"); } catch (e) { storySelected = []; }
}
var storyLastAdded = null;
var lazyDir = null;
function storyToggle(cat, word) {
  var was = isSel(storySelected, cat, word);
  toggleSel(storySelected, cat, word);
  if (!was) storyLastAdded = { cat: cat, word: word };
  else if (storyLastAdded && storyLastAdded.cat === cat && storyLastAdded.word === word) storyLastAdded = null;
  saveTreeStory();
  renderTreeStory();
}
function renderTreeStory() {
  renderTree("treeBox", storySelected, storyToggle);
  renderSelected("selBox", storySelected, storyToggle);
  bindTreeSearch("treeSearch", "searchResults", function () { return storySelected; }, storyToggle);
  renderSearchResults("treeSearch", "searchResults", storySelected, storyToggle);
  renderQuickZone("quickZone", storySelected, storyToggle);
  renderReco("recoBox", storySelected, storyLastAdded, storyToggle, function (list) {
    var n = 0;
    list.forEach(function (r) {
      if (!isSel(storySelected, r.cat, r.word)) { storySelected.push({ cat: r.cat, word: r.word }); n++; }
    });
    saveTreeStory();
    renderTreeStory();
    toast("已加上 " + n + " 个搭配词");
  });
}
function renderLazyDirs() {
  var box = document.getElementById("lazyDirs");
  if (!box) return;
  box.innerHTML = "";
  Object.keys(LAZY_RULES).forEach(function (d) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (lazyDir === d ? " on" : "");
    b.textContent = d;
    b.onclick = function () { lazyDir = (lazyDir === d ? null : d); renderLazyDirs(); };
    box.appendChild(b);
  });
}
function runLazy() {
  var themeInput = document.getElementById("theme");
  var typed = (document.getElementById("lazyTheme").value || "").trim() || (themeInput.value || "").trim();
  /* 以预览版为准：已点方向优先；否则按主题关键词自动识别方向；都没有且主题为空才提示。 */
  var dir = lazyDir || detectLazyDir(typed);
  if (!dir && !typed) { toast("点一个方向，或先写一句话主题"); return; }
  var combo = dir ? LAZY_RULES[dir] : LAZY_GENERIC;
  var added = [];
  combo.forEach(function (r) {
    if (!isSel(storySelected, r.cat, r.word)) { storySelected.push({ cat: r.cat, word: r.word }); added.push(r.word); }
  });
  if (dir && added.length) storyLastAdded = { cat: "type", word: dir };
  themeInput.value = typed || ("一段" + dir + "的故事");
  saveTreeStory();
  renderTreeStory();
  document.getElementById("lazyNote").textContent = dir
    ? "已按【" + dir + "】自动搭配 " + added.length + " 个新词（重复的已跳过），可再手动改词后重新生成。"
    : "已自动配齐一套通用搭配，并生成分镜表。";
  buildStoryboard();
  var res = document.getElementById("result");
  if (res && res.scrollIntoView) { try { res.scrollIntoView(); } catch (e) {} }
}

function buildStoryboard() {
  var themeEl = document.getElementById("theme");
  var theme = (themeEl.value || "").trim();
  var durKey = document.getElementById("duration").value;
  var hero = (document.getElementById("hero").value || "").trim() || "一位短发、穿日常服装的年轻人";
  /* 以预览版为准：主题留空时，只用类型、情绪、场景、人物、动作五类已选词
     按词语树顺序以“、”连接写回主题框；五类一个都没有则提示并中止。 */
  if (!theme) {
    var THEME_CATS = ["type", "emotion", "scene", "person", "action"];
    var parts = [];
    THEME_CATS.forEach(function (cid) {
      storySelected.forEach(function (s) { if (s.cat === cid) parts.push(s.word); });
    });
    if (!parts.length) { toast("先在上方词语树里点几个词，或写一句主题"); themeEl.focus(); return; }
    theme = parts.join("、");
    themeEl.value = theme;
    toast("主题留空，已用你选的词拼成主题");
  }
  var plan = DURATIONS[durKey];
  var typeWords = storySelected.filter(function (s) { return s.cat === "type"; }).map(function (s) { return s.word; });
  var styleText = typeWords.length ? "风格：" + typeWords.join("、") : DEFAULT_STYLE;
  var grouped = groupSelected(storySelected);
  currentAnchor = "主角：" + hero + "；" + styleText + (grouped ? "；已选元素：" + grouped : "") + "；全片每一镜都必须保持主角外貌、服装、画风一致。";
  /* 以预览版为准：基础运镜循环，另有镜头类词时追加“；结合所选镜头元素：…”后缀。 */
  var camWordsList = cameraWordsOrdered(storySelected);
  currentShots = [];
  for (var i = 0; i < plan.shots; i++) {
    var beat = BEATS[Math.round(i / (plan.shots - 1) * (BEATS.length - 1))];
    var scene = beat.scene(theme);
    var base = CAMERAS[i % CAMERAS.length];
    var camera = camWordsList.length ? base + "；结合所选镜头元素：" + camWordsList.join("、") : base;
    var prompt = "" + currentAnchor + "画面：" + scene + "；运镜：" + camera + "；时长约" + plan.per + "秒。";
    currentShots.push({ no: i + 1, beat: beat.name, scene: scene, camera: camera, dur: plan.per, prompt: prompt, narration: beat.narration, transition: beat.transition });
  }
  renderStoryboard(theme, durKey);
  renderAiButtons("aiRow", function () { return currentShots.map(function (s) { return "镜" + s.no + "：" + s.prompt; }).join("\n"); });
}
function renderStoryboard(theme, durKey) {
  document.getElementById("anchorBox").textContent = "固定锚点（已自动写进每一镜提示词）：" + currentAnchor;
  var tb = document.getElementById("shotTable");
  tb.innerHTML = "";
  var head = document.createElement("tr");
  ["镜号", "段落", "画面内容", "运镜", "时长", "提示词", "旁白 / 音效", "转场", "操作"].forEach(function (h) {
    var th = document.createElement("th"); th.textContent = h; head.appendChild(th);
  });
  tb.appendChild(head);
  currentShots.forEach(function (s) {
    var tr = document.createElement("tr");
    var cells = [s.no, s.beat, s.scene, s.camera, s.dur + "秒", s.prompt, s.narration, s.transition];
    cells.forEach(function (c) { var td = document.createElement("td"); td.textContent = c; tr.appendChild(td); });
    var td = document.createElement("td");
    var b = document.createElement("button");
    b.className = "small green"; b.textContent = "复制本镜";
    b.onclick = function () { copyText(s.prompt, "镜" + s.no + "提示词已复制"); };
    td.appendChild(b); tr.appendChild(td);
    tb.appendChild(tr);
  });
  document.getElementById("result").style.display = "block";
  document.getElementById("metaLine").textContent = "主题：" + theme + "｜总时长：" + durKey + "｜共 " + currentShots.length + " 镜" + (storySelected.length ? "｜已选词 " + storySelected.length + " 个" : "");
}
function copyWholeTable() {
  if (!currentShots.length) { toast("请先生成分镜"); return; }
  var lines = [];
  lines.push(document.getElementById("metaLine").textContent);
  lines.push("固定锚点：" + currentAnchor);
  currentShots.forEach(function (s) {
    lines.push("镜" + s.no + "（" + s.beat + "，" + s.dur + "秒，运镜：" + s.camera + "，转场：" + s.transition + "）");
    lines.push("画面：" + s.scene);
    lines.push("提示词：" + s.prompt);
    lines.push(s.narration);
    lines.push("---");
  });
  lines.push("拼接顺序：按镜号从 1 到 " + currentShots.length + " 依次把提示词粘贴到 AI 视频工具生成单镜片段（每镜 5–15 秒），全部生成后按镜号顺序拼接成片；相邻两镜可用首尾帧衔接。");
  copyText(lines.join("\n"), "整张分镜表已复制");
}
document.addEventListener("DOMContentLoaded", function () {
  loadTreeStory();
  renderTreeStory();
  renderLazyDirs();
  /* 模板库套用跳转过来时显示一次提示（阅后即焚，不常驻）。 */
  try {
    var tplNote = sessionStorage.getItem("prompttool_tpl_note");
    if (tplNote) { sessionStorage.removeItem("prompttool_tpl_note"); toast(tplNote); }
  } catch (e) {}
  document.getElementById("genBtn").onclick = buildStoryboard;
  document.getElementById("lazyBtn").onclick = runLazy;
  document.getElementById("fabGen").onclick = buildStoryboard;
  document.getElementById("copyAllBtn").onclick = copyWholeTable;
  document.getElementById("clearBtn").onclick = function () {
    storySelected = [];
    storyLastAdded = null;
    lazyDir = null;
    saveTreeStory();
    renderTreeStory();
    renderLazyDirs();
    toast("已清空已选词");
  };
});
