/* Membership sign-up and phone key demo.
   Nothing is sent anywhere and no card is charged. The only thing saved
   (in this browser) is the new member's name, plan, member number and
   the last 4 digits of the test card, so the phone key can greet them. */
(function () {
  "use strict";

  var PLANS = [
    { id: "monthly", name: "Monthly", note: "24/7 access, month to month", price: 29, per: "/mo" }
  ];
  var KEY_FEE = 0; // the phone key replaces the chip fob, so there's no fob fee
  var STORE = "selah-fitness-demo-member", SESSION = "selah-fitness-demo-session";

  // For the walk-through: every step starts filled in with a sample member,
  // so you can just click Continue. Set to false to start with empty forms.
  var DEMO_FILL = true;
  var nextYear = String((new Date().getFullYear() + 2) % 100).padStart(2, "0");
  var SAMPLE_FILL = {
    first: "Alex", last: "Morgan", dob: "1990-06-15", phone: "(509) 555-0142", email: "alex.morgan@example.com", password: "Selah2026!",
    street: "210 W Naches Ave", city: "Selah", zip: "98942", ecName: "Jamie Morgan", ecPhone: "(509) 555-0177",
    h1: "No", h2: "No", h3: "No", sigName: "Alex Morgan",
    card: "4242 4242 4242 4242", exp: "12/" + nextYear, cvc: "123", cardName: "Alex Morgan"
  };

  /* ---------- tiny storage with an in-memory fallback ---------- */
  var mem = {};
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } }
  function load(k) { try { var s = localStorage.getItem(k); if (s) return JSON.parse(s); } catch (e) {} return mem[k] || null; }

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function money(n) { return "$" + n.toFixed(2); }
  function digits(s) { return (s || "").replace(/\D/g, ""); }
  // Demo only: the password is never saved, just a scrambled fingerprint of it.
  // A real site would check passwords on its server.
  function pwHash(email, pw) {
    var str = "selah247:" + email.toLowerCase() + ":" + pw, h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(36);
  }

  /* ============================================================
     MEMBERSHIP SIGN-UP
     ============================================================ */
  var dlg = $("#join"), form = $("#join-form");
  if (!dlg || !form) return;
  var step = 1, LAST = 5;
  var back = $("[data-join-back]"), next = $("[data-join-next]");

  // plans
  $("[data-plans]").innerHTML = PLANS.map(function (p, i) {
    return '<label class="plan"><input type="radio" name="plan" value="' + p.id + '"' + (i === 0 ? " checked" : "") + '>' +
      '<span><b>' + p.name + '</b><small>' + p.note + '</small></span>' +
      '<span class="price">$' + p.price + '<small>' + p.per + '</small></span></label>';
  }).join("");

  // today's date on the signature
  var today = new Date();
  $("[data-today]").textContent = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  function open() {
    reset();
    document.body.classList.add("modal-open");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    sizePad();
  }
  function close() {
    document.body.classList.remove("modal-open");
    if (typeof dlg.close === "function" && dlg.open) dlg.close(); else dlg.removeAttribute("open");
  }
  $$("[data-join]").forEach(function (b) { b.addEventListener("click", open); });
  $("[data-join-close]").addEventListener("click", close);
  dlg.addEventListener("cancel", function () { document.body.classList.remove("modal-open"); });
  dlg.addEventListener("close", function () { document.body.classList.remove("modal-open"); });

  function reset() {
    form.reset();
    $$(".bad", form).forEach(function (el) { el.classList.remove("bad"); });
    $$(".jerr", form).forEach(function (el) { el.textContent = ""; });
    clearPad();
    if (DEMO_FILL) {
      Object.keys(SAMPLE_FILL).forEach(function (k) { if (form[k]) form[k].value = SAMPLE_FILL[k]; });
      ["agreeMembership", "agreeWaiver", "agreeRules"].forEach(function (n) { form[n].checked = true; });
    }
    show(1);
  }

  function show(n) {
    step = n;
    $$(".jstep", form).forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
    $$(".join-steps li").forEach(function (li) {
      var d = +li.getAttribute("data-dot");
      li.classList.toggle("is-on", d === n);
      li.classList.toggle("is-done", d < n);
    });
    back.hidden = n === 1 || n === LAST;
    next.textContent = n === 4 ? "Pay " + money(total()) : n === LAST ? "Sign in to your key" : "Continue";
    if (n === 4) renderOrder();
    form.scrollTop = 0; dlg.scrollTop = 0;
    var h = $('.jstep[data-step="' + n + '"] h2', form); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    if (n === 3) { sizePad(); if (DEMO_FILL && !signed) sampleSignature(); }
  }

  function plan() { var v = (form.plan && form.plan.value) || "monthly"; return PLANS.filter(function (p) { return p.id === v; })[0]; }
  function total() { return plan().price + KEY_FEE; }
  function renderOrder() { var p = plan(); $("[data-order]").innerHTML = "<span>" + p.name + " membership</span><span>" + money(total()) + "</span>"; }

  function err(key, msg) { $('[data-err="' + key + '"]', form).textContent = msg || ""; }
  function mark(el, bad) { el.classList.toggle("bad", !!bad); return !bad; }

  /* ----- step checks ----- */
  function checkInfo() {
    var f = form, ok = true, msgs = [];
    ["first", "last", "street", "city", "ecName"].forEach(function (n) { if (!mark(f[n], !f[n].value.trim())) ok = false; });
    var dob = f.dob.value ? new Date(f.dob.value + "T00:00") : null, age = 0;
    if (dob) { age = today.getFullYear() - dob.getFullYear(); var m = today.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--; }
    if (!mark(f.dob, !dob || age < 0 || age > 110)) { ok = false; }
    else if (age < 16) { mark(f.dob, true); ok = false; msgs.push("Members must be 16 or older. Under 18 needs a parent to sign at the gym."); }
    if (!mark(f.phone, digits(f.phone.value).length !== 10)) { ok = false; msgs.push("Enter a 10-digit phone number."); }
    if (!mark(f.ecPhone, digits(f.ecPhone.value).length !== 10)) { ok = false; msgs.push("Enter a 10-digit emergency contact phone."); }
    if (!mark(f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()))) { ok = false; msgs.push("Enter a valid email."); }
    if (!mark(f.zip, !/^\d{5}$/.test(f.zip.value))) { ok = false; msgs.push("Enter a 5-digit ZIP."); }
    if (!mark(f.password, f.password.value.length < 8)) { ok = false; msgs.push("Create a password with 8 or more characters."); }
    err("info", ok ? "" : "Please fix the highlighted fields." + (msgs.length ? " " + msgs.join(" ") : ""));
    return ok;
  }

  function checkPaper() {
    var f = form, ok = true;
    ["agreeMembership", "agreeWaiver", "agreeRules"].forEach(function (n) { if (!mark(f[n].closest(".chk"), !f[n].checked)) ok = false; });
    ["h1", "h2", "h3"].forEach(function (n) { if (!mark(f[n], !f[n].value)) ok = false; });
    var full = (f.first.value.trim() + " " + f.last.value.trim()).toLowerCase().replace(/\s+/g, " ");
    var typed = f.sigName.value.trim().toLowerCase().replace(/\s+/g, " ");
    var nameOk = typed && typed === full;
    if (!mark(f.sigName, !nameOk)) ok = false;
    if (!mark(pad, !signed)) ok = false;
    var msg = "";
    if (!ok) {
      msg = "Please check each agreement, answer the health questions, and sign.";
      if (typed && !nameOk) msg += " The typed name must match the name you entered (" + f.first.value.trim() + " " + f.last.value.trim() + ").";
    }
    err("paper", msg);
    return ok;
  }

  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) { var d = +num[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
    return sum % 10 === 0;
  }
  function checkPay() {
    var f = form, ok = true, msgs = [];
    var num = digits(f.card.value);
    if (!mark(f.card, num.length < 13 || num.length > 19 || !luhn(num))) { ok = false; msgs.push("That card number isn't valid. Use the test card 4242 4242 4242 4242."); }
    var m = /^(\d{2})\/(\d{2})$/.exec(f.exp.value), expOk = false;
    if (m) { var mo = +m[1], yr = 2000 + +m[2]; expOk = mo >= 1 && mo <= 12 && new Date(yr, mo, 1) > today; }
    if (!mark(f.exp, !expOk)) { ok = false; msgs.push("Enter a future expiry date as MM/YY."); }
    if (!mark(f.cvc, !/^\d{3,4}$/.test(f.cvc.value))) { ok = false; msgs.push("Enter the 3 or 4 digit CVC."); }
    if (!mark(f.cardName, !f.cardName.value.trim())) { ok = false; msgs.push("Enter the name on the card."); }
    err("pay", msgs.join(" "));
    return ok;
  }

  // card + expiry formatting as you type
  form.card.addEventListener("input", function () { this.value = digits(this.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); });
  form.exp.addEventListener("input", function () { var d = digits(this.value).slice(0, 4); this.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; });
  form.cvc.addEventListener("input", function () { this.value = digits(this.value).slice(0, 4); });
  form.zip.addEventListener("input", function () { this.value = digits(this.value).slice(0, 5); });
  // clear a field's red outline once it's edited
  form.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("bad"); var c = e.target.closest && e.target.closest(".chk"); if (c) c.classList.remove("bad"); });
  form.addEventListener("change", function (e) { if (e.target.classList) e.target.classList.remove("bad"); var c = e.target.closest && e.target.closest(".chk"); if (c) c.classList.remove("bad"); });

  back.addEventListener("click", function () { if (step > 1) show(step - 1); });
  next.addEventListener("click", function () {
    if (step === 1) { show(2); return; }
    if (step === 2) { if (checkInfo()) { if (!form.cardName.value) form.cardName.value = form.first.value.trim() + " " + form.last.value.trim(); show(3); } return; }
    if (step === 3) { if (checkPaper()) show(4); return; }
    if (step === 4) { if (checkPay()) pay(); return; }
    if (step === LAST) { close(); openSignin(); }
  });

  function pay() {
    next.disabled = true; next.textContent = "Processing…";
    setTimeout(function () {
      next.disabled = false;
      var p = plan();
      var member = {
        name: form.first.value.trim() + " " + form.last.value.trim(),
        first: form.first.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        pw: pwHash(form.email.value.trim(), form.password.value),
        plan: p.name,
        id: "SF-" + String(Math.floor(1000 + Math.random() * 9000)),
        last4: digits(form.card.value).slice(-4),
        paid: money(total()),
        active: true,
        joined: new Date().toISOString()
      };
      save(STORE, member);
      save(SESSION, null); // new member signs in to use the key
      $("[data-mc-user]").textContent = member.email;
      $("[data-mc-name]").textContent = member.name;
      $("[data-mc-plan]").textContent = member.plan;
      $("[data-mc-id]").textContent = member.id;
      $("[data-mc-paid]").textContent = member.paid + " (card ending " + member.last4 + ")";
      setAccount(member);
      show(5);
    }, 900);
  }

  /* ----- signature pad ----- */
  var pad = $("[data-sig]"), ctx = pad.getContext("2d"), drawing = false, signed = false, last = null;
  function sizePad() {
    var r = pad.getBoundingClientRect(); if (!r.width) return;
    var ratio = window.devicePixelRatio || 1, w = Math.round(r.width * ratio), h = Math.round(r.height * ratio);
    if (pad.width === w && pad.height === h) return;
    pad.width = w; pad.height = h; signed = false;
  }
  // a pre-drawn signature for the demo (the member can clear it and sign themselves)
  function sampleSignature() {
    var w = pad.width, h = pad.height, r = window.devicePixelRatio || 1;
    ctx.strokeStyle = "#16181A"; ctx.lineWidth = 2.5 * r; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    for (var i = 0; i <= 60; i++) {
      var t = i / 60, x = w * (0.08 + t * 0.5), y = h * (0.6 - 0.22 * Math.sin(t * Math.PI * 5) * (1 - t * 0.4) - 0.08 * Math.sin(t * Math.PI));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.moveTo(w * 0.6, h * 0.62); ctx.bezierCurveTo(w * 0.66, h * 0.2, w * 0.7, h * 0.85, w * 0.78, h * 0.45);
    ctx.moveTo(w * 0.1, h * 0.78); ctx.lineTo(w * 0.8, h * 0.74);
    ctx.stroke();
    signed = true;
  }
  function clearPad() { ctx.clearRect(0, 0, pad.width, pad.height); signed = false; }
  function pt(e) { var r = pad.getBoundingClientRect(), s = pad.width / r.width; return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s }; }
  pad.addEventListener("pointerdown", function (e) { drawing = true; last = pt(e); if (pad.setPointerCapture) pad.setPointerCapture(e.pointerId); e.preventDefault(); });
  pad.addEventListener("pointermove", function (e) {
    if (!drawing) return; var p = pt(e);
    ctx.strokeStyle = "#16181A"; ctx.lineWidth = 2.5 * (window.devicePixelRatio || 1); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) > 0) { signed = true; pad.classList.remove("bad"); }
    last = p;
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (t) { pad.addEventListener(t, function () { drawing = false; }); });
  $("[data-sig-clear]").addEventListener("click", clearPad);
  window.addEventListener("resize", function () { if (step === 3 && !signed) sizePad(); });

  /* ============================================================
     SIGN IN + PHONE KEY
     ============================================================ */
  // Until someone signs up, the sample member (Alex Morgan) can sign in.
  var SAMPLE_ACCOUNT = { name: "Alex Morgan", first: "Alex", email: SAMPLE_FILL.email, pw: pwHash(SAMPLE_FILL.email, SAMPLE_FILL.password) };
  var account = load(STORE) || SAMPLE_ACCOUNT;
  if (!account.email || !account.pw) account = SAMPLE_ACCOUNT; // saved before sign-in existed

  var sdlg = $("#signin"), sform = $("#signin-form"), serr = $("[data-signin-err]");
  var keyOut = $("[data-key-out]"), keyIn = $("[data-key-in]");
  var nameEl = $("[data-key-name]"), lockBtn = $("[data-key-tap]"), lockText = $("[data-key-text]"), relock = null;

  function setAccount(m) { account = m; render(); }
  function signedIn() { var e = load(SESSION); return !!e && e === account.email; }

  function render() {
    var on = signedIn();
    keyOut.hidden = on; keyIn.hidden = !on;
    nameEl.textContent = "Hi, " + (account.first || account.name);
    $$(".nav-signin").forEach(function (b) { b.textContent = on ? "My key" : "Sign in"; });
    if (!on) lockReset();
  }

  function openSignin() {
    sform.reset(); serr.textContent = "";
    $$(".bad", sform).forEach(function (el) { mark(el, false); });
    sform.pass.type = "password"; $("[data-pw-show]").textContent = "Show";
    if (DEMO_FILL) { sform.user.value = account.email; sform.pass.value = SAMPLE_FILL.password; }
    document.body.classList.add("modal-open");
    if (typeof sdlg.showModal === "function") sdlg.showModal(); else sdlg.setAttribute("open", "");
  }
  function closeSignin() {
    document.body.classList.toggle("modal-open", false);
    if (typeof sdlg.close === "function" && sdlg.open) sdlg.close(); else sdlg.removeAttribute("open");
  }
  function goKey() { var k = document.getElementById("key"); if (k) k.scrollIntoView({ behavior: "smooth" }); }

  $$("[data-signin]").forEach(function (b) {
    b.addEventListener("click", function () { if (signedIn()) goKey(); else openSignin(); });
  });
  $("[data-signin-close]").addEventListener("click", closeSignin);
  sdlg.addEventListener("close", function () { document.body.classList.toggle("modal-open", false); });
  $("[data-signin-join]").addEventListener("click", function () { closeSignin(); open(); });
  $("[data-pw-show]").addEventListener("click", function () {
    var show = sform.pass.type === "password";
    sform.pass.type = show ? "text" : "password"; this.textContent = show ? "Hide" : "Show";
  });
  sform.addEventListener("input", function (e) { mark(e.target, false); serr.textContent = ""; });

  sform.addEventListener("submit", function (e) {
    e.preventDefault();
    var user = sform.user.value.trim().toLowerCase(), pass = sform.pass.value;
    mark(sform.user, !user); mark(sform.pass, !pass);
    if (!user || !pass) { serr.textContent = "Enter your email and password."; return; }
    if (user !== account.email) { mark(sform.user, true); serr.textContent = "We couldn't find a membership with that email."; return; }
    if (pwHash(user, pass) !== account.pw) { mark(sform.pass, true); serr.textContent = "That password isn't right. Try again."; sform.pass.select(); return; }
    save(SESSION, account.email);
    closeSignin(); render(); goKey();
  });

  $("[data-signout]").addEventListener("click", function () { save(SESSION, null); render(); });

  function lockReset() {
    clearTimeout(relock);
    lockBtn.classList.toggle("is-open", false);
    lockBtn.setAttribute("aria-label", "Unlock the front door");
    lockText.textContent = "Tap to unlock";
  }
  lockBtn.addEventListener("click", function () {
    if (!signedIn()) { render(); return; } // the key only works while signed in
    clearTimeout(relock);
    lockBtn.classList.add("is-open");
    lockBtn.setAttribute("aria-label", "Door unlocked");
    lockText.textContent = "Unlocked. Come on in!";
    relock = setTimeout(lockReset, 4000);
  });

  render();
})();
