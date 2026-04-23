document.addEventListener("DOMContentLoaded", () => {
    // Menú hamburguesa
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mainNav = document.querySelector(".main-nav");

    if (hamburgerMenu && mainNav) {
        hamburgerMenu.addEventListener("click", () => {
            hamburgerMenu.classList.toggle("active");
            mainNav.classList.toggle("active");
        });

        document.querySelectorAll(".nav-list a").forEach((item) => {
            item.addEventListener("click", () => {
                if (window.innerWidth <= 767) {
                    hamburgerMenu.classList.remove("active");
                    mainNav.classList.remove("active");
                }
            });
        });
    }

    // Año dinámico
    const currentYearSpan = document.getElementById("current-year");
    if (currentYearSpan) currentYearSpan.textContent = String(new Date().getFullYear());

    // Fallback visual si faltan imágenes locales
    const placeholderSvg = encodeURI(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
            <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stop-color="#b8860b" stop-opacity="0.25"/>
                    <stop offset="1" stop-color="#2c2c2c" stop-opacity="0.12"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                  font-family="Montserrat, Arial" font-size="44" fill="#2c2c2c" opacity="0.75">
                Mangata &amp; Gallo
            </text>
        </svg>`
    );
    const placeholderUrl = `data:image/svg+xml;charset=utf-8,${placeholderSvg}`;

    document.querySelectorAll("img").forEach((img) => {
        img.addEventListener("error", () => {
            if (img.dataset.fallbackApplied === "true") return;
            img.dataset.fallbackApplied = "true";
            img.src = placeholderUrl;
        });
    });

    // Volver arriba
    const scrollTopBtn = document.getElementById("scroll-top");
    const updateScrollTop = () => {
        if (!scrollTopBtn) return;
        if (window.scrollY > 500) scrollTopBtn.classList.add("is-visible");
        else scrollTopBtn.classList.remove("is-visible");
    };
    updateScrollTop();
    window.addEventListener("scroll", updateScrollTop, { passive: true });
    if (scrollTopBtn) scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");

    const openLightbox = (imgEl) => {
        if (!lightbox || !lightboxImg || !imgEl) return;
        const src = imgEl.currentSrc || imgEl.src;
        if (!src) return;
        lightboxImg.src = src;
        lightboxImg.alt = imgEl.alt || "Imagen ampliada";
        if (lightboxCaption) lightboxCaption.textContent = imgEl.alt || "";
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        if (!lightbox || !lightboxImg) return;
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImg.src = "";
        document.body.style.overflow = "";
    };

    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            const target = e.target;
            if (target && target.getAttribute && target.getAttribute("data-close") === "true") closeLightbox();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox && lightbox.getAttribute("aria-hidden") === "false") closeLightbox();
    });
    document.querySelectorAll("img.zoomable").forEach((img) => img.addEventListener("click", () => openLightbox(img)));

    // Lookbook quick scroll buttons
    document.querySelectorAll("[data-scroll]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const sel = btn.getAttribute("data-scroll");
            if (!sel) return;
            const el = document.querySelector(sel);
            if (!el) return;
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    // Colecciones: filtro/búsqueda + favoritos
    const productsGrid = document.getElementById("products-grid");
    const searchInput = document.getElementById("collection-search");
    const filterSelect = document.getElementById("collection-filter");
    const favoritesOnly = document.getElementById("favorites-only");
    const sortSelect = document.getElementById("collection-sort");
    const emptyState = document.getElementById("collections-empty");
    const FAV_KEY = "mg_favorites_v1";
    const CART_KEY = "mg_cart_v1";
    const COMPARE_KEY = "mg_compare_v1";

    const PRODUCT_SPECS = {
        "Anillo Aurora": {
            material: "Oro 18k (opciones: amarillo, blanco, rosa)",
            piedra: "Diamante de origen ético",
            estilo: "Minimalista / Signature",
            uso: "Compromiso · Diario elegante",
        },
        "Anillo Eclipse": {
            material: "Oro 18k (opciones: amarillo, blanco)",
            piedra: "Zafiro / piedra protagonista",
            estilo: "Clásico con contraste",
            uso: "Compromiso · Evento",
        },
        "Anillo Bruma": {
            material: "Oro 18k",
            piedra: "Pavé de diamantes",
            estilo: "Delicado",
            uso: "Diario · Capas",
        },
        "Anillo Órbita": {
            material: "Oro 18k (opciones: amarillo, blanco)",
            piedra: "Esmeralda / piedra protagonista",
            estilo: "Contemporáneo",
            uso: "Evento · Statement",
        },
        "Anillo Senda": {
            material: "Oro 18k satinado",
            piedra: "—",
            estilo: "Alianza cómoda",
            uso: "Boda · Diario",
        },
        "Collar Luna": {
            material: "Oro 18k",
            piedra: "Perla / detalle brillante",
            estilo: "Clásico moderno",
            uso: "Regalo · Evento · Diario",
        },
        "Collar Aura": {
            material: "Oro 18k",
            piedra: "Colgante minimal",
            estilo: "Minimal / capas",
            uso: "Diario · Regalo",
        },
        "Collar Estrella": {
            material: "Oro 18k",
            piedra: "Detalle brillante",
            estilo: "Fino y luminoso",
            uso: "Evento · Regalo",
        },
        "Collar Bruma": {
            material: "Oro 18k",
            piedra: "—",
            estilo: "Cadena fina",
            uso: "Diario · Capas",
        },
        "Collar Nacar": {
            material: "Oro 18k",
            piedra: "Perla protagonista",
            estilo: "Clásico",
            uso: "Regalo · Evento",
        },
        "Pendientes Sol": {
            material: "Oro 18k",
            piedra: "Detalle brillante",
            estilo: "Versátil",
            uso: "Diario · Noche",
        },
        "Pendientes Brisa": {
            material: "Oro 18k",
            piedra: "Perla",
            estilo: "Clásico",
            uso: "Regalo · Diario",
        },
        "Pendientes Halo": {
            material: "Oro 18k",
            piedra: "—",
            estilo: "Aros modernos",
            uso: "Diario · Noche",
        },
        "Pendientes Aurora": {
            material: "Oro 18k",
            piedra: "Detalle brillante",
            estilo: "Evento",
            uso: "Noche · Celebración",
        },
        "Pendientes Nébula": {
            material: "Oro 18k con textura",
            piedra: "—",
            estilo: "Largos / Atelier",
            uso: "Evento · Noche",
        },
        "Pulsera Nébula": {
            material: "Oro 18k con textura artesanal",
            piedra: "—",
            estilo: "Edición limitada",
            uso: "Capas · Statement sutil",
        },
        "Pulsera Atlas": {
            material: "Oro 18k",
            piedra: "—",
            estilo: "Cadena fina",
            uso: "Diario · Capas",
        },
        "Pulsera Río": {
            material: "Oro 18k con textura orgánica",
            piedra: "—",
            estilo: "Atelier",
            uso: "Evento · Capas",
        },
        "Pulsera Alba": {
            material: "Oro 18k pulido",
            piedra: "—",
            estilo: "Brazalete",
            uso: "Diario · Evento",
        },
        "Pulsera Halo": {
            material: "Oro 18k",
            piedra: "—",
            estilo: "Charm sutil",
            uso: "Regalo · Diario",
        },
    };

    const getJsonArray = (key) => {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const setJsonArray = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // ignore
        }
    };

    const uniq = (arr) => Array.from(new Set(arr));

    const getFavorites = () => {
        try {
            const raw = localStorage.getItem(FAV_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return new Set(Array.isArray(parsed) ? parsed : []);
        } catch {
            return new Set();
        }
    };

    const setFavorites = (favSet) => {
        try {
            localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favSet)));
        } catch {
            // ignore
        }
    };

    let favorites = getFavorites();
    // Carrito: ahora guarda cantidades. Compatibilidad con versión anterior (array).
    const getCartObject = () => {
        try {
            const raw = localStorage.getItem(CART_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            if (Array.isArray(parsed)) {
                const obj = {};
                parsed.forEach((t) => {
                    if (!t) return;
                    obj[t] = (obj[t] || 0) + 1;
                });
                return obj;
            }
            if (parsed && typeof parsed === "object") return parsed;
            return {};
        } catch {
            return {};
        }
    };

    const setCartObject = (obj) => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(obj));
        } catch {
            // ignore
        }
    };

    let cart = getCartObject();
    let compare = getJsonArray(COMPARE_KEY);

    const cartCountEl = document.getElementById("cart-count");
    const compareCountEl = document.getElementById("compare-count");
    const openCartBtn = document.getElementById("open-cart");
    const openCompareBtn = document.getElementById("open-compare");

    const cartDrawer = document.getElementById("cart-drawer");
    const cartItemsEl = document.getElementById("cart-items");
    const cartEmptyEl = document.getElementById("cart-empty");
    const cartClearBtn = document.getElementById("cart-clear");
    const cartWhatsapp = document.getElementById("cart-whatsapp");
    const cartEmail = document.getElementById("cart-email");

    const compareDrawer = document.getElementById("compare-drawer");
    const compareItemsEl = document.getElementById("compare-items");
    const compareEmptyEl = document.getElementById("compare-empty");
    const compareClearBtn = document.getElementById("compare-clear");

    const productModal = document.getElementById("product-modal");
    const productModalTitle = document.getElementById("product-modal-title");
    const productModalImg = document.getElementById("product-modal-img");
    const productModalDesc = document.getElementById("product-modal-desc");
    const productModalSpecs = document.getElementById("product-modal-specs");
    const productModalAdd = document.getElementById("product-modal-add");
    const productModalCompare = document.getElementById("product-modal-compare");

    let activeProductTitle = "";
    let activeProductImg = "";
    let activeProductDesc = "";

    const openOverlay = (el) => {
        if (!el) return;
        el.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };
    const closeOverlay = (el) => {
        if (!el) return;
        el.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    const wireOverlayClose = (el) => {
        if (!el) return;
        el.addEventListener("click", (e) => {
            const t = e.target;
            if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeOverlay(el);
        });
    };

    wireOverlayClose(cartDrawer);
    wireOverlayClose(compareDrawer);
    wireOverlayClose(productModal);

    const cartTotalCount = () => Object.values(cart).reduce((acc, n) => acc + (Number(n) || 0), 0);

    const updateCounts = () => {
        if (cartCountEl) cartCountEl.textContent = String(cartTotalCount());
        if (compareCountEl) compareCountEl.textContent = String(compare.length);
    };

    const buildRequestText = () => {
        const entries = Object.entries(cart).filter(([, qty]) => (Number(qty) || 0) > 0);
        const lines = entries.map(([t, qty], i) => `${i + 1}. ${t} (x${qty})`);
        return `Hola Mangata & Gallo, me interesa esta selección:%0A%0A${lines.join("%0A")}%0A%0A¿Podemos agendar una consulta?`;
    };

    const renderCart = () => {
        if (!cartItemsEl || !cartEmptyEl) return;
        cartItemsEl.innerHTML = "";
        const entries = Object.entries(cart).filter(([, qty]) => (Number(qty) || 0) > 0);
        if (entries.length === 0) {
            cartEmptyEl.style.display = "";
        } else {
            cartEmptyEl.style.display = "none";
            entries.forEach(([title, qty]) => {
                const row = document.createElement("div");
                row.className = "drawer-row";
                row.innerHTML = `
                    <div class="drawer-row-title">${title}</div>
                    <div class="drawer-qty" aria-label="Cantidad">
                        <button class="drawer-qty-btn" type="button" data-qty-dec="${title}" aria-label="Disminuir">−</button>
                        <span class="drawer-qty-value" aria-label="Cantidad actual">${qty}</span>
                        <button class="drawer-qty-btn" type="button" data-qty-inc="${title}" aria-label="Aumentar">+</button>
                    </div>
                    <button class="drawer-row-remove" type="button" data-remove="${title}" aria-label="Quitar">×</button>
                `;
                cartItemsEl.appendChild(row);
            });
        }

        const msg = buildRequestText();
        if (cartWhatsapp) cartWhatsapp.href = `https://wa.me/15125550123?text=${msg}`;
        if (cartEmail) cartEmail.href = `mailto:appointments@mangatagallo.com?subject=${encodeURIComponent("Solicitud de selección")}&body=${decodeURIComponent(msg)}`;
    };

    const renderCompare = () => {
        if (!compareItemsEl || !compareEmptyEl) return;
        compareItemsEl.innerHTML = "";
        if (compare.length === 0) {
            compareEmptyEl.style.display = "";
        } else {
            compareEmptyEl.style.display = "none";
            compare.forEach((title) => {
                const specs = PRODUCT_SPECS[title] || {};
                const row = document.createElement("div");
                row.className = "compare-card";
                row.innerHTML = `
                    <div class="compare-title">${title}</div>
                    <ul class="compare-specs">
                        <li><strong>Material:</strong> ${specs.material || "—"}</li>
                        <li><strong>Piedra:</strong> ${specs.piedra || "—"}</li>
                        <li><strong>Estilo:</strong> ${specs.estilo || "—"}</li>
                        <li><strong>Uso:</strong> ${specs.uso || "—"}</li>
                    </ul>
                    <button class="btn-mini" type="button" data-compare-remove="${title}">Quitar</button>
                `;
                compareItemsEl.appendChild(row);
            });
        }
    };

    const addToCart = (title, amount = 1) => {
        const next = { ...cart };
        next[title] = (Number(next[title]) || 0) + amount;
        if (next[title] <= 0) delete next[title];
        cart = next;
        setCartObject(cart);
        updateCounts();
        renderCart();
    };

    const removeFromCart = (title) => {
        const next = { ...cart };
        delete next[title];
        cart = next;
        setCartObject(cart);
        updateCounts();
        renderCart();
    };

    const toggleCompare = (title) => {
        const exists = compare.includes(title);
        if (exists) compare = compare.filter((t) => t !== title);
        else compare = uniq([...compare, title]).slice(0, 3);
        setJsonArray(COMPARE_KEY, compare);
        updateCounts();
        renderCompare();
    };

    const clearCompare = () => {
        compare = [];
        setJsonArray(COMPARE_KEY, compare);
        updateCounts();
        renderCompare();
    };

    const clearCart = () => {
        cart = {};
        setCartObject(cart);
        updateCounts();
        renderCart();
    };

    const syncFavButtons = () => {
        document.querySelectorAll(".product-card").forEach((card) => {
            const title = card.getAttribute("data-title") || "";
            const btn = card.querySelector(".product-fav");
            if (!btn) return;
            btn.setAttribute("aria-pressed", String(favorites.has(title)));
        });
    };

    const applyProductsFilter = () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        const category = filterSelect?.value || "all";
        const onlyFavs = Boolean(favoritesOnly?.checked);
        const sortMode = sortSelect?.value || "relevance";
        let visibleCount = 0;

        const cards = Array.from(document.querySelectorAll(".product-card"));

        // Ordena el grid (sin perder listeners, solo reordena nodos)
        if (productsGrid && sortMode !== "relevance") {
            const sorted = [...cards].sort((a, b) => {
                const ta = (a.getAttribute("data-title") || "").toLowerCase();
                const tb = (b.getAttribute("data-title") || "").toLowerCase();
                return sortMode === "az" ? ta.localeCompare(tb) : tb.localeCompare(ta);
            });
            sorted.forEach((c) => productsGrid.appendChild(c));
        }

        Array.from(document.querySelectorAll(".product-card")).forEach((card) => {
            const cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
            const title = (card.getAttribute("data-title") || "").toLowerCase();
            const tags = (card.getAttribute("data-tags") || "").toLowerCase();

            const categoryOk = category === "all" || cardCategory === category;
            const queryOk = !query || title.includes(query) || tags.includes(query);
            const favOk = !onlyFavs || favorites.has(card.getAttribute("data-title") || "");
            const visible = categoryOk && queryOk && favOk;

            card.style.display = visible ? "" : "none";
            if (visible) visibleCount += 1;
        });

        if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    if (productsGrid) {
        productsGrid.addEventListener("click", (e) => {
            const target = e.target;

            const favBtn = target?.closest?.(".product-fav");
            if (favBtn) {
                const card = favBtn.closest(".product-card");
                const title = card?.getAttribute("data-title") || "";
                if (!title) return;
                if (favorites.has(title)) favorites.delete(title);
                else favorites.add(title);
                setFavorites(favorites);
                syncFavButtons();
                return;
            }

            const imgBtn = target?.closest?.(".product-image-btn");
            if (imgBtn) {
                const img = imgBtn.querySelector("img");
                if (img) openLightbox(img);
            }

            const actionBtn = target?.closest?.("[data-action]");
            if (actionBtn) {
                const action = actionBtn.getAttribute("data-action");
                const card = actionBtn.closest(".product-card");
                const title = card?.getAttribute("data-title") || "";
                const desc = card?.querySelector(".product-desc")?.textContent || "";
                const img = card?.querySelector("img")?.getAttribute("src") || "";
                if (!title) return;

                if (action === "add") {
                    addToCart(title);
                    openOverlay(cartDrawer);
                    return;
                }
                if (action === "compare") {
                    toggleCompare(title);
                    openOverlay(compareDrawer);
                    return;
                }
                if (action === "details") {
                    activeProductTitle = title;
                    activeProductDesc = desc;
                    activeProductImg = img;

                    if (productModalTitle) productModalTitle.textContent = title;
                    if (productModalImg) {
                        productModalImg.src = img || "";
                        productModalImg.alt = title;
                    }
                    if (productModalDesc) productModalDesc.textContent = desc;
                    if (productModalSpecs) {
                        const specs = PRODUCT_SPECS[title] || {};
                        productModalSpecs.innerHTML = `
                            <li><strong>Material:</strong> ${specs.material || "—"}</li>
                            <li><strong>Piedra:</strong> ${specs.piedra || "—"}</li>
                            <li><strong>Estilo:</strong> ${specs.estilo || "—"}</li>
                            <li><strong>Uso:</strong> ${specs.uso || "—"}</li>
                        `;
                    }
                    openOverlay(productModal);
                }
            }
        });
    }

    searchInput?.addEventListener("input", applyProductsFilter);
    filterSelect?.addEventListener("change", applyProductsFilter);
    favoritesOnly?.addEventListener("change", applyProductsFilter);
    sortSelect?.addEventListener("change", applyProductsFilter);
    syncFavButtons();
    applyProductsFilter();

    updateCounts();
    renderCart();
    renderCompare();

    openCartBtn?.addEventListener("click", () => openOverlay(cartDrawer));
    openCompareBtn?.addEventListener("click", () => openOverlay(compareDrawer));

    cartClearBtn?.addEventListener("click", clearCart);
    compareClearBtn?.addEventListener("click", clearCompare);

    cartItemsEl?.addEventListener("click", (e) => {
        const t = e.target;
        const title = t?.getAttribute?.("data-remove");
        if (title) removeFromCart(title);

        const inc = t?.getAttribute?.("data-qty-inc");
        if (inc) addToCart(inc, 1);

        const dec = t?.getAttribute?.("data-qty-dec");
        if (dec) addToCart(dec, -1);
    });

    compareItemsEl?.addEventListener("click", (e) => {
        const t = e.target;
        const title = t?.getAttribute?.("data-compare-remove");
        if (title) toggleCompare(title);
    });

    productModalAdd?.addEventListener("click", () => {
        if (!activeProductTitle) return;
        addToCart(activeProductTitle);
        closeOverlay(productModal);
        openOverlay(cartDrawer);
    });
    productModalCompare?.addEventListener("click", () => {
        if (!activeProductTitle) return;
        toggleCompare(activeProductTitle);
        closeOverlay(productModal);
        openOverlay(compareDrawer);
    });

    // Cerrar overlays con Escape (si alguno está abierto)
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        [productModal, cartDrawer, compareDrawer].forEach((el) => {
            if (el && el.getAttribute("aria-hidden") === "false") closeOverlay(el);
        });
    });

    // Newsletter (demo)
    const newsletterForm = document.getElementById("newsletter-form");
    const newsletterEmail = document.getElementById("newsletter-email");
    const newsletterMsg = document.getElementById("newsletter-message");
    const NEWS_KEY = "mg_newsletter_email_v1";

    if (newsletterForm && newsletterEmail) {
        const existing = localStorage.getItem(NEWS_KEY);
        if (existing && newsletterMsg) newsletterMsg.textContent = "Ya estás suscrito con este dispositivo.";

        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = String(newsletterEmail.value || "").trim();
            if (!email) return;
            try {
                localStorage.setItem(NEWS_KEY, email);
            } catch {
                // ignore
            }
            if (newsletterMsg) newsletterMsg.textContent = "¡Listo! Te avisaremos de novedades.";
            newsletterEmail.value = "";
        });
    }

    // Formulario de consulta (demo): confirmación + link calendario
    const consultationForm = document.getElementById("consultation-form");
    const consultationMsg = document.getElementById("consultation-message");
    const addToCalendarLink = document.getElementById("add-to-calendar");

    const toIcsDate = (d) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const buildIcs = ({ title, description, location, start, end }) => {
        return [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//MangataGallo//Consultas//ES",
            "BEGIN:VEVENT",
            `UID:${Date.now()}@mangatagallo`,
            `DTSTAMP:${toIcsDate(new Date())}`,
            `DTSTART:${toIcsDate(start)}`,
            `DTEND:${toIcsDate(end)}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n");
    };

    if (consultationForm) {
        consultationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = String(document.getElementById("guest_name")?.value || "").trim();
            const email = String(document.getElementById("email_guest")?.value || "").trim();
            const date = String(document.getElementById("guest_date")?.value || "").trim();
            const time = String(document.getElementById("time_guest")?.value || "").trim();
            const type = String(document.getElementById("consultation_type")?.value || "").trim();

            if (!name || !email || !date || !time) return;

            const start = new Date(`${date}T${time}:00`);
            const end = new Date(start.getTime() + 30 * 60 * 1000);
            const location = "123 Artisan Way, Austin, TX 78701";
            const title = "Consulta privada – Mangata & Gallo";
            const description = `Cliente: ${name}\\nEmail: ${email}\\nInterés: ${type}`;

            if (consultationMsg) consultationMsg.textContent = `¡Gracias, ${name}! Hemos registrado tu solicitud para ${date} a las ${time}.`;

            const ics = buildIcs({ title, description, location, start, end });
            const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            if (addToCalendarLink) {
                addToCalendarLink.hidden = false;
                addToCalendarLink.href = url;
                addToCalendarLink.download = "consulta-mangata-gallo.ics";
            }
        });
    }

    // Asesor de estilo (sin API externa)
    const aiAdvisorButton = document.getElementById("ai-advisor-button");
    const aiAdvisorChatWindow = document.getElementById("ai-advisor-chat-window");
    const closeChatButton = document.getElementById("close-chat-button");
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    const appendMessage = (text, className) => {
        if (!chatMessages) return null;
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", className);
        const p = document.createElement("p");
        p.textContent = text;
        messageElement.appendChild(p);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    };

    const styleAdvisorReply = (message) => {
        const m = message.toLowerCase();
        if (m.includes("anillo") || m.includes("compromiso")) {
            return "Para un anillo de compromiso, te recomiendo un diseño limpio que maximice el brillo. Mira la línea Signature (por ejemplo, un estilo como “Anillo Aurora”) y reserva una consulta para ajustar talla, metal y engaste.";
        }
        if (m.includes("oro") || m.includes("plata") || m.includes("metal")) {
            return "Si buscas durabilidad y un look cálido, el oro es ideal; si prefieres un tono más frío, puedes ir a metales claros. En consulta te ayudamos a elegir según tu tono de piel, uso diario y presupuesto.";
        }
        if (m.includes("collar") || m.includes("cadena")) {
            return "Para collar, piensa primero en la altura del escote y el uso (diario vs evento). Un diseño equilibrado como “Collar Luna” funciona muy bien y se puede personalizar en longitud.";
        }
        if (m.includes("pendiente") || m.includes("arete")) {
            return "En pendientes, el secreto es el equilibrio: brillo sutil para diario y mayor presencia para noche. Los “Pendientes Sol” son una apuesta elegante y versátil.";
        }
        if (m.includes("pulsera")) {
            return "Las pulseras con textura artesanal elevan cualquier look. Si quieres algo especial, una edición limitada (estilo “Pulsera Nébula”) queda perfecta sola o en capas.";
        }
        if (m.includes("cita") || m.includes("consulta") || m.includes("reservar")) {
            return "Claro: baja a “Agenda Tu Consulta Privada”, elige fecha/hora y el tipo de pieza. Si quieres, dime para qué ocasión es y te sugiero 2–3 opciones antes de reservar.";
        }
        return "Gracias por tu mensaje. ¿Buscas anillo, collar, pendientes o pulsera? Cuéntame la ocasión (regalo, boda, aniversario, diario) y el estilo (minimalista, clásico, llamativo) y te guío con opciones.";
    };

    if (aiAdvisorButton && aiAdvisorChatWindow && closeChatButton) {
        aiAdvisorButton.addEventListener("click", () => aiAdvisorChatWindow.classList.toggle("active"));
        closeChatButton.addEventListener("click", () => aiAdvisorChatWindow.classList.remove("active"));
    }

    const sendChatMessage = () => {
        const message = String(userInput?.value || "").trim();
        if (!message) return;
        appendMessage(message, "user-message");
        if (userInput) userInput.value = "";
        const reply = styleAdvisorReply(message);
        appendMessage(reply, "bot-message");
    };

    if (sendButton && userInput) {
        sendButton.addEventListener("click", sendChatMessage);
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendChatMessage();
        });
    }
});