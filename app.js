/* 共享逻辑：跳转目标 AI、复制、页脚声明。无后端、无上报。 */
var AI_TARGETS = [
  { name: "可灵", url: "https://klingai.com", note: "官网已核实" },
  { name: "即梦", url: "https://www.jimeng.com/", note: "官网已核实" },
  { name: "豆包", url: "https://www.doubao.com", note: "官网地址经搜索核实" },
  { name: "Veo（在 Gemini 应用内）", url: "https://gemini.google.com", note: "Veo 没有独立官网，在 Gemini 应用内使用" },
  { name: "通义万相", url: null, note: "官网当前入口未核实，本站不写死链接，请自行搜索“通义万相官网”" }
];

function toast(msg) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._h);
  t._h = setTimeout(function () { t.style.display = "none"; }, 2200);
}

function copyText(text, okMsg) {
  function done() { toast(okMsg || "已复制到剪贴板"); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
  } else { fallbackCopy(text); done(); }
}
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

/* 渲染跳转按钮：有核实地址的先复制再跳转；没核实的只复制，并注明。 */
function renderAiButtons(boxId, getPrompt) {
  var box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = "";
  AI_TARGETS.forEach(function (t) {
    var b = document.createElement("button");
    b.className = t.url ? "green" : "secondary";
    b.textContent = t.url ? "复制并前往" + t.name : "只复制（" + t.name + "地址未核实）";
    b.title = t.note;
    b.onclick = function () {
      var p = (getPrompt() || "").trim();
      if (!p) { toast("先生成内容，再跳转"); return; }
      copyText(p, "提示词已复制，正在打开" + t.name + "…");
      if (t.url) { setTimeout(function () { window.open(t.url, "_blank"); }, 350); }
    };
    box.appendChild(b);
  });
  var note = document.createElement("p");
  note.className = "muted";
  note.textContent = "说明：上方按钮会先把提示词复制到剪贴板，再打开对应 AI 的官网；通义万相因当前官网入口未核实，本站不写死链接，只复制不跳转。";
  box.appendChild(note);
}

function renderFooter() {
  var f = document.getElementById("footer");
  if (!f) return;
  f.innerHTML = "本站与可灵、即梦、豆包等 AI 官方无关；本站为独立工具站，仅提供提示词整理与分镜规划，不提供视频生成服务。<br>本站 v1 全部功能免费；高级功能以后再开。你的输入与选项只存在这台设备的浏览器 localStorage 里，不经过任何服务器。";
}
document.addEventListener("DOMContentLoaded", renderFooter);
