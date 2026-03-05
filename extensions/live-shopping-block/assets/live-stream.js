(function () {
  const container = document.getElementById("live-shopping-app");
  if (!container) return;

  const sessionId = container.dataset.sessionId;
  if (!sessionId) return;

  const videoEl = document.getElementById("ls-video");
  const liveBadge = document.getElementById("ls-live-badge");
  const pinnedEl = document.getElementById("ls-pinned");
  const productsEl = document.getElementById("ls-products");
  const placeholder = container.querySelector(".ls-placeholder");

  let hlsInstance = null;
  let currentPlaybackId = null;

  async function fetchSessionData() {
    try {
      const res = await fetch(`/apps/live-shopping/api/session/${sessionId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("Live Shopping: failed to fetch session", e);
      return null;
    }
  }

  function initPlayer(playbackId) {
    if (!playbackId || playbackId === currentPlaybackId) return;
    currentPlaybackId = playbackId;

    const src = `https://stream.mux.com/${playbackId}.m3u8`;

    if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.src = src;
      videoEl.classList.add("ls-active");
      if (placeholder) placeholder.style.display = "none";
    } else if (window.Hls && Hls.isSupported()) {
      if (hlsInstance) hlsInstance.destroy();
      hlsInstance = new Hls();
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(videoEl);
      videoEl.classList.add("ls-active");
      if (placeholder) placeholder.style.display = "none";
    } else {
      var script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
      script.onload = function () {
        if (Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(videoEl);
          videoEl.classList.add("ls-active");
          if (placeholder) placeholder.style.display = "none";
        }
      };
      document.head.appendChild(script);
    }
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.textContent;
  }

  function createEl(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
      });
    }
    if (typeof children === "string") {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(function (child) {
        if (child) el.appendChild(child);
      });
    }
    return el;
  }

  function renderPinned(product) {
    if (!product) {
      pinnedEl.classList.add("ls-hidden");
      pinnedEl.replaceChildren();
      return;
    }
    pinnedEl.classList.remove("ls-hidden");
    pinnedEl.replaceChildren();

    if (product.image) {
      pinnedEl.appendChild(
        createEl("img", { src: product.image, alt: escapeHtml(product.title) }),
      );
    }

    var info = createEl("div", { class: "ls-pinned-info" });
    info.appendChild(createEl("span", { class: "ls-pinned-badge" }, "NOW SHOWING"));
    info.appendChild(createEl("h3", null, escapeHtml(product.title)));
    var priceEl = createEl("div", { class: "ls-price" });
    priceEl.textContent = "$" + escapeHtml(product.price || "N/A");
    info.appendChild(priceEl);
    pinnedEl.appendChild(info);

    var handle = product.handle || "#";
    pinnedEl.appendChild(
      createEl(
        "a",
        { href: "/products/" + encodeURIComponent(handle), class: "ls-btn ls-btn--accent" },
        "Buy Now",
      ),
    );
  }

  function renderProducts(products) {
    productsEl.replaceChildren();
    if (!products || products.length === 0) return;

    products.forEach(function (p) {
      var card = createEl("div", { class: "ls-product-card" });

      if (p.image) {
        card.appendChild(
          createEl("img", { src: p.image, alt: escapeHtml(p.title) }),
        );
      }

      var body = createEl("div", { class: "ls-product-card-body" });
      body.appendChild(createEl("h4", null, escapeHtml(p.title)));
      var priceEl = createEl("div", { class: "ls-price" });
      priceEl.textContent = "$" + escapeHtml(p.price || "N/A");
      body.appendChild(priceEl);

      var handle = p.handle || "#";
      body.appendChild(
        createEl(
          "a",
          { href: "/products/" + encodeURIComponent(handle), class: "ls-btn ls-btn--primary" },
          "View Product",
        ),
      );

      card.appendChild(body);
      productsEl.appendChild(card);
    });
  }

  async function update() {
    var data = await fetchSessionData();
    if (!data) return;

    if (data.playbackId) {
      initPlayer(data.playbackId);
    }

    if (data.status === "live" || data.status === "idle") {
      liveBadge.classList.remove("ls-badge--hidden");
    } else {
      liveBadge.classList.add("ls-badge--hidden");
    }

    renderPinned(data.pinnedProduct);
    renderProducts(data.products);
  }

  update();

  var interval = parseInt(container.dataset.refreshInterval || "10", 10);
  setInterval(update, interval * 1000);
})();
