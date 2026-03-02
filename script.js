!function() {
    /* --- 1. FACEBOOK PIXEL --- */
    var e, t, n, a, r, i = "script";
    e = window, t = document,
    e.fbq || (n = e.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }),
    e._fbq || (e._fbq = n), n.push = n, n.loaded = !0, n.version = "2.0", n.queue = [],
    (a = t.createElement(i)).async = !0, a.src = "https://connect.facebook.net/en_US/fbevents.js",
    (r = t.getElementsByTagName(i)[0]).parentNode.insertBefore(a, r);
    try {
        fbq("init", "2040714466673633"), fbq("track", "PageView")
    } catch (o) {}

    /* --- 2. SECURITY FUNCTIONS --- */
    function __getDeviceId() {
        return (navigator.userAgent + screen.width + screen.height + Intl.DateTimeFormat().resolvedOptions().timeZone);
    }

    function __getTodayKey() {
        return new Date().toDateString();
    }

    function __canOrderFromThisDevice() {
        const key = "__device_order__" + __getDeviceId() + "_" + __getTodayKey();
        if (localStorage.getItem(key)) {
            alert("দুঃখিত! একটি সমস্যা হয়েছে। অর্ডার করতে যোগাযোগ করুন 01874-002918");
            return false;
        }
        return true;
    }

    const __userActivity = { startTime: Date.now(), hasInteracted: false };
    ['mousemove', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
        window.addEventListener(evt, () => { __userActivity.hasInteracted = true; }, { once: true });
    });

    function __isHumanBehaviour() {
        if ((Date.now() - __userActivity.startTime) < 3000) return false;
        if (!__userActivity.hasInteracted) return false;
        return true;
    }

    /* --- 3. MAIN LOGIC --- */
    let s = {
        config: {
            basePrice: parseFloat(document.querySelector('meta[name="product-price"]')?.content || "0"),
            productName: document.querySelector('meta[name="product-name"]')?.content || "Unknown Product",
            productId: document.querySelector('meta[name="product-id"]')?.content || "unknown-id",
            web3formsUrl: "https://api.web3forms.com/submit",
            accessKey: "217e4dd0-d417-4429-bed2-933c54af4605"
        },
        variants: [],
        selectedVariant: null,

        init() {
            if (document.body.classList.contains("thank-you")) {
                this.handleThankYou();
                return
            }
            this.scanVariants(),
            this.variants.length || console.warn("No .product variants found."),
            this.selectedVariant = this.variants[0]?.color || null,
            this.syncHiddenInputs(),
            this.bindVariantClicks(),
            this.bindQuantityButtons(),
            this.bindFormSubmit(),
            this.startCountdown(),
            this.bindBackToTop(),
            this.bindShippingChange(),
            this.bindAddressChange(),
            this.trackViewContent(),
            this.updateSummary(),
            window.addEventListener("load", () => this.loadFontAwesome())
        },

        loadFontAwesome() {
            let e = document.createElement("link");
            e.rel = "stylesheet", e.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css", e.crossOrigin = "anonymous", e.referrerPolicy = "no-referrer", e.onload = () => {
                document.querySelectorAll(".icon-placeholder").forEach(e => {
                    e.parentElement.classList.contains("footer-phone-link") ? e.className = "fas fa-phone-alt" : e.parentElement.classList.contains("whatsapp-btn") ? e.className = "fab fa-whatsapp" : e.parentElement.href && e.parentElement.href.includes("privacy-policy") ? e.className = "fas fa-shield-alt" : e.parentElement.href && e.parentElement.href.includes("return-policy") ? e.className = "fas fa-undo" : e.parentElement.href && e.parentElement.href.includes("Contact-us") ? e.className = "fas fa-envelope" : "ac-delivery" === e.parentElement.htmlFor ? e.className = "fas fa-chevron-down" : "ac-details" === e.parentElement.htmlFor && (e.className = "fas fa-chevron-down")
                })
            }, document.head.appendChild(e)
        },

        scanVariants() {
            let e = Array.from(document.querySelectorAll(".product"));
            e.forEach(e => {
                let t = e.dataset.color || e.querySelector('input[type="radio"]')?.value || null;
                t || (t = (e.textContent || "").trim().split("\n")[0].trim().split(/\s+/)[0] || "Variant");
                let n = parseFloat(e.dataset.price ?? document.querySelector('meta[name="product-price"]')?.content ?? "0");
                if (!n) {
                    let a = e.querySelector("strong");
                    if (a) {
                        let r = (a.textContent || "").replace(/[^\d.]/g, "");
                        n = parseFloat(r || "0")
                    }
                }
                let i = e.querySelector(".qty") || null,
                    o = e.querySelector(".quantity") || null,
                    s = e.querySelector('input[type="radio"]') || null;
                i && !i.value && (i.value = "1");
                let l = parseFloat(e.dataset.deliveryDhaka || "0"),
                    c = parseFloat(e.dataset.deliveryOutside || "0");
                this.variants.push({
                    color: t,
                    price: Number.isFinite(n) ? n : 0,
                    el: e,
                    qtyInput: i,
                    qtyBox: o,
                    radioEl: s,
                    deliveryDhaka: l,
                    deliveryOutside: c
                }), i && i.setAttribute("aria-live", "polite")
            })
        },

        updateSummary() {
            if (!this.selectedVariant) return;
            let e = this.variants.find(e => e.color === this.selectedVariant);
            if (!e) return;
            let t = e.qtyInput ? parseInt(e.qtyInput.value || "1", 10) : 1,
                n = Number(e.price || this.config.basePrice || 0),
                a = n * t,
                r = 0,
                i = document.querySelector('input[name="shipping"]:checked');
            if (i) r = parseFloat(i.value || 0);
            else {
                let o = document.getElementById("address")?.value || "";
                null != e.deliveryDhaka && null != e.deliveryOutside && (o.includes("ঢাকা") || o.toLowerCase().includes("dhaka") ? r = e.deliveryDhaka : "" !== o.trim() && (r = e.deliveryOutside))
            }
            let s = a + r,
                l = document.getElementById("subtotal"),
                c = document.getElementById("total");
            l && (l.textContent = `৳${a.toLocaleString("bn-BD")}`), c && (c.textContent = `৳${s.toLocaleString("bn-BD")}`);
            let d = document.getElementById("hiddenSubtotal"),
                u = document.getElementById("hiddenTotal"),
                h = document.getElementById("hiddenProduct"),
                p = document.getElementById("hiddenQuantity");
            d && (d.value = a), u && (u.value = s), h && (h.value = `${this.config.productName} (${this.selectedVariant})`), p && (p.value = t)
        },

        bindVariantClicks() {
            this.variants.forEach(e => {
                e.el.addEventListener("click", t => {
                    let n = t.target;
                    n.closest(".btn-plus") || n.closest(".btn-minus") || this.selectVariant(e.color)
                }), e.radioEl && e.radioEl.addEventListener("change", () => {
                    e.radioEl.checked && this.selectVariant(e.color)
                })
            })
        },

        selectVariant(e) {
            this.selectedVariant = e, this.variants.forEach(t => {
                t.color === e ? (t.el.classList.add("selected"), t.el.setAttribute("aria-checked", "true"), t.qtyBox && t.qtyBox.classList.remove("hidden"), t.radioEl && (t.radioEl.checked = !0)) : (t.el.classList.remove("selected"), t.el.setAttribute("aria-checked", "false"), t.qtyBox && t.qtyBox.classList.add("hidden"))
            });
            try {
                "undefined" != typeof fbq && fbq("track", "AddToCart", {
                    content_name: `${this.config.productName} (${e})`,
                    content_category: "Product",
                    content_ids: [`${this.config.productId}-${e.toLowerCase().replace(/\s+/g,"-")}`],
                    content_type: "product",
                    value: this.variants.find(t => t.color === e)?.price || this.config.basePrice,
                    currency: "BDT"
                })
            } catch (t) {}
            this.updateSummary()
        },

        bindQuantityButtons() {
            this.variants.forEach(e => {
                let t = e.el.querySelector(".btn-plus"),
                    n = e.el.querySelector(".btn-minus");
                t && t.addEventListener("click", t => {
                    t.stopPropagation();
                    let n = e.qtyInput,
                        a = parseInt(n?.value || "1", 10);
                    n && (n.value = a + 1), this.selectedVariant === e.color && this.updateSummary()
                }), n && n.addEventListener("click", t => {
                    t.stopPropagation();
                    let n = e.qtyInput,
                        a = parseInt(n?.value || "1", 10);
                    n && (n.value = Math.max(1, a - 1)), this.selectedVariant === e.color && this.updateSummary()
                })
            })
        },

        bindAddressChange() {
            let e = document.getElementById("address");
            e && e.addEventListener("input", () => this.updateSummary())
        },

        bindShippingChange() {
            let e = document.querySelectorAll('input[name="shipping"]');
            e.forEach(e => e.addEventListener("change", () => this.updateSummary()))
        },

        bindFormSubmit() {
            let e = document.getElementById("order-form") || document.querySelector("form");
            e && e.addEventListener("submit", async t => {
                t.preventDefault();

                if (!__isHumanBehaviour()) { return; }
                if (!__canOrderFromThisDevice()) return;

                let n = document.getElementById("name")?.value || "",
                    a = document.getElementById("phone")?.value || "",
                    r = document.getElementById("address")?.value || "";

                // UPDATED REGEX
                if (!/^[a-zA-Z0-9\s.\-\u0980-\u09FF]+$/.test(n)) {
                    alert("নাম সঠিক নয়");
                    return
                }
                
                if (!/^(01[3-9]\d{8})$/.test(a)) {
                    alert("ফোন নাম্বার সঠিক নয় (১১ ডিজিট আবশ্যক)");
                    return
                }
                if (!r.trim()) {
                    alert("ঠিকানা ফাঁকা রাখা যাবে না");
                    return
                }

                this.updateSummary();
                let i = e.querySelector('[type="submit"]'),
                    o = e.querySelector(".spinner");
                i && (i.disabled = !0), o && (o.style.display = "inline");

                try {
                    let s = this.selectedVariant || this.variants[0]?.color || "Unknown",
                        l = this.variants.find(e => e.color === s),
                        c = l?.qtyInput?.value || "1",
                        d = l?.price || this.config.basePrice,
                        u = 0,
                        h = document.querySelector('input[name="shipping"]:checked');
                    h ? u = parseFloat(h.value || 0) : l?.deliveryDhaka != null && l?.deliveryOutside != null && (r.includes("ঢাকা") || r.toLowerCase().includes("dhaka") ? u = l.deliveryDhaka : "" !== r.trim() && (u = l.deliveryOutside));
                    let p = Number(d) * Number(c) + u,
                        m = `${this.config.productId}-${Date.now()}`;
                    localStorage.setItem("orderId", m), localStorage.setItem("productName", this.config.productName), localStorage.setItem("variant", s), localStorage.setItem("quantity", c), localStorage.setItem("totalPrice", p);
                    
                    try {
                        "undefined" != typeof fbq && fbq("track", "InitiateCheckout", {
                            content_name: `${this.config.productName} (${s})`,
                            content_category: "Product",
                            content_ids: [`${this.config.productId}-${s.toLowerCase().replace(/\s+/g,"-")}`],
                            content_type: "product",
                            value: p,
                            currency: "BDT",
                            num_items: Number(c)
                        })
                    } catch (y) {}

                    let f = new FormData(e);
                    f.get("access_key") || f.append("access_key", this.config.accessKey);

                    let v = await fetch(this.config.web3formsUrl, {
                        method: "POST",
                        body: f,
                        headers: { Accept: "application/json" }
                    });
                    if (!v.ok) throw Error(`HTTP ${v.status}`);
                    let g = await v.json();
                    
                    if (!g.success) throw Error(g.message || "Submission failed");

                    const lockKey = "__device_order__" + __getDeviceId() + "_" + __getTodayKey();
                    localStorage.setItem(lockKey, "true");

                    try {
                        "undefined" != typeof fbq && fbq("track", "Purchase", {
                            content_name: `${this.config.productName} (${s})`,
                            content_category: "Product",
                            content_ids: [`${this.config.productId}-${s.toLowerCase().replace(/\s+/g,"-")}`],
                            content_type: "product",
                            value: p,
                            currency: "BDT",
                            num_items: Number(c),
                            order_id: m
                        })
                    } catch (b) {}
                    
                    window.location.href = `https://phonerbazar.shop/thank-you.html?order_id=${m}&order_total=${p}&quantity=${c}&variant=${encodeURIComponent(s)}`
                } catch (E) {
                    console.error(E), alert("অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।\nত্রুটি: " + (E.message || E))
                } finally {
                    i && (i.disabled = !1), o && (o.style.display = "none")
                }
            })
        },

        syncHiddenInputs() {
            let e = document.getElementById("hiddenProduct"),
                t = document.getElementById("hiddenQuantity"),
                n = document.getElementById("hiddenSubtotal"),
                a = document.getElementById("hiddenTotal");
            if (!this.selectedVariant) return;
            let r = this.variants.find(e => e.color === this.selectedVariant);
            e && r && (e.value = `${this.config.productName} (${r.color})`), t && r && (t.value = r.qtyInput?.value || "1"), n && r && (n.value = r.price || this.config.basePrice), a && r && (a.value = r.price || this.config.basePrice)
        },
        startCountdown() {
            let e = document.getElementById("countdown");
            if (!e) return;
            let t = new Date;
            t.setHours(23, 59, 59, 999),
                function n() {
                    let a = new Date,
                        r = t - a;
                    if (r <= 0) {
                        e.textContent = "অফার শেষ!";
                        return
                    }
                    e.textContent = `সময় বাকি: ${Math.floor(r/36e5)} ঘণ্টা ${Math.floor(r%36e5/6e4)} মিনিট ${Math.floor(r%6e4/1e3)} সেকেন্ড`, setTimeout(n, 1e3)
                }()
        },
        bindBackToTop() {
            let e = document.getElementById("back-to-top");
            e && (e.addEventListener("click", () => window.scrollTo({
                top: 0,
                behavior: "smooth"
            })), window.addEventListener("scroll", () => {
                e.style.display = window.scrollY > 2.5 * window.innerHeight ? "block" : "none"
            }))
        },
        handleThankYou() {
            try {
                let e = new URLSearchParams(window.location.search),
                    t = parseFloat(e.get("order_total")) || localStorage.getItem("totalPrice") || this.config.basePrice,
                    n = e.get("order_id") || localStorage.getItem("orderId") || `${this.config.productId}-unknown`,
                    a = parseInt(e.get("quantity")) || localStorage.getItem("quantity") || 1,
                    r = e.get("variant") || localStorage.getItem("variant") || this.config.productName,
                    i = e => document.getElementById(e);
                i("order-id") && (i("order-id").textContent = n), i("product-name") && (i("product-name").textContent = this.config.productName), i("variant") && (i("variant").textContent = r), i("quantity") && (i("quantity").textContent = a), i("order-total") && (i("order-total").textContent = Number(t).toLocaleString("bn-BD"));
                try {
                    "undefined" != typeof fbq && fbq("track", "Purchase", {
                        content_name: r,
                        content_ids: [n],
                        value: t,
                        currency: "BDT",
                        num_items: a
                    })
                } catch (o) {}
            } catch (s) {
                console.warn(s)
            }
        },
        trackViewContent() {
            try {
                "undefined" != typeof fbq && fbq("track", "ViewContent", {
                    content_name: this.config.productName,
                    content_ids: [this.config.productId],
                    content_type: "product",
                    value: this.config.basePrice,
                    currency: "BDT"
                })
            } catch (e) {}
        }
    };

    let l = document.querySelector(".review-slider .slides"),
        c = document.querySelectorAll(".review-slider img"),
        d = 0,
        u = new IntersectionObserver((e, t) => {
            e.forEach(e => {
                if (e.isIntersecting) {
                    let n = e.target;
                    n.src = n.dataset.src, n.removeAttribute("data-src"), n.dataset.loaded = "true", t.unobserve(n)
                }
            })
        }, {
            threshold: .2,
            rootMargin: "200px"
        });
    c.forEach(e => u.observe(e)), document.querySelector(".review-slider .next") && document.querySelector(".review-slider .next").addEventListener("click", () => {
        d = (d + 1) % c.length, l.style.transform = `translateX(-${100*d}%)`
    }), document.querySelector(".review-slider .prev") && document.querySelector(".review-slider .prev").addEventListener("click", () => {
        d = (d - 1 + c.length) % c.length, l.style.transform = `translateX(-${100*d}%)`
    }), setInterval(() => {
        d = (d + 1) % c.length, l.style.transform = `translateX(-${100*d}%)`
    }, 4e3), document.addEventListener("DOMContentLoaded", () => s.init())
}();
