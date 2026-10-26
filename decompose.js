/* 反向拆解替换：v1 用前端启发式预拆分（必须手动校对），另提供自带 key 调大模型拆解模式。 */
var DEC_FIELDS = ["主体", "画面", "风格", "景别", "构图", "光线", "氛围", "运镜", "色彩", "补充要求"];
var DEC_DICT = {
  "景别": ["特写", "大特写", "近景", "中景", "全景", "远景", "航拍"],
  "运镜": ["推近", "拉远", "环绕", "跟随", "平移", "摇镜", "固定机位", "手持", "升降", "俯瞰"],
  "光线": ["晨光", "黄昏", "暖阳", "霓虹", "柔光", "逆光", "阴天", "月光", "灯光", "阳光"],
  "氛围": ["治愈", "热血", "悬疑", "搞笑", "浪漫", "史诗", "温馨", "紧张", "宁静", "欢快"],
  "风格": ["电影感", "像素风", "手绘", "赛博", "纪录片", "动画", "写实", "水彩", "胶片"],
  "构图": ["三分法", "对称", "居中", "引导线", "留白", "框架", "对角线"],
  "色彩": ["暖色调", "冷色调", "高饱和", "低饱和", "黑白", "鲜艳", "柔和"]
};
var DEC_PRIORITY = ["景别", "运镜", "光线", "氛围", "风格", "构图", "色彩"];
var decState = {};
var decOriginal = "";
var decPrevSnapshot = null;

function renderDecFields() {
  var box = document.getElementById("decFields");
  box.innerHTML = "";
  DEC_FIELDS.forEach(function (f) {
    var row = document.createElement("div");
    row.className = "fieldrow";
    var lab = document.createElement("b");
    lab.textContent = f;
    row.appendChild(lab);
    var inp = document.createElement("input");
    inp.type = "text"; inp.id = "d_" + f;
    inp.value = decState[f] || "";
    inp.placeholder = f === "补充要求" ? "拆不出的内容都在这里，不会丢" : "";
    inp.oninput = function () { decState[f] = inp.value; };
    row.appendChild(inp);
    box.appendChild(row);
  });
}
function preSplit() {
  var raw = (document.getElementById("srcPrompt").value || "").trim();
  if (!raw) { toast("请先粘贴一段现成提示词"); return; }
  decOriginal = raw;
  decState = {};
  DEC_FIELDS.forEach(function (f) { decState[f] = ""; });
  var clauses = raw.split(/[，。；、！？\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  var firstDone = false;
  clauses.forEach(function (cl) {
    var hit = null;
    for (var i = 0; i < DEC_PRIORITY.length; i++) {
      var field = DEC_PRIORITY[i];
      if (DEC_DICT[field].some(function (kw) { return cl.indexOf(kw) >= 0; })) { hit = field; break; }
    }
    if (hit) {
      decState[hit] = decState[hit] ? decState[hit] + "，" + cl : cl;
    } else if (!firstDone) {
      decState["主体"] = cl;
      firstDone = true;
    } else {
      decState["补充要求"] = decState["补充要求"] ? decState["补充要求"] + "，" + cl : cl;
    }
  });
  renderDecFields();
  document.getElementById("decResult").style.display = "block";
  document.getElementById("decNote").textContent = "这是启发式预拆分（按关键词猜字段），请手动校对：一句里含多个关键词时可能被归到一处，拆错了请直接改对应格子；原文在下方对照区，不会丢。";
  toast("预拆分完成，请手动校对");
}
function regroup() {
  var parts = [];
  DEC_FIELDS.forEach(function (f) {
    var v = (decState[f] || "").trim();
    if (v) parts.push(f + "：" + v);
  });
  var out = parts.join("；") + (parts.length ? "。" : "");
  document.getElementById("regrouped").textContent = out || "（字段都空着，先拆分或填写）";
  var changed = [];
  if (decPrevSnapshot) {
    DEC_FIELDS.forEach(function (f) {
      if ((decState[f] || "") !== (decPrevSnapshot[f] || "")) changed.push(f);
    });
  }
  document.getElementById("changedNote").textContent = changed.length
    ? "本次相对上一次重组，只改了：" + changed.join("、") + "；其他字段原样不动。"
    : "字段相对上一次重组没有变化。";
  var snap = {};
  DEC_FIELDS.forEach(function (f) { snap[f] = decState[f] || ""; });
  decPrevSnapshot = snap;
  document.getElementById("regroupBox").style.display = "block";
  if (out) copyText(out, "重组后的提示词已复制");
}
function showOriginal() {
  document.getElementById("origBox").textContent = decOriginal || "（还没有原文，请先粘贴并预拆分）";
  document.getElementById("origWrap").style.display = "block";
}
function restoreOriginal() {
  if (!decOriginal) { toast("还没有原文"); return; }
  document.getElementById("srcPrompt").value = decOriginal;
  toast("已把原文放回粘贴框");
}
function saveLlmCfg() {
  try {
    localStorage.setItem("prompttool_llm", JSON.stringify({
      endpoint: document.getElementById("llmEndpoint").value,
      model: document.getElementById("llmModel").value,
      key: document.getElementById("llmKey").value
    }));
  } catch (e) {}
}
function loadLlmCfg() {
  try {
    var c = JSON.parse(localStorage.getItem("prompttool_llm") || "{}");
    if (c.endpoint) document.getElementById("llmEndpoint").value = c.endpoint;
    if (c.model) document.getElementById("llmModel").value = c.model;
    if (c.key) document.getElementById("llmKey").value = c.key;
  } catch (e) {}
}
function stripFences(s) {
  return s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
}
function llmSplit() {
  var raw = (document.getElementById("srcPrompt").value || "").trim();
  var endpoint = (document.getElementById("llmEndpoint").value || "").trim();
  var model = (document.getElementById("llmModel").value || "").trim();
  var key = (document.getElementById("llmKey").value || "").trim();
  var status = document.getElementById("llmStatus");
  if (!raw) { toast("请先粘贴一段现成提示词"); return; }
  if (!endpoint || !model || !key) { status.textContent = "请先填好接口地址、模型和 Key。"; return; }
  saveLlmCfg();
  status.textContent = "正在调用（浏览器直接向你填的接口地址发起请求，不经过本站服务器）…";
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
    body: JSON.stringify({
      model: model,
      temperature: 0,
      messages: [
        { role: "system", content: "把用户给的提示词按以下字段拆解成 JSON 对象，字段：主体、画面、风格、景别、构图、光线、氛围、运镜、色彩、补充要求。拆不出的内容一律放进补充要求，不要丢弃任何内容。只输出 JSON，不要解释。" },
        { role: "user", content: raw }
      ]
    })
  }).then(function (r) { return r.json(); })
    .then(function (j) {
      var content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!content) throw new Error("接口没有返回可用内容");
      var obj = JSON.parse(stripFences(content));
      decOriginal = raw;
      decState = {};
      DEC_FIELDS.forEach(function (f) { decState[f] = obj[f] ? String(obj[f]) : ""; });
      renderDecFields();
      document.getElementById("decResult").style.display = "block";
      document.getElementById("decNote").textContent = "这是大模型拆解的结果（准确版），仍建议你快速校对一遍再重组。";
      status.textContent = "大模型拆解完成。";
      toast("大模型拆解完成");
    })
    .catch(function (e) {
      status.textContent = "调用失败：" + e.message + "。可能是接口地址、模型或 Key 不对，也可能是对方接口不允许浏览器直接跨域调用；请检查后重试，或先用预拆分顶着。";
    });
}
document.addEventListener("DOMContentLoaded", function () {
  renderDecFields();
  loadLlmCfg();
  document.getElementById("splitBtn").onclick = preSplit;
  document.getElementById("regroupBtn").onclick = regroup;
  document.getElementById("origBtn").onclick = showOriginal;
  document.getElementById("restoreBtn").onclick = restoreOriginal;
  document.getElementById("llmBtn").onclick = llmSplit;
  ["llmEndpoint", "llmModel", "llmKey"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", saveLlmCfg);
  });
});
