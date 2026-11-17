(function () {
    "use strict";
    var ATTR = {
        utm_source: "utm_source", utm_medium: "utm_medium", utm_campaign: "utm_campaign", utm_term: "utm_term", utm_content: "utm_content",
        gclid: "gclid", gbraid: "gbraid", wbraid: "wbraid", fbclid: "fbclid", msclkid: "msclkid", cid: "cid",
        utm_physical_location: "physical_location", loc_physical_ms: "physical_location",
        utm_tragetid: "target_id", utm_targetid: "target_id", targetid: "target_id",
        utm_target: "target", utm_placement: "placement", placement: "placement", utm_adposition: "ad_position", adposition: "ad_position",
        campaignid: "campaign_id", adgroupid: "adgroup_id", creative: "creative_id", matchtype: "match_type", network: "network",
        device: "ad_device", devicemodel: "device_model", loc_interest_ms: "interest_location", keyword: "keyword"
    };
    function getC(n) { var m = document.cookie.match(new RegExp("(?:^|; )" + n + "=([^;]*)")); return m ? m[1] : ""; }
    function setC(n, v) { document.cookie = n + "=" + v + "; Path=/; Secure; SameSite=Lax"; }
    function hex(n) {
        var a = new Uint8Array(n);
        (window.crypto || window.msCrypto).getRandomValues(a);
        var s = "";
        for (var i = 0; i < a.length; i++)
            s += ("0" + a[i].toString(16)).slice(-2);
        return s;
    }
    function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
    function clean(v, max) { return String(v == null ? "" : v).trim().slice(0, max || 255).replace(/[^\w\-.:,+ \/|@()\u00C0-\uFFFF]/g, ""); }
    function now() { return Math.floor(Date.now() / 1000); }
    try {
        var meta = document.querySelector('meta[name="hb-csrf"]');
        if (meta && !/^[0-9a-f]{32}$/.test(meta.getAttribute("content") || "")) {
            var t = getC("hb_tk");
            if (!/^[0-9a-f]{32}$/.test(t)) {
                t = hex(16);
                setC("hb_tk", t);
            }
            meta.setAttribute("content", t);
        }
    }
    catch (e) { }
    try {
        var hit = {}, n = 0, q = new URLSearchParams(location.search);
        q.forEach(function (v, k) { var key = ATTR[k.toLowerCase()]; if (key && v) {
            hit[key] = clean(v);
            n++;
        } });
        if (n) {
            hit.landing_url = clean(location.pathname, 500);
            hit.ts = now();
            var v = b64u(JSON.stringify(hit));
            if (v.length < 3000) {
                setC("hb_a", v);
                if (!getC("hb_a1"))
                    setC("hb_a1", v);
            }
        }
        if (!getC("hb_f")) {
            var f = b64u(JSON.stringify({ t: now(), r: String(document.referrer || "").slice(0, 500), l: (location.pathname + location.search).slice(0, 500) }));
            if (f.length < 3000)
                setC("hb_f", f);
        }
        setC("hb_v", String((parseInt(getC("hb_v"), 10) || 0) + 1));
    }
    catch (e) { }
    try {
        var dl = window.dataLayer = window.dataLayer || [];
        var cv = function () {
            var p = decodeURIComponent(getC("hb_cv")).split(".");
            return (p[0] === "form" || p[0] === "chat") ? { kind: p[0], id: String(p[1] || "").slice(0, 40) } : null;
        };
        var dropCv = function () { document.cookie = "hb_cv=; Path=/; Max-Age=0; Secure; SameSite=Lax"; };
        var thanksBox = function (brochure) {
            if (document.getElementById("hb-ty-box"))
                return;
            var box = document.createElement("div");
            box.id = "hb-ty-box";
            box.setAttribute("role", "dialog");
            box.setAttribute("aria-modal", "true");
            box.setAttribute("aria-labelledby", "hb-ty-h");
            box.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px";
            box.innerHTML = '<div style="background:#fff;border-radius:10px;max-width:420px;width:100%;padding:24px 20px;text-align:center;font-family:Roboto,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)">'
                + '<img src="/assets/img/thanks-icon.webp" alt="" width="80" height="80" style="display:inline-block">'
                + '<h2 id="hb-ty-h" style="font-size:22px;margin:12px 0 6px">Thank you!</h2>'
                + '<p style="margin:0 0 16px;color:#444">We have your details. Our expert will get in touch with you shortly.</p>'
                + (brochure ? '<p style="margin:0 0 12px"><a href="/brochure.php?f=brochure" target="_blank" rel="noopener" style="display:inline-block;padding:10px 18px;border-radius:6px;background:var(--colorPrimary,#b58728);color:#fff;text-decoration:none">Download Brochure</a></p>' : '')
                + '<button type="button" id="hb-ty-close" style="border:0;background:none;color:#555;text-decoration:underline;cursor:pointer;font-size:15px">Close</button></div>';
            var close = function () {
                if (box.parentNode)
                    box.parentNode.removeChild(box);
                var x = document.querySelector('.modal.show [data-dismiss="modal"], .modal.show [data-bs-dismiss="modal"], .modal.show .close, .modal.show .btn-close');
                if (x)
                    x.click();
            };
            box.addEventListener("click", function (e) { if (e.target === box)
                close(); });
            document.body.appendChild(box);
            document.getElementById("hb-ty-close").addEventListener("click", close);
        };
        var onHash = function () {
            var h = location.hash || "";
            if (h.indexOf("#enquiry-received") !== 0)
                return;
            var c = cv();
            if (h === "#enquiry-received-chat") {
                if (c && c.kind === "chat") {
                    dropCv();
                    dl.push({ event: "hbpushleads", lead_source: "chatbot", lead_id: c.id });
                    dl.push({ event: "hb_conversion", lead_source: "chatbot", lead_id: c.id });
                }
            }
            else {
                var show = function () { thanksBox(h === "#enquiry-received-brochure"); };
                if (document.body)
                    show();
                else
                    document.addEventListener("DOMContentLoaded", show);
            }
            try {
                history.replaceState(null, "", location.pathname + location.search);
            }
            catch (e) { }
        };
        if (/\/thank-you(\.html|\.php)?\/?$/.test(location.pathname)) {
            var c0 = cv();
            if (c0 && c0.kind === "form") {
                dropCv();
                dl.push({ event: "hb_conversion", lead_source: "web", lead_id: c0.id });
            }
            else {
                var d = new URLSearchParams(location.search).get("d") === "brochure" ? "-brochure" : "";
                location.replace("/#enquiry-received" + d);
            }
        }
        else {
            window.addEventListener("hashchange", onHash);
            onHash();
        }
    }
    catch (e) { }
})();
