/* ============ 糖果工厂 — 逻辑 ============ */
"use strict";

const LINES = [
  { id:"shuffle",  name:"随机分组机", v:"v-pink",  desc:"名单丢进去，自动分成几组" },
  { id:"draw",     name:"抽号糖果机", v:"v-mint",  desc:"范围抽号，可设不重复" },
  { id:"timer",    name:"倒计时车间", v:"v-lemon", desc:"倒计时 / 正计时秒表" },
  { id:"pomo",     name:"番茄糖罐",   v:"v-berry", desc:"25 分钟专注 + 5 分钟休息" },
  { id:"round",    name:"圆整糖果秤", v:"v-pink",  desc:"任意精度四舍五入与取整" },
  { id:"coin",     name:"抛糖硬币",   v:"v-mint",  desc:"正反面连抛统计" },
];

/* ---------- 车间渲染 ---------- */
const floor = document.getElementById("factoryFloor");
LINES.forEach((l, i) => {
  const b = document.createElement("button");
  b.className = "iso " + l.v;
  b.innerHTML = `
    <span class="iso-no">LINE ${String(i + 1).padStart(2, "0")}</span>
    <span class="cube">
      <span class="face top"></span>
      <span class="face left"></span>
      <span class="face right"></span>
    </span>
    <span class="iso-label">
      <span class="nm">${l.name}</span>
      <span class="ds">${l.desc}</span>
    </span>`;
  b.addEventListener("click", () => openMachine(l));
  floor.appendChild(b);
});

/* ---------- 机器浮层 ---------- */
const machine = document.getElementById("machine");
const card = document.getElementById("machineCard");

function openMachine(l) {
  card.innerHTML = `
    <div class="mc-head"><h2>${l.name}</h2><button class="mc-close">✕</button></div>
    <div class="mc-body"></div>`;
  card.querySelector(".mc-close").addEventListener("click", closeMachine);
  RENDER[l.id](card.querySelector(".mc-body"));
  machine.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeMachine() {
  machine.hidden = true;
  document.body.style.overflow = "";
  clearInterval(machine._timer || 0);
}
machine.addEventListener("click", e => { if (e.target === machine) closeMachine(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !machine.hidden) closeMachine(); });

/* ---------- 控件工厂 ---------- */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
function field(box, text, input) {
  const f = el("div", "m-field");
  f.append(el("label", "", text), input);
  box.appendChild(f);
}
function mInput(val) {
  const i = el("input", "m-input");
  i.type = "text"; i.value = val;
  return i;
}
function mBtn(text, alt) { return el("button", "m-btn" + (alt ? " alt" : ""), text); }
function mOut(box) {
  const o = el("div", "m-out", "—");
  box.appendChild(o);
  return o;
}

const RENDER = {};

/* ---------- 随机分组机 ---------- */
RENDER.shuffle = box => {
  const ta = el("textarea", "m-textarea");
  ta.value = "小明\n小红\n小刚\n小丽\n小华\n小兰\n小军\n小芳";
  ta.placeholder = "一行一个名字";
  box.appendChild(el("label", "m-field", "")); // 占位风格忽略
  box.prepend(el("div", "m-field", `<label style="display:block;font-size:11px;letter-spacing:.2em;color:#b58fa8;margin-bottom:6px">名单（一行一个）</label>`));
  box.appendChild(ta);
  const row = el("div", "m-row");
  const groups = mInput("3");
  field(row, "分成几组", groups);
  const go = mBtn("开动流水线");
  row.appendChild(go);
  box.appendChild(row);
  const out = mOut(box);
  function run() {
    const names = ta.value.split("\n").map(s => s.trim()).filter(Boolean);
    const k = Math.max(1, parseInt(groups.value) || 1);
    if (!names.length) { out.textContent = "名单是空的"; return; }
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }
    const cols = Array.from({ length: Math.min(k, names.length) }, () => []);
    names.forEach((n, i) => cols[i % Math.min(k, names.length)].push(n));
    out.innerHTML = cols.map((g, i) =>
      `<div><span class="sweet">第 ${i + 1} 组</span>（${g.length} 人）：${g.join("、")}</div>`).join("");
  }
  go.addEventListener("click", run);
  run();
};

/* ---------- 抽号糖果机 ---------- */
RENDER.draw = box => {
  const row = el("div", "m-row");
  const from = mInput("1");
  const to = mInput("100");
  const cnt = mInput("5");
  field(row, "从", from);
  field(row, "到", to);
  field(row, "抽几个", cnt);
  box.appendChild(row);
  const bar = el("div", "m-row");
  const dup = el("label", "");
  dup.style.cssText = "display:flex;align-items:center;gap:6px;font-size:13px;flex:1;padding:9px 0";
  const ck = el("input");
  ck.type = "checkbox"; ck.checked = true;
  ck.style.accentColor = "#e85590";
  dup.append(ck, document.createTextNode("抽出的号不再重复"));
  const go = mBtn("摇一摇");
  bar.append(dup, go);
  box.appendChild(bar);
  const out = mOut(box);
  function draw() {
    const a = parseInt(from.value), b = parseInt(to.value);
    let n = parseInt(cnt.value);
    if (isNaN(a) || isNaN(b) || b < a || !(n > 0)) { out.textContent = "范围和数量要填对"; return; }
    const total = b - a + 1;
    if (ck.checked) n = Math.min(n, total);
    let res;
    if (ck.checked) {
      const pool = Array.from({ length: total }, (_, i) => a + i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      res = pool.slice(0, n);
    } else {
      res = Array.from({ length: n }, () => a + Math.floor(Math.random() * total));
    }
    out.innerHTML =
      `抽中：<span class="sweet">${res.join(" · ")}</span><br>` +
      `范围 ${a} ~ ${b}${ck.checked ? ` · 不重复` : ""}`;
  }
  go.addEventListener("click", draw);
  draw();
};

/* ---------- 倒计时 / 秒表 ---------- */
RENDER.timer = box => {
  const disp = el("div", "");
  disp.style.cssText =
    "font-size:52px;font-weight:bold;text-align:center;" +
    "font-variant-numeric:tabular-nums;color:#e85590;margin:8px 0 4px";
  disp.textContent = "00:00";
  box.appendChild(disp);
  const sub = el("p", "");
  sub.style.cssText = "text-align:center;font-size:11px;color:#b58fa8;letter-spacing:.2em;margin-bottom:16px";
  sub.textContent = "COUNTDOWN / STOPWATCH";
  box.appendChild(sub);
  const row = el("div", "m-row");
  const mm = mInput("5");
  const ss = mInput("0");
  field(row, "分钟", mm);
  field(row, "秒", ss);
  const down = mBtn("倒计时");
  const up = mBtn("秒表", true);
  row.append(down, up);
  box.appendChild(row);
  const out = mOut(box);
  const ctrl = el("div", "m-row");
  const pause = mBtn("暂停");
  const reset = mBtn("重置", true);
  ctrl.append(pause, reset);
  box.appendChild(ctrl);

  let mode = null, remain = 0, acc = 0, running = false, last = 0;
  const fmt = ms => {
    const t = Math.max(0, Math.ceil(ms / 10) / 100);
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    const cs = Math.floor((t * 100) % 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` +
      (mode === "up" ? `.${String(cs).padStart(2, "0")}` : "");
  };
  function loop() {
    if (!running) return;
    const now = performance.now();
    const dt = now - last;
    last = now;
    if (mode === "down") {
      remain -= dt;
      disp.textContent = fmt(remain);
      if (remain <= 0) {
        running = false;
        disp.textContent = "00:00";
        out.innerHTML = `<span class="sweet">时间到！🔔</span>`;
        return;
      }
    } else {
      acc += dt;
      disp.textContent = fmt(acc);
    }
    machine._timer = setTimeout(loop, 50);
  }
  down.addEventListener("click", () => {
    clearInterval(machine._timer);
    mode = "down"; running = true;
    remain = ((+mm.value || 0) * 60 + (+ss.value || 0)) * 1000;
    disp.textContent = fmt(remain);
    out.textContent = "倒计时进行中…";
    last = performance.now();
    loop();
  });
  up.addEventListener("click", () => {
    clearInterval(machine._timer);
    mode = "up"; running = true; acc = 0;
    disp.textContent = "00:00.00";
    out.textContent = "秒表计时中…";
    last = performance.now();
    loop();
  });
  pause.addEventListener("click", () => {
    if (!mode) return;
    if (running) { running = false; pause.textContent = "继续"; }
    else { running = true; pause.textContent = "暂停"; last = performance.now(); loop(); }
  });
  reset.addEventListener("click", () => {
    running = false; mode = null; acc = 0; remain = 0;
    disp.textContent = mode === "up" ? "00:00.00" : "00:00";
    disp.textContent = "00:00";
    out.textContent = "已重置";
  });
};

/* ---------- 番茄糖罐 ---------- */
RENDER.pomo = box => {
  const dot = el("div", "");
  dot.style.cssText =
    "width:130px;height:130px;border-radius:50%;margin:6px auto 14px;" +
    "background:radial-gradient(circle at 32% 28%,#ff9ec0,#e85590 70%);" +
    "display:grid;place-items:center;color:#fff;font-size:30px;font-weight:bold;" +
    "box-shadow:0 10px 24px rgba(232,85,144,.4);transition:all .3s";
  box.appendChild(dot);
  const disp = el("p", "");
  disp.style.cssText = "text-align:center;font-size:13px;color:#9a7d94;margin-bottom:16px";
  disp.textContent = "25:00 专注 · 点击开始";
  box.appendChild(disp);
  const row = el("div", "m-row");
  const focus = mInput("25");
  const rest = mInput("5");
  field(row, "专注（分钟）", focus);
  field(row, "休息（分钟）", rest);
  const start = mBtn("吃一颗番茄");
  row.appendChild(start);
  box.appendChild(row);
  const out = mOut(box);
  let phase = "focus", left = 0, running = false, timer = 0, done = 0;
  function render() {
    const m = Math.floor(left / 60), s = left % 60;
    dot.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    disp.textContent = (phase === "focus" ? "🍅 专注中" : "🍬 休息中") + (running ? "" : " · 已暂停");
    dot.style.background = phase === "focus"
      ? "radial-gradient(circle at 32% 28%,#ff9ec0,#e85590 70%)"
      : "radial-gradient(circle at 32% 28%,#7ee8e0,#2ba69e 70%)";
  }
  function tick() {
    left--;
    if (left <= 0) {
      if (phase === "focus") {
        done++;
        phase = "rest";
        left = (+rest.value || 5) * 60;
        out.innerHTML = `已完成 <span class="minty">${done}</span> 颗番茄 🍅，休息一下！`;
      } else {
        phase = "focus";
        left = (+focus.value || 25) * 60;
        out.innerHTML = `休息结束，第 <span class="sweet">${done + 1}</span> 颗番茄开始！`;
      }
    }
    render();
    if (running) machine._timer = setTimeout(tick, 1000);
  }
  start.addEventListener("click", () => {
    clearInterval(machine._timer);
    phase = "focus";
    left = (+focus.value || 25) * 60;
    running = true;
    out.textContent = "专注中…保持住！";
    render();
    machine._timer = setTimeout(tick, 1000);
  });
  dot.addEventListener("click", () => {
    if (!left) return;
    running = !running;
    if (running) { render(); machine._timer = setTimeout(tick, 1000); }
    else { clearInterval(machine._timer); render(); }
  });
  left = (+focus.value || 25) * 60;
  render();
};

/* ---------- 圆整糖果秤 ---------- */
RENDER.round = box => {
  const row = el("div", "m-row");
  const val = mInput("3.14159265");
  const prec = mInput("2");
  field(row, "数字", val);
  field(row, "保留小数位", prec);
  box.appendChild(row);
  const bar = el("div", "m-row");
  const b1 = mBtn("四舍五入");
  const b2 = mBtn("向上取整", true);
  const b3 = mBtn("向下取整", true);
  bar.append(b1, b2, b3);
  box.appendChild(bar);
  const out = mOut(box);
  function show(kind) {
    const v = parseFloat(val.value);
    const p = Math.max(0, Math.min(12, parseInt(prec.value) || 0));
    if (isNaN(v)) { out.textContent = "输入一个数字"; return; }
    const f = Math.pow(10, p);
    const r = kind === "round" ? Math.round(v * f) / f
            : kind === "ceil" ? Math.ceil(v * f) / f
            : Math.floor(v * f) / f;
    const names = { round:"四舍五入", ceil:"向上", floor:"向下" };
    out.innerHTML =
      `<span class="sweet">${r}</span>（${names[kind]}，保留 ${p} 位）<br>` +
      `原数：${v}<br>绝对整数化：${Math[kind === "round" ? "round" : kind](v)}`;
  }
  b1.addEventListener("click", () => show("round"));
  b2.addEventListener("click", () => show("ceil"));
  b3.addEventListener("click", () => show("floor"));
  show("round");
};

/* ---------- 抛糖硬币 ---------- */
RENDER.coin = box => {
  const face = el("div", "");
  face.style.cssText =
    "width:110px;height:110px;border-radius:50%;margin:6px auto 14px;" +
    "background:radial-gradient(circle at 32% 28%,#ffe98a,#e8b823 70%);" +
    "display:grid;place-items:center;font-size:38px;" +
    "box-shadow:0 8px 20px rgba(184,146,26,.4)";
  face.textContent = "?";
  box.appendChild(face);
  const row = el("div", "m-row");
  const times = mInput("10");
  field(row, "连抛次数（1~10000）", times);
  const go = mBtn("抛 糖");
  row.appendChild(go);
  box.appendChild(row);
  const out = mOut(box);
  function flip() {
    const n = Math.min(10000, Math.max(1, parseInt(times.value) || 1));
    let head = 0;
    const seq = [];
    for (let i = 0; i < n; i++) {
      const h = Math.random() < .5;
      if (h) head++;
      if (n <= 40) seq.push(h ? "正" : "反");
    }
    face.textContent = n === 1 ? (head ? "正" : "反") : "🪙";
    out.innerHTML =
      `正面 <span class="sweet">${head}</span> 次 · 反面 <span class="minty">${n - head}</span> 次<br>` +
      `正面比例 ${(head / n * 100).toFixed(1)}%（理论 50%）` +
      (seq.length ? `<br>逐次：${seq.join(" ")}` : "");
  }
  go.addEventListener("click", flip);
  flip();
};
