/* 词语树数据与共享逻辑：点开类目展开词条，点词即加入当前提示词。
   词条全部自写，电影术语用公开词条；不照搬任何现有产品界面文案。
   数据格式：每个词是字符串，或 [词, [关联词...]]（带 ▸ 可再展开一层）。 */
var WORD_TREE = [
{ id: "type", label: "类型", words: [
  ["浪漫", ["暗恋", "重逢", "离别", "思念", "心动", "表白"]],
  ["科幻", ["星舰", "时空", "机器人", "外星", "未来城市", "虚拟世界"]],
  ["悬疑", ["密室", "暗号", "跟踪", "反转", "失踪", "真相"]],
  ["治愈", ["慢生活", "和解", "陪伴", "重生", "归途", "暖阳"]],
  ["热血", ["拼搏", "逆袭", "赛场", "汗水", "呐喊", "坚持"]],
  "搞笑", "史诗", "奇幻", "现实", "复古", "赛博朋克", "田园", "都市", "武侠", "童话", "纪录", "温情", "励志", "冒险", "爱情", "家庭", "青春", "职场", "战争", "灾难", "惊悚", "文艺", "实验", "动画", "定格"
]},
{ id: "emotion", label: "情绪", words: [
  ["悲伤", ["心碎", "落泪", "雨夜", "离别", "独坐", "远行"]],
  ["痛苦", ["挣扎", "嘶吼", "蜷缩", "失眠", "崩溃", "忍耐"]],
  ["思念", ["旧信", "远方", "回望", "未寄出的信", "故乡", "重逢"]],
  ["孤独", ["空房", "长夜", "独行", "沉默", "背影", "灯下"]],
  ["喜悦", ["欢呼", "拥抱", "雀跃", "笑声", "庆祝", "释放"]],
  "暗恋", "重逢", "离别", "狂喜", "愤怒", "委屈", "恐惧", "不安", "寂寞", "希望", "绝望", "失落", "甜蜜", "温柔", "感动", "心碎", "落泪", "惆怅", "焦虑", "羞涩", "释然", "坚定", "迷茫", "怀念", "憧憬", "平静", "雀跃"
]},
{ id: "lens", label: "镜头方式", words: [
  ["微距", ["水珠", "花蕊", "眼睫", "指尖", "露珠", "纹理"]],
  ["长镜头", ["一镜到底", "跟随", "穿越", "长廊", "街道", "奔跑"]],
  ["航拍", ["俯瞰", "盘旋", "穿越云层", "追车", "山川", "城市"]],
  ["环绕", ["360度", "半圈", "贴身", "中心旋转", "人物环绕", "物体环绕"]],
  "特写", "广角", "慢推", "跟拍", "俯拍", "仰拍", "平视", "摇镜", "移镜", "变焦", "升降", "穿越", "手持", "稳定器", "第一人称", "过肩", "无人机环绕", "延时", "升格", "定格", "鱼眼", "移轴", "推轨", "摇臂", "空镜", "主观镜头", "客观镜头", "跳切"
]},
{ id: "shot", label: "景别", words: [
  ["特写", ["眼神", "手部", "信件", "钥匙", "雨滴", "嘴角"]],
  ["全景", ["街道", "山谷", "海岸", "城市", "田野", "广场"]],
  "大特写", "近景", "中近景", "中景", "中远景", "远景", "大远景", "半身像", "全身像", "头部特写", "手部特写", "眼部特写", "背影", "侧面像", "正面像", "过肩镜头", "双人镜头", "群像", "空镜头", "细节特写", "面部特写", "脚步特写", "环境全景", "七分身"
]},
{ id: "camera", label: "运镜", words: [
  ["推", ["慢推", "快推", "推向面部", "推向物品", "推向远方", "推向窗口"]],
  ["跟", ["跟跑", "跟走", "侧跟", "背跟", "贴身跟", "远跟"]],
  "拉", "摇", "移", "升", "降", "环绕", "变焦", "快拉", "横移", "纵移", "弧线", "环绕360", "穿越", "甩镜", "定格", "长镜头一镜到底", "跳切", "推轨", "摇臂", "升降机", "斯坦尼康", "肩扛", "旋转", "俯冲"
]},
{ id: "composition", label: "构图", words: [
  ["对称", ["建筑对称", "人物对称", "倒影对称", "门框对称", "镜像", "轴线"]],
  ["留白", ["天空留白", "雪地留白", "水面留白", "墙面留白", "雾中留白", "夜空留白"]],
  "三分法", "中心", "框架", "引导线", "对角线", "前景遮挡", "倒影", "剪影", "负空间", "黄金分割", "层次", "重复", "对比", "框中框", "斜线", "低角度", "俯视", "仰视", "九宫格", "S形", "三角形", "水平线", "垂直线"
]},
{ id: "light", label: "光线", words: [
  ["霓虹", ["粉蓝", "招牌", "雨夜倒影", "街灯", "橱窗", "光斑"]],
  ["逆光", ["剪影", "发丝光", "轮廓", "眩光", "尘埃", "光晕"]],
  "晨光", "夕阳", "侧光", "柔光", "硬光", "烛光", "月光", "雨夜灯光", "丁达尔", "轮廓光", "伦勃朗光", "顶光", "底光", "彩色光", "自然光", "暖调", "冷调", "体积光", "闪电", "篝火", "灯笼", "车灯", "橱窗", "晨雾光", "正午阳光", "黄昏余晖", "舞台光", "窗光"
]},
{ id: "color", label: "色彩", words: [
  ["暖黄", ["灯光", "麦田", "夕阳", "烛火", "旧纸", "秋叶"]],
  ["冷蓝", ["夜海", "月光", "冰雪", "屏幕", "清晨", "深海"]],
  "墨绿", "绯红", "鹅黄", "黛青", "米白", "曜黑", "粉白", "橙红", "紫罗兰", "青瓷", "鎏金", "银灰", "薄荷绿", "樱花粉", "落日橙", "深海蓝", "雾灰", "焦糖", "薄雾蓝", "蔷薇红", "松石绿", "琥珀", "象牙白", "赭石", "群青", "绛紫", "月白", "石榴红"
]},
{ id: "mood", label: "氛围", words: [
  ["浪漫", ["烛光", "花瓣", "晚风", "星空", "雨巷", "旧信"]],
  ["孤寂", ["空巷", "长夜", "独灯", "雪原", "远山", "空房"]],
  "梦幻", "压抑", "温馨", "史诗", "神秘", "惊悚", "治愈", "忧郁", "壮丽", "静谧", "喧闹", "苍凉", "空灵", "迷离", "沉重", "轻盈", "肃穆", "狂欢", "清新", "厚重", "飘渺", "紧张", "安详", "奇幻"
]},
{ id: "scene", label: "场景", words: [
  ["雨夜", ["霓虹", "积水", "雨伞", "巷口", "车灯", "窗影"]],
  ["海边", ["浪花", "沙滩", "落日", "礁石", "渔船", "灯塔"]],
  "老街", "火车站", "山顶", "森林", "沙漠", "雪原", "咖啡馆", "图书馆", "天台", "巷弄", "集市", "机场", "医院", "学校", "工厂", "田野", "花海", "星空", "湖畔", "古镇", "码头", "桥洞", "阁楼", "稻田", "竹林", "戈壁", "灯塔", "剧场"
]},
{ id: "person", label: "人物", words: [
  ["少女", ["白裙", "长发", "雨靴", "花篮", "旧书", "风筝"]],
  ["老人", ["白发", "皱纹", "老花镜", "藤椅", "旧照片", "烟斗"]],
  "少年", "旅人", "舞者", "画家", "厨师", "渔夫", "宇航员", "机器人", "猫", "犬", "孩童", "母亲", "恋人", "独行者", "守夜人", "卖花人", "船夫", "邮递员", "理发师", "铁匠", "教师", "医生", "农夫", "船长"
]},
{ id: "action", label: "动作", words: [
  ["回眸", ["含泪", "微笑", "雨中", "巷口", "站台", "转身"]],
  ["奔跑", ["雨中", "田野", "追车", "追风筝", "追落日", "追火车"]],
  "落泪", "拥抱", "挥手", "跳舞", "弹琴", "做饭", "放风筝", "追逐", "跌倒", "起身", "凝视", "转身", "伸手", "闭眼", "微笑", "跳跃", "下跪", "鞠躬", "眺望", "推门", "点灯", "写信", "撑伞", "远行"
]},
{ id: "element", label: "画面元素", words: [
  ["雨丝", ["斜织", "细密", "灯下", "窗外", "发梢", "伞面"]],
  ["花瓣", ["飘落", "铺路", "风中", "花雨", "指尖", "水面"]],
  "落叶", "气球", "风筝", "灯笼", "旧信", "火车", "钢琴", "雨伞", "镜子", "窗影", "炊烟", "星星", "萤火虫", "雪花", "泡泡", "纸船", "风铃", "老照片", "蒲公英", "贝壳", "钥匙", "蜡烛", "指南针", "沙漏"
]}
];

/* ---- 纯逻辑（不碰 DOM，可单测） ---- */
function normWord(w) {
  if (typeof w === "string") return { t: w, c: null };
  return { t: w[0], c: w[1] || null };
}
function catLabel(catId) {
  for (var i = 0; i < WORD_TREE.length; i++) {
    if (WORD_TREE[i].id === catId) return WORD_TREE[i].label;
  }
  return catId;
}
function treeStats() {
  return WORD_TREE.map(function (cat) {
    return { id: cat.id, label: cat.label, count: cat.words.length };
  });
}
function isSel(selected, catId, word) {
  return selected.some(function (s) { return s.cat === catId && s.word === word; });
}
function toggleSel(selected, catId, word) {
  for (var i = 0; i < selected.length; i++) {
    if (selected[i].cat === catId && selected[i].word === word) {
      selected.splice(i, 1);
      return selected;
    }
  }
  selected.push({ cat: catId, word: word });
  return selected;
}
function groupSelected(selected) {
  var parts = [];
  WORD_TREE.forEach(function (cat) {
    var ws = selected.filter(function (s) { return s.cat === cat.id; }).map(function (s) { return s.word; });
    if (ws.length) parts.push(cat.label + "：" + ws.join("、"));
  });
  return parts.join("；");
}
/* 分镜用：镜头类类目的词（镜头方式、运镜、景别、构图） */
var CAMERA_CATS = ["lens", "camera", "shot", "composition"];
function cameraWords(selected) {
  return selected.filter(function (s) { return CAMERA_CATS.indexOf(s.cat) >= 0; }).map(function (s) { return s.word; });
}
/* 运镜后缀用（以预览版为准）：镜头类词按词语树顺序（类目顺序＋类目内词表顺序，
   顶层词在前、其二层关联词紧随其后）、按词文本去重。 */
function cameraWordsOrdered(selected) {
  var out = [], seen = {};
  WORD_TREE.forEach(function (cat) {
    if (CAMERA_CATS.indexOf(cat.id) < 0) return;
    var ordered = [];
    cat.words.forEach(function (w) {
      var nw = normWord(w);
      ordered.push(nw.t);
      if (nw.c) nw.c.forEach(function (ch) { ordered.push(ch); });
    });
    ordered.forEach(function (wd) {
      if (!seen[wd] && selected.some(function (s) { return s.cat === cat.id && s.word === wd; })) { seen[wd] = true; out.push(wd); }
    });
  });
  return out;
}
function composePrompt(selected, extra) {
  var parts = [];
  var g = groupSelected(selected);
  if (g) parts.push(g);
  if (extra) parts.push("补充要求：" + extra);
  return parts.join("；") + (parts.length ? "。" : "");
}

/* ---- DOM 渲染：横向滑动卡片（一次只显示一个类目） ---- */
function renderTree(boxId, selected, onToggle) {
  var box = document.getElementById(boxId);
  if (!box) return;
  /* 展开状态、卡片内滚动位置、当前卡片序号都存在容器上，重渲染后保持 */
  box._expWords = box._expWords || {};
  box._deckScroll = box._deckScroll || {};
  var cur = (typeof box._deckIndex === "number") ? box._deckIndex : 0;
  if (cur < 0) cur = 0;
  if (cur >= WORD_TREE.length) cur = WORD_TREE.length - 1;
  box._deckIndex = cur;
  box.innerHTML = "";
  box.className = "deck";

  function selCount(catId) {
    var n = 0;
    for (var i = 0; i < selected.length; i++) if (selected[i].cat === catId) n++;
    return n;
  }
  /* 滑动刚结束 300ms 内忽略点击，避免一次滑动顺带点中词 */
  function guarded(fn) {
    return function () {
      if (Date.now() < (box._suppressClickUntil || 0)) return;
      fn();
    };
  }

  /* 类目标签条（横向可滑，点标签直接跳卡） */
  var tabs = document.createElement("div");
  tabs.className = "deck-tabs";
  var tabBtns = [];
  WORD_TREE.forEach(function (cat, idx) {
    var t = document.createElement("button");
    t.type = "button";
    t.className = "deck-tab" + (idx === cur ? " on" : "");
    var n = selCount(cat.id);
    t.textContent = cat.label + (n ? "（已选" + n + "）" : "");
    t.onclick = guarded(function () { goTo(idx); });
    tabs.appendChild(t);
    tabBtns.push(t);
  });
  box.appendChild(tabs);

  /* 卡片轨道 */
  var vp = document.createElement("div");
  vp.className = "deck-viewport";
  var track = document.createElement("div");
  track.className = "deck-track";
  var wordsDivs = [];
  WORD_TREE.forEach(function (cat, catIdx) {
    var card = document.createElement("div");
    card.className = "deck-card";
    var hd = document.createElement("div");
    hd.className = "deck-card-head";
    hd.textContent = cat.label + "（" + cat.words.length + "个词）";
    var sc = selCount(cat.id);
    if (sc) { var sp = document.createElement("span"); sp.className = "selcnt"; sp.textContent = "已选 " + sc; hd.appendChild(sp); }
    var pos = document.createElement("span"); pos.className = "deck-pos"; pos.textContent = (catIdx + 1) + " / " + WORD_TREE.length; hd.appendChild(pos);
    card.appendChild(hd);
    var wordsDiv = document.createElement("div");
    wordsDiv.className = "deck-words";
    wordsDiv.dataset.cat = cat.id;
    wordsDiv.onscroll = function () { box._deckScroll[cat.id] = wordsDiv.scrollTop; };
    cat.words.forEach(function (w) {
      var nw = normWord(w);
      var wrap = document.createElement("div");
      wrap.className = "wordwrap";
      var b = document.createElement("button");
      b.className = "word" + (isSel(selected, cat.id, nw.t) ? " on" : "");
      b.type = "button";
      b.textContent = nw.t;
      b.dataset.cat = cat.id;
      b.dataset.word = nw.t;
      b.onclick = guarded(function () { onToggle(cat.id, nw.t); });
      wrap.appendChild(b);
      wordsDiv.appendChild(wrap);
      if (nw.c) {
        var exp = document.createElement("button");
        exp.className = "expbtn";
        exp.type = "button";
        exp.textContent = box._expWords[cat.id + ":" + nw.t] ? "▾" : "▸";
        exp.title = "展开关联词";
        wrap.appendChild(exp);
        var childDiv = document.createElement("div");
        childDiv.className = "children";
        childDiv.style.display = box._expWords[cat.id + ":" + nw.t] ? "flex" : "none";
        nw.c.forEach(function (ch) {
          var cb = document.createElement("button");
          cb.className = "word childword" + (isSel(selected, cat.id, ch) ? " on" : "");
          cb.type = "button";
          cb.textContent = ch;
          cb.dataset.cat = cat.id;
          cb.dataset.word = ch;
          cb.onclick = guarded(function () { onToggle(cat.id, ch); });
          childDiv.appendChild(cb);
        });
        exp.onclick = guarded(function () {
          var show = childDiv.style.display === "none";
          childDiv.style.display = show ? "flex" : "none";
          exp.textContent = show ? "▾" : "▸";
          box._expWords[cat.id + ":" + nw.t] = show;
        });
        wordsDiv.appendChild(childDiv);
      }
    });
    card.appendChild(wordsDiv);
    track.appendChild(card);
    wordsDivs.push(wordsDiv);
  });
  vp.appendChild(track);
  box.appendChild(vp);

  /* 上一个 / 圆点 / 下一个 */
  var nav = document.createElement("div");
  nav.className = "deck-nav";
  var prev = document.createElement("button");
  prev.type = "button";
  prev.className = "secondary";
  prev.textContent = "‹ 上一个";
  prev.onclick = guarded(function () { goTo(box._deckIndex - 1); });
  var next = document.createElement("button");
  next.type = "button";
  next.className = "secondary";
  next.textContent = "下一个 ›";
  next.onclick = guarded(function () { goTo(box._deckIndex + 1); });
  var dots = document.createElement("div");
  dots.className = "deck-dots";
  var dotBtns = [];
  WORD_TREE.forEach(function (cat, idx) {
    var d = document.createElement("button");
    d.type = "button";
    d.className = "deck-dot" + (idx === cur ? " on" : "");
    d.title = cat.label;
    d.onclick = guarded(function () { goTo(idx); });
    dots.appendChild(d);
    dotBtns.push(d);
  });
  nav.appendChild(prev);
  nav.appendChild(dots);
  nav.appendChild(next);
  box.appendChild(nav);

  function refreshDeck(instant) {
    var i = box._deckIndex;
    if (instant) {
      track.style.transition = "none";
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      var _r = track.offsetWidth;
      track.style.transition = "";
    } else {
      track.style.transform = "translateX(-" + (i * 100) + "%)";
    }
    for (var k = 0; k < tabBtns.length; k++) {
      tabBtns[k].className = "deck-tab" + (k === i ? " on" : "");
      dotBtns[k].className = "deck-dot" + (k === i ? " on" : "");
    }
    prev.disabled = (i === 0);
    next.disabled = (i === WORD_TREE.length - 1);
    var activeTab = tabBtns[i];
    if (activeTab && activeTab.scrollIntoView) {
      try { activeTab.scrollIntoView({ inline: "center", block: "nearest" }); } catch (e) {}
    }
  }
  function goTo(idx) {
    if (idx < 0) idx = 0;
    if (idx >= WORD_TREE.length) idx = WORD_TREE.length - 1;
    box._deckIndex = idx;
    refreshDeck(false);
  }

  /* 滑动：手指左右滑、鼠标拖动都切卡；阈值 50px */
  var startX = null, dragging = false;
  vp.addEventListener("pointerdown", function (e) {
    startX = e.clientX;
    dragging = true;
  });
  vp.addEventListener("pointerup", function (e) {
    if (!dragging || startX === null) return;
    dragging = false;
    var dx = e.clientX - startX;
    startX = null;
    if (dx <= -50) {
      box._suppressClickUntil = Date.now() + 300;
      goTo(box._deckIndex + 1);
    } else if (dx >= 50) {
      box._suppressClickUntil = Date.now() + 300;
      goTo(box._deckIndex - 1);
    }
  });
  vp.addEventListener("pointercancel", function () {
    dragging = false;
    startX = null;
  });

  /* 初次定位不做滑动动画，并恢复各卡片内滚动位置 */
  refreshDeck(true);
  wordsDivs.forEach(function (wd) {
    if (box._deckScroll[wd.dataset.cat]) wd.scrollTop = box._deckScroll[wd.dataset.cat];
  });
}
function renderSelected(boxId, selected, onRemove) {
  var box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = "";
  if (!selected.length) {
    var p = document.createElement("p");
    p.className = "muted";
    p.textContent = "还没选词：点开上面任意类目，点词即加入。";
    box.appendChild(p);
    return;
  }
  var chips = document.createElement("div");
  chips.className = "selchips";
  selected.forEach(function (s) {
    var chip = document.createElement("span");
    chip.className = "selchip";
    chip.textContent = s.word + "（" + catLabel(s.cat) + "）";
    var x = document.createElement("button");
    x.type = "button";
    x.textContent = "×";
    x.title = "移除";
    x.onclick = function () { onRemove(s.cat, s.word); };
    chip.appendChild(x);
    chips.appendChild(chip);
  });
  box.appendChild(chips);
}
/* ---- 便捷功能：懒人搭配、跨类目搜索、快捷区、搭配推荐 ---- */
/* 懒人搭配规则：方向 → 各类目自动配齐的词（全部取自上面词表顶层词）。
   以预览版为准，每方向 7 个词；注意与旧版的区别：浪漫无暖调、悬疑无底光/曜黑
   （改用雾灰、留白）、治愈改用长镜头/薄荷绿/温馨/微笑、热血改用运镜跟与史诗、
   科幻改用神秘、搞笑改用喧闹。 */
var LAZY_RULES = {
  "浪漫": [
    { cat: "type", word: "浪漫" },
    { cat: "emotion", word: "温柔" },
    { cat: "lens", word: "慢推" },
    { cat: "shot", word: "近景" },
    { cat: "light", word: "柔光" },
    { cat: "color", word: "樱花粉" },
    { cat: "mood", word: "浪漫" }
  ],
  "悬疑": [
    { cat: "type", word: "悬疑" },
    { cat: "emotion", word: "不安" },
    { cat: "lens", word: "特写" },
    { cat: "light", word: "冷调" },
    { cat: "color", word: "雾灰" },
    { cat: "mood", word: "紧张" },
    { cat: "composition", word: "留白" }
  ],
  "治愈": [
    { cat: "type", word: "治愈" },
    { cat: "emotion", word: "平静" },
    { cat: "lens", word: "长镜头" },
    { cat: "light", word: "晨光" },
    { cat: "color", word: "薄荷绿" },
    { cat: "mood", word: "温馨" },
    { cat: "action", word: "微笑" }
  ],
  "热血": [
    { cat: "type", word: "热血" },
    { cat: "emotion", word: "坚定" },
    { cat: "lens", word: "跟拍" },
    { cat: "camera", word: "跟" },
    { cat: "light", word: "正午阳光" },
    { cat: "color", word: "橙红" },
    { cat: "mood", word: "史诗" }
  ],
  "科幻": [
    { cat: "type", word: "科幻" },
    { cat: "emotion", word: "憧憬" },
    { cat: "lens", word: "航拍" },
    { cat: "light", word: "霓虹" },
    { cat: "color", word: "冷蓝" },
    { cat: "mood", word: "神秘" },
    { cat: "scene", word: "星空" }
  ],
  "搞笑": [
    { cat: "type", word: "搞笑" },
    { cat: "emotion", word: "喜悦" },
    { cat: "lens", word: "跳切" },
    { cat: "light", word: "自然光" },
    { cat: "color", word: "鹅黄" },
    { cat: "mood", word: "喧闹" },
    { cat: "action", word: "跳舞" }
  ]
};
/* 搭配推荐规则（以预览版为准）：8 套，顺序敏感——命中时按顺序首个胜出。
   每套 = keys（触发关键词，含方向名与相关词）+ combo（该方向的搭配组合）。
   注意：同名不同类目的词是不同词（如类型|浪漫与氛围|浪漫），匹配只看词文本，
   但过滤时按类目|词去重；顺序改动会改变推荐结果。 */
var REC_SETS = [
  { name: "浪漫", keys: ["浪漫", "爱情", "恋爱", "暗恋", "重逢", "思念", "心动", "表白", "温柔", "甜蜜", "烛光", "花瓣"], combo: [
    { cat: "type", word: "浪漫" },
    { cat: "emotion", word: "温柔" },
    { cat: "lens", word: "慢推" },
    { cat: "shot", word: "近景" },
    { cat: "light", word: "柔光" },
    { cat: "color", word: "樱花粉" },
    { cat: "mood", word: "浪漫" }
  ] },
  { name: "悬疑", keys: ["悬疑", "推理", "失踪", "谜", "暗号", "跟踪", "反转", "不安", "紧张", "神秘"], combo: [
    { cat: "type", word: "悬疑" },
    { cat: "emotion", word: "不安" },
    { cat: "lens", word: "特写" },
    { cat: "light", word: "冷调" },
    { cat: "color", word: "雾灰" },
    { cat: "mood", word: "紧张" },
    { cat: "composition", word: "留白" }
  ] },
  { name: "治愈", keys: ["治愈", "温暖", "陪伴", "慢生活", "和解", "平静", "温馨", "微笑"], combo: [
    { cat: "type", word: "治愈" },
    { cat: "emotion", word: "平静" },
    { cat: "lens", word: "长镜头" },
    { cat: "light", word: "晨光" },
    { cat: "color", word: "薄荷绿" },
    { cat: "mood", word: "温馨" },
    { cat: "action", word: "微笑" }
  ] },
  { name: "热血", keys: ["热血", "比赛", "奋斗", "逆袭", "拼搏", "汗水", "坚定", "赛场"], combo: [
    { cat: "type", word: "热血" },
    { cat: "emotion", word: "坚定" },
    { cat: "lens", word: "跟拍" },
    { cat: "camera", word: "跟" },
    { cat: "light", word: "正午阳光" },
    { cat: "color", word: "橙红" },
    { cat: "mood", word: "史诗" }
  ] },
  { name: "科幻", keys: ["科幻", "未来", "机器人", "太空", "外星", "星舰", "时空", "憧憬", "神秘"], combo: [
    { cat: "type", word: "科幻" },
    { cat: "emotion", word: "憧憬" },
    { cat: "lens", word: "航拍" },
    { cat: "light", word: "霓虹" },
    { cat: "color", word: "冷蓝" },
    { cat: "mood", word: "神秘" },
    { cat: "scene", word: "星空" }
  ] },
  { name: "搞笑", keys: ["搞笑", "幽默", "沙雕", "喜悦", "喧闹", "欢笑"], combo: [
    { cat: "type", word: "搞笑" },
    { cat: "emotion", word: "喜悦" },
    { cat: "lens", word: "跳切" },
    { cat: "light", word: "自然光" },
    { cat: "color", word: "鹅黄" },
    { cat: "mood", word: "喧闹" },
    { cat: "action", word: "跳舞" }
  ] },
  { name: "悲伤", keys: ["悲伤", "痛苦", "心碎", "落泪", "孤独", "思念", "离别", "雨夜"], combo: [
    { cat: "emotion", word: "悲伤" },
    { cat: "scene", word: "雨夜" },
    { cat: "light", word: "冷调" },
    { cat: "color", word: "雾灰" },
    { cat: "mood", word: "孤寂" },
    { cat: "lens", word: "特写" }
  ] },
  { name: "梦幻", keys: ["梦幻", "星星", "星空", "紫罗兰"], combo: [
    { cat: "mood", word: "梦幻" },
    { cat: "color", word: "紫罗兰" },
    { cat: "light", word: "柔光" },
    { cat: "element", word: "星星" },
    { cat: "lens", word: "慢推" },
    { cat: "scene", word: "星空" }
  ] }
];
/* 懒人模式无方向兜底（以预览版为准，仅 5 词）。 */
var LAZY_GENERIC = [
  { cat: "lens", word: "慢推" },
  { cat: "shot", word: "中景" },
  { cat: "light", word: "柔光" },
  { cat: "color", word: "暖黄" },
  { cat: "mood", word: "温馨" }
];
/* 搭配推荐无命中兜底池（以预览版为准）：上面 5 词＋4 词，同样过滤后取前 6 个。 */
var REC_FALLBACK = LAZY_GENERIC.concat([
  { cat: "composition", word: "三分法" },
  { cat: "light", word: "侧光" },
  { cat: "color", word: "薄荷绿" },
  { cat: "emotion", word: "平静" }
]);
/* 懒人方向检测（以预览版为准）：两阶段——先按方向顺序匹配方向名，
   再按方向顺序匹配长度≥2 的关键词（取 REC_SETS 前 6 套的 keys），首个命中胜出。
   注意“神秘”同时在悬疑与科幻的关键词里，悬疑在前胜出；单字关键词（如“谜”）不参与匹配。
   悲伤/梦幻两套只用于搭配推荐，不用于方向检测。 */
var LAZY_DIR_ORDER = ["浪漫", "悬疑", "治愈", "热血", "科幻", "搞笑"];
function detectLazyDir(theme) {
  if (!theme) return null;
  for (var i = 0; i < LAZY_DIR_ORDER.length; i++) {
    if (theme.indexOf(LAZY_DIR_ORDER[i]) >= 0) return LAZY_DIR_ORDER[i];
  }
  for (var i = 0; i < LAZY_DIR_ORDER.length; i++) {
    var set = null;
    for (var k = 0; k < REC_SETS.length; k++) if (REC_SETS[k].name === LAZY_DIR_ORDER[i]) { set = REC_SETS[k]; break; }
    if (!set) continue;
    for (var j = 0; j < set.keys.length; j++) {
      if (set.keys[j].length >= 2 && theme.indexOf(set.keys[j]) >= 0) return LAZY_DIR_ORDER[i];
    }
  }
  return null;
}
/* 常用快捷区：跨类目高频词（与卡片同一份数据，状态互通）。
   以预览版为准，共 26 个，顺序与预览版一致；注意“浪漫”出现两次，
   分别是类型|浪漫与氛围|浪漫，键不同，不能合并。 */
var QUICK_WORDS = [
  { cat: "emotion", word: "温柔" },
  { cat: "emotion", word: "悲伤" },
  { cat: "emotion", word: "喜悦" },
  { cat: "emotion", word: "孤独" },
  { cat: "type", word: "浪漫" },
  { cat: "type", word: "治愈" },
  { cat: "type", word: "科幻" },
  { cat: "lens", word: "微距" },
  { cat: "lens", word: "长镜头" },
  { cat: "lens", word: "航拍" },
  { cat: "lens", word: "慢推" },
  { cat: "shot", word: "特写" },
  { cat: "shot", word: "全景" },
  { cat: "camera", word: "推" },
  { cat: "camera", word: "跟" },
  { cat: "camera", word: "环绕" },
  { cat: "light", word: "柔光" },
  { cat: "light", word: "逆光" },
  { cat: "light", word: "霓虹" },
  { cat: "light", word: "晨光" },
  { cat: "color", word: "暖黄" },
  { cat: "color", word: "冷蓝" },
  { cat: "color", word: "樱花粉" },
  { cat: "mood", word: "浪漫" },
  { cat: "mood", word: "梦幻" },
  { cat: "element", word: "雨丝" }
];
function wordExists(catId, word) {
  for (var i = 0; i < WORD_TREE.length; i++) {
    if (WORD_TREE[i].id !== catId) continue;
    for (var j = 0; j < WORD_TREE[i].words.length; j++) {
      var nw = normWord(WORD_TREE[i].words[j]);
      if (nw.t === word) return true;
      if (nw.c && nw.c.indexOf(word) >= 0) return true;
    }
  }
  return false;
}
function addIfAbsent(selected, catId, word) {
  if (!isSel(selected, catId, word)) selected.push({ cat: catId, word: word });
  return selected;
}
/* 搭配推荐（以预览版为准）：取最后一次点选加入的词作触发词；若该词已被移除则不显示。
   命中：触发词在某套的 keys 里，或等于该套 combo 里任一词，按 REC_SETS 顺序首个胜出。
   过滤：跳过与触发词同类目的全部词、跳过已选词、按类目|词去重；少于 2 个不显示，最多取 6 个。
   无命中时用 REC_FALLBACK 兜底池，同样过滤。返回 { title, list } 或 null。 */
function computeRecs(selected, lastAdded) {
  if (!lastAdded || !isSel(selected, lastAdded.cat, lastAdded.word)) return null;
  var set = null;
  for (var i = 0; i < REC_SETS.length; i++) {
    var s = REC_SETS[i];
    var hit = false;
    for (var k = 0; k < s.keys.length; k++) if (s.keys[k] === lastAdded.word) { hit = true; break; }
    if (!hit) for (var c = 0; c < s.combo.length; c++) if (s.combo[c].word === lastAdded.word) { hit = true; break; }
    if (hit) { set = s; break; }
  }
  var pool = set ? set.combo.slice() : REC_FALLBACK.slice();
  var seen = {};
  var out = [];
  pool.forEach(function (r) {
    if (r.cat === lastAdded.cat) return;
    var key = r.cat + "|" + r.word;
    if (seen[key]) return;
    seen[key] = true;
    if (isSel(selected, r.cat, r.word)) return;
    out.push(r);
  });
  if (out.length < 2) return null;
  return { title: set ? set.name : null, list: out.slice(0, 6) };
}
/* 跨类目搜索：匹配词本身、二层关联词，或类目名（如搜“镜头”出镜头方式全类）。 */
function searchTreeWords(q) {
  q = (q || "").trim();
  if (!q) return [];
  var out = [];
  WORD_TREE.forEach(function (cat) {
    var catHit = cat.label.indexOf(q) >= 0;
    cat.words.forEach(function (w) {
      var nw = normWord(w);
      if (catHit || nw.t.indexOf(q) >= 0) out.push({ cat: cat.id, label: cat.label, word: nw.t });
      if (nw.c) nw.c.forEach(function (ch) {
        if (catHit || ch.indexOf(q) >= 0) out.push({ cat: cat.id, label: cat.label, word: ch, parent: nw.t });
      });
    });
  });
  return out.slice(0, 80);
}
function renderSearchResults(inputId, resultsId, selected, onToggle) {
  var input = document.getElementById(inputId);
  var res = document.getElementById(resultsId);
  if (!input || !res) return;
  var q = (input.value || "").trim();
  res.innerHTML = "";
  if (!q) {
    var hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = "输入关键词，搜全部 13 个类目（含二层关联词），不用翻卡就能点词加入。";
    res.appendChild(hint);
    return;
  }
  var hits = searchTreeWords(q);
  if (!hits.length) {
    var none = document.createElement("p");
    none.className = "muted";
    none.textContent = "没找到“" + q + "”相关词，换个关键词试试（比如：雨夜、浪漫、微距）。";
    res.appendChild(none);
    return;
  }
  var groups = {};
  var order = [];
  hits.forEach(function (h) {
    if (!groups[h.label]) { groups[h.label] = []; order.push(h.label); }
    groups[h.label].push(h);
  });
  order.forEach(function (label) {
    var g = document.createElement("div");
    g.className = "search-group";
    var hd = document.createElement("div");
    hd.className = "search-group-head";
    hd.textContent = label;
    g.appendChild(hd);
    groups[label].forEach(function (h) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "word" + (isSel(selected, h.cat, h.word) ? " on" : "");
      b.textContent = h.parent ? h.word + "（" + h.parent + "）" : h.word;
      b.onclick = function () { onToggle(h.cat, h.word); };
      g.appendChild(b);
    });
    res.appendChild(g);
  });
}
/* 搜索框监听只绑一次；各页每次重渲染时再调 renderSearchResults 刷新已选状态。 */
function bindTreeSearch(inputId, resultsId, getSelected, onToggle) {
  var input = document.getElementById(inputId);
  if (!input || input._treeSearchBound) return;
  input._treeSearchBound = true;
  input.addEventListener("input", function () {
    renderSearchResults(inputId, resultsId, getSelected(), onToggle);
  });
}
function renderQuickZone(boxId, selected, onToggle) {
  var box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = "";
  QUICK_WORDS.forEach(function (qw) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "word" + (isSel(selected, qw.cat, qw.word) ? " on" : "");
    b.textContent = qw.word + "（" + catLabel(qw.cat) + "）";
    b.onclick = function () { onToggle(qw.cat, qw.word); };
    box.appendChild(b);
  });
}
function renderReco(boxId, selected, lastAdded, onAddOne, onAddAll) {
  var box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = "";
  var rec = computeRecs(selected, lastAdded);
  if (!rec) return;
  var list = rec.list;
  var wrap = document.createElement("div");
  wrap.className = "reco";
  var lab = document.createElement("span");
  lab.className = "reco-label";
  lab.textContent = rec.title ? "搭配推荐（与「" + rec.title + "」同方向）：" : "搭配推荐：";
  wrap.appendChild(lab);
  list.forEach(function (r) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "word recoword";
    b.textContent = r.word + "（" + catLabel(r.cat) + "）";
    b.onclick = function () { onAddOne(r.cat, r.word); };
    wrap.appendChild(b);
  });
  var all = document.createElement("button");
  all.type = "button";
  all.className = "green small";
  all.textContent = "＋ 全部加上";
  all.onclick = function () { onAddAll(list); };
  wrap.appendChild(all);
  box.appendChild(wrap);
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    WORD_TREE: WORD_TREE, normWord: normWord, catLabel: catLabel,
    treeStats: treeStats, isSel: isSel, toggleSel: toggleSel,
    groupSelected: groupSelected, cameraWords: cameraWords, composePrompt: composePrompt,
    LAZY_RULES: LAZY_RULES, REC_SETS: REC_SETS, LAZY_GENERIC: LAZY_GENERIC,
    REC_FALLBACK: REC_FALLBACK, LAZY_DIR_ORDER: LAZY_DIR_ORDER, detectLazyDir: detectLazyDir,
    QUICK_WORDS: QUICK_WORDS, wordExists: wordExists, addIfAbsent: addIfAbsent,
    computeRecs: computeRecs, cameraWordsOrdered: cameraWordsOrdered, searchTreeWords: searchTreeWords
  };
}
