/* Counters without cookies and without IP (BLD-A1).
   - device type: iOS / Android / desktop, guessed from the User-Agent, nothing else stored;
   - events go to GoatCounter as a simple pixel request (no cookies, no script from a third party);
   - if GOATCOUNTER_CODE is empty nothing is sent at all. */
(function (root) {
  function deviceType(ua) {
    ua = ua || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    // iPadOS 13+ reports itself as Mac; touch points tell it apart
    if (/Macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }
  function source() {
    try {
      var q = new URLSearchParams(location.search);
      var s = q.get("utm_source") || q.get("ref") || q.get("src");
      if (s) return s.replace(/[^a-z0-9_.-]/gi, "").slice(0, 40).toLowerCase();
      if (document.referrer) {
        var h = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (h && h !== location.hostname) return h.slice(0, 40);
      }
    } catch (e) {}
    return "direct";
  }
  function send(path, title, isEvent) {
    var cfg = root.BRC_CONFIG || {};
    if (!cfg.GOATCOUNTER_CODE) return false;
    var url = "https://" + cfg.GOATCOUNTER_CODE + ".goatcounter.com/count" +
      "?p=" + encodeURIComponent(path) +
      "&t=" + encodeURIComponent(title || path) +
      (isEvent ? "&e=true" : "") +
      "&rnd=" + Math.random().toString(36).slice(2);
    try { var img = new Image(); img.src = url; } catch (e) { return false; }
    return true;
  }
  var api = {
    deviceType: deviceType,
    device: function () { return deviceType(typeof navigator !== "undefined" ? navigator.userAgent : ""); },
    source: source,
    page: function (name) { return send("/" + name, name, false); },
    // event names: pay_click_basic, pay_click_extended, form_open_basic, ... + "-" + device
    event: function (name) { return send(name + "-" + api.device(), name, true); }
  };
  root.BRC = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
