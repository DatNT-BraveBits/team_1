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
      if (placeholder) placeholder.classList.add("ls-gone");
    } else if (window.Hls && Hls.isSupported()) {
      if (hlsInstance) hlsInstance.destroy();
      hlsInstance = new Hls({
        lowLatencyMode: true,
        liveSyncDuration: 3,
        liveMaxLatencyDuration: 10,
        backBufferLength: 3,
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(videoEl);
      videoEl.classList.add("ls-active");
      if (placeholder) placeholder.classList.add("ls-gone");
    } else {
      var script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
      script.onload = function () {
        if (Hls.isSupported()) {
          hlsInstance = new Hls({
        lowLatencyMode: true,
        liveSyncDuration: 3,
        liveMaxLatencyDuration: 10,
        backBufferLength: 3,
      });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(videoEl);
          videoEl.classList.add("ls-active");
          if (placeholder) placeholder.classList.add("ls-gone");
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

    var liveDot = document.getElementById("ls-live-dot");
    var productsHeading = document.getElementById("ls-products-heading");

    if (data.status === "live" || data.status === "idle") {
      liveBadge.classList.remove("ls-badge--hidden");
      if (liveDot) liveDot.classList.add("ls-active");
    } else {
      liveBadge.classList.add("ls-badge--hidden");
      if (liveDot) liveDot.classList.remove("ls-active");
    }

    renderPinned(data.pinnedProduct);
    renderProducts(data.products);

    if (productsHeading && data.products && data.products.length > 0) {
      productsHeading.style.display = "block";
    }
  }

  update();

  var interval = parseInt(container.dataset.refreshInterval || "10", 10);
  setInterval(update, interval * 1000);

  // ========== Live Chat ==========
  var chatMessages = document.getElementById("ls-chat-messages");
  var chatForm = document.getElementById("ls-chat-form");
  var chatInput = document.getElementById("ls-chat-input");
  var chatEmpty = document.getElementById("ls-chat-empty");
  var viewerCountEl = document.getElementById("ls-viewer-count");
  var nicknameDisplay = document.getElementById("ls-nickname-display");
  var nicknameEditBtn = document.getElementById("ls-nickname-edit-btn");
  var nicknameSection = document.getElementById("ls-chat-nickname");
  var nicknameEditSection = document.getElementById("ls-chat-nickname-edit");
  var nicknameInput = document.getElementById("ls-nickname-input");
  var nicknameSaveBtn = document.getElementById("ls-nickname-save-btn");

  if (!chatMessages) return;

  // Client identity
  function getOrCreate(key, generator) {
    var val = localStorage.getItem(key);
    if (val) return val;
    val = generator();
    localStorage.setItem(key, val);
    return val;
  }

  var chatClientId = getOrCreate("livechat_clientId", function () {
    return crypto.randomUUID();
  });
  var chatNickname = getOrCreate("livechat_nickname", function () {
    return "Viewer_" + Math.floor(1000 + Math.random() * 9000);
  });

  nicknameDisplay.textContent = chatNickname;

  // Nickname editing
  nicknameEditBtn.addEventListener("click", function () {
    nicknameInput.value = chatNickname;
    nicknameSection.classList.add("ls-hidden");
    nicknameEditSection.classList.remove("ls-hidden");
    nicknameInput.focus();
  });

  nicknameSaveBtn.addEventListener("click", function () {
    var val = nicknameInput.value.trim();
    if (val && val !== chatNickname) {
      chatNickname = val;
      localStorage.setItem("livechat_nickname", chatNickname);
      nicknameDisplay.textContent = chatNickname;
      if (chatWs && chatWs.readyState === WebSocket.OPEN) {
        chatWs.send(JSON.stringify({ type: "update_nickname", nickname: chatNickname }));
      }
    }
    nicknameEditSection.classList.add("ls-hidden");
    nicknameSection.classList.remove("ls-hidden");
  });

  // Chat message rendering
  function appendChatMsg(data) {
    if (chatEmpty) chatEmpty.style.display = "none";
    var div = document.createElement("div");
    div.className = "ls-chat-msg";
    var name = document.createElement("span");
    name.className = "ls-chat-msg-name";
    name.textContent = data.nickname;
    div.appendChild(name);
    var text = document.createElement("span");
    text.textContent = data.text || data.message;
    div.appendChild(text);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // WebSocket connection
  var chatWs = null;
  var chatWsUrl = null;
  var reconnectDelay = 1000;
  var reconnectTimer = null;

  function connectChat(wsUrl) {
    if (!wsUrl) return;
    chatWsUrl = wsUrl;

    try {
      chatWs = new WebSocket(wsUrl);
    } catch (e) {
      return;
    }

    chatWs.onopen = function () {
      reconnectDelay = 1000;
      chatWs.send(JSON.stringify({
        type: "join",
        nickname: chatNickname,
        clientId: chatClientId,
      }));
    };

    chatWs.onmessage = function (event) {
      var data;
      try { data = JSON.parse(event.data); } catch (e) { return; }

      if (data.type === "history" && data.messages) {
        data.messages.forEach(function (m) {
          appendChatMsg(m);
        });
      }

      if (data.type === "message") {
        appendChatMsg(data);
      }

      if (data.type === "user_joined" || data.type === "user_left") {
        viewerCountEl.textContent = data.viewerCount;
      }

      if (data.type === "viewer_count") {
        viewerCountEl.textContent = data.count;
      }
    };

    chatWs.onclose = function () {
      reconnectTimer = setTimeout(function () {
        reconnectDelay = Math.min(reconnectDelay * 2, 10000);
        connectChat(chatWsUrl);
      }, reconnectDelay);
    };

    chatWs.onerror = function () {
      chatWs.close();
    };
  }

  // Send message
  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = chatInput.value.trim();
    if (!text || !chatWs || chatWs.readyState !== WebSocket.OPEN) return;
    chatWs.send(JSON.stringify({ type: "message", text: text }));
    chatInput.value = "";
  });

  // Get wsUrl from first API fetch and connect
  (async function initChat() {
    var data = await fetchSessionData();
    if (data && data.wsUrl) {
      connectChat(data.wsUrl);
    }
  })();
})();
