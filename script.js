(function () {
  var params = new URLSearchParams(window.location.search);
  var defaultResultsQuery = "blog apoyo Miguel Carca\u00f1o";
  var query = params.get("q") || (document.body.classList.contains("results-page") ? defaultResultsQuery : "");
  var visitCounterTimer = null;
  var commentAvatarPaths = [
    "assets/comment-avatars/avatar-01.jpg",
    "assets/comment-avatars/avatar-02.jpg",
    "assets/comment-avatars/avatar-03.jpg",
    "assets/comment-avatars/avatar-04.jpg",
    "assets/comment-avatars/avatar-05.jpg",
    "assets/comment-avatars/avatar-06.jpg",
    "assets/comment-avatars/avatar-32.jpg",
    "assets/comment-avatars/avatar-31.jpg",
    "assets/comment-avatars/avatar-09.jpg",
    "assets/comment-avatars/avatar-10.jpg",
    "assets/comment-avatars/avatar-11.jpg",
    "assets/comment-avatars/avatar-12.jpg",
    "assets/comment-avatars/avatar-13.jpg",
    "assets/comment-avatars/avatar-14.jpg",
    "assets/comment-avatars/avatar-15.jpg",
    "assets/comment-avatars/avatar-16.jpg",
    "assets/comment-avatars/avatar-17.jpg",
    "assets/comment-avatars/avatar-18.jpg",
    "assets/comment-avatars/avatar-19.jpg",
    "assets/comment-avatars/avatar-20.jpg",
    "assets/comment-avatars/avatar-21.jpg",
    "assets/comment-avatars/avatar-22.jpg",
    "assets/comment-avatars/avatar-23.jpg",
    "assets/comment-avatars/avatar-24.jpg",
    "assets/comment-avatars/avatar-25.jpg",
    "assets/comment-avatars/avatar-26.jpg",
    "assets/comment-avatars/avatar-27.jpg",
    "assets/comment-avatars/avatar-28.jpg",
    "assets/comment-avatars/avatar-29.jpg",
    "assets/comment-avatars/avatar-30.jpg"
  ];

  function submitToResults(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var input = form.querySelector('input[name="q"]');
    var value = input && input.value ? input.value : "";
    var encoded = encodeURIComponent(value.trim());
    var targetUrl = new URL("resultados.html?q=" + encoded, window.location.href);

    if (shouldNavigateWithinShell(targetUrl)) {
      navigateWithinShell(targetUrl).catch(function () {
        window.location.href = targetUrl.href;
      });
      return;
    }

    window.location.href = targetUrl.href;
  }

  function setupResultsQueryText() {
    var resultQuery = document.querySelector("[data-results-query]");

    if (!document.body.classList.contains("results-page")) {
      return;
    }

    if (resultQuery) {
      resultQuery.textContent = query || defaultResultsQuery;
    }

    document.title = (query || defaultResultsQuery) + " - Buscar con The Searcher";
  }

  function readStoredComments(postId) {
    try {
      return JSON.parse(localStorage.getItem("blog-comments-" + postId) || "[]");
    } catch (error) {
      return [];
    }
  }

  function writeStoredComments(postId, comments) {
    try {
      localStorage.setItem("blog-comments-" + postId, JSON.stringify(comments));
    } catch (error) {
      return false;
    }

    return true;
  }

  function decorateCommentAvatars() {
    var comments = document.querySelectorAll(".comments-list .comment");

    for (var i = 0; i < comments.length; i += 1) {
      var comment = comments[i];
      var avatar = comment.querySelector(".comment-avatar");
      var name = comment.querySelector(".comment-meta strong");
      var avatarPath = commentAvatarPaths[i % commentAvatarPaths.length];

      if (!avatar) {
        avatar = document.createElement("img");
        avatar.className = "comment-avatar";
        comment.insertBefore(avatar, comment.firstChild);
      }

      avatar.src = avatarPath;
      avatar.alt = "Avatar de " + (name ? name.textContent : "usuario");
    }
  }

  function appendComment(list, comment) {
    var wrapper = document.createElement("div");
    var meta = document.createElement("p");
    var name = document.createElement("strong");
    var body = document.createElement("p");
    var button = document.createElement("button");

    wrapper.className = "comment";
    meta.className = "comment-meta";
    name.textContent = comment.name || "Anonimo";
    meta.appendChild(name);
    meta.appendChild(document.createTextNode(" dijo..."));

    body.textContent = comment.text || "";
    button.type = "button";
    button.textContent = "Responder";

    wrapper.appendChild(meta);
    wrapper.appendChild(body);
    wrapper.appendChild(button);
    list.appendChild(wrapper);
  }

  function setupBlogComments() {
    var posts = document.querySelectorAll(".blog-post[data-post-id]");

    for (var i = 0; i < posts.length; i += 1) {
      var post = posts[i];
      var postId = post.getAttribute("data-post-id");
      var list = post.querySelector(".comments-list");
      var form = post.querySelector(".comment-form");
      var stored = readStoredComments(postId);

      if (!list || !form) {
        continue;
      }

      if (list.getAttribute("data-stored-comments-loaded") !== "true") {
        for (var j = 0; j < stored.length; j += 1) {
          appendComment(list, stored[j]);
        }
        list.setAttribute("data-stored-comments-loaded", "true");
      }

      if (form.getAttribute("data-comments-ready") === "true") {
        continue;
      }

      form.setAttribute("data-comments-ready", "true");
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var currentForm = event.currentTarget;
        var currentPost = currentForm.closest(".blog-post[data-post-id]");
        var currentPostId = currentPost.getAttribute("data-post-id");
        var currentList = currentPost.querySelector(".comments-list");
        var nameInput = currentForm.querySelector('input[name="name"]');
        var commentInput = currentForm.querySelector('textarea[name="comment"]');
        var name = nameInput.value.trim() || "Anonimo";
        var text = commentInput.value.trim();
        var comments = readStoredComments(currentPostId);
        var comment;

        if (!text) {
          return;
        }

        comment = {
          name: name,
          text: text
        };

        comments.push(comment);
        writeStoredComments(currentPostId, comments);
        appendComment(currentList, comment);
        decorateCommentAvatars();
        currentForm.reset();
      });
    }

    decorateCommentAvatars();
  }

  function renderVisitCounter(counter, value) {
    var digits = String(value);
    var html = "";

    while (digits.length < 6) {
      digits = "0" + digits;
    }

    for (var i = 0; i < digits.length; i += 1) {
      html += "<span>" + digits.charAt(i) + "</span>";
    }

    counter.innerHTML = html;
  }

  function setupVisitCounter() {
    var counter = document.querySelector("[data-visit-counter]");
    var key = "blog-fake-visits-2009";
    var value;

    if (visitCounterTimer) {
      clearInterval(visitCounterTimer);
      visitCounterTimer = null;
    }

    if (!counter) {
      return;
    }

    try {
      value = parseInt(localStorage.getItem(key) || "19842", 10);
    } catch (error) {
      value = 19842;
    }

    if (!value || value < 19842) {
      value = 19842;
    }

    value += 1;
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
    }
    renderVisitCounter(counter, value);

    visitCounterTimer = setInterval(function () {
      value += 1;
      try {
        localStorage.setItem(key, String(value));
      } catch (error) {
      }
      renderVisitCounter(counter, value);
    }, 15000);
  }

  function getBrowserTitle() {
    if (document.body.classList.contains("blog-page")) {
      return "Todos con Miguel Carca\u00f1o - Windows Internet Explorer";
    }

    if (document.body.classList.contains("results-page")) {
      return (query || defaultResultsQuery) + " - The Searcher - Windows Internet Explorer";
    }

    return "The Searcher Espa\u00f1a - Windows Internet Explorer";
  }

  function getBrowserAddresses() {
    var encodedQuery = encodeURIComponent(query || defaultResultsQuery);
    var searchUrl = "http://www.thesearcher.es/search?q=" + encodedQuery;
    var homeUrl = "www.thesearcher.es";
    var blogUrl = "http://apoyosamiguel.blogbikes.com/";

    if (document.body.classList.contains("blog-page")) {
      return [
        blogUrl
      ];
    }

    if (document.body.classList.contains("results-page")) {
      return [
        searchUrl
      ];
    }

    return [
      homeUrl
    ];
  }

  function updateCurrentQueryFromUrl(url) {
    params = new URLSearchParams(url.search);
    query = params.get("q") || (document.body.classList.contains("results-page") ? defaultResultsQuery : "");
  }

  function updateBrowserChrome() {
    var titleNode = document.querySelector("[data-browser-title]");
    var addressNode = document.querySelector("[data-browser-address]");
    var taskLabel = document.querySelector("[data-xp-task-label]");
    var addresses = getBrowserAddresses();

    if (titleNode) {
      titleNode.textContent = getBrowserTitle();
    }

    if (taskLabel) {
      taskLabel.textContent = getBrowserTitle().replace(" - Windows Internet Explorer", "");
    }

    if (addressNode && addresses.length) {
      addressNode.textContent = addresses[0];
    }
  }

  function setupResultsInputs() {
    var resultInputs = document.querySelectorAll('.results-form input[name="q"]');

    for (var i = 0; i < resultInputs.length; i += 1) {
      resultInputs[i].value = query;
    }
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('.search-form, .mini-search');

    for (var i = 0; i < forms.length; i += 1) {
      if (forms[i].getAttribute("data-search-ready") === "true") {
        continue;
      }

      forms[i].setAttribute("data-search-ready", "true");
      forms[i].addEventListener("submit", submitToResults);
    }
  }

  function initializePageContent() {
    setupResultsInputs();
    setupResultsQueryText();
    setupSearchForms();
    setupBlogComments();
    setupVisitCounter();
    updateBrowserChrome();
  }

  function isShellPageUrl(url) {
    var path = url.pathname;

    if (url.origin !== window.location.origin) {
      return false;
    }

    return /(?:^|\/)(index|resultados|blog)\.html$/.test(path);
  }

  function shouldNavigateWithinShell(url) {
    return !!getFullscreenElement() &&
      !!document.querySelector(".browser-content") &&
      isShellPageUrl(url);
  }

  function setBodyPageClasses(nextBodyClassName) {
    var isFullscreen = !!getFullscreenElement();

    document.body.className = nextBodyClassName || "";
    document.body.classList.add("xp-shell-active");

    if (isFullscreen) {
      document.body.classList.add("is-fullscreen");
    }
  }

  function replaceBrowserContentFromDocument(nextDocument) {
    var content = document.querySelector(".browser-content");
    var nodes = nextDocument.body.childNodes;

    if (!content) {
      return false;
    }

    content.textContent = "";

    for (var i = 0; i < nodes.length; i += 1) {
      if (nodes[i].nodeType === 1 && nodes[i].tagName.toLowerCase() === "script") {
        continue;
      }

      content.appendChild(document.importNode(nodes[i], true));
    }

    return true;
  }

  function navigateWithinShell(url, options) {
    var nextUrl = new URL(url.href);
    var settings = options || {};

    return fetch(nextUrl.href, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudo cargar la pagina");
        }

        return response.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var nextDocument = parser.parseFromString(html, "text/html");

        if (!replaceBrowserContentFromDocument(nextDocument)) {
          window.location.href = nextUrl.href;
          return;
        }

        setBodyPageClasses(nextDocument.body.className);
        document.title = nextDocument.title;

        if (settings.replaceHistory) {
          window.history.replaceState({ shellPage: true }, "", nextUrl.href);
        } else {
          window.history.pushState({ shellPage: true }, "", nextUrl.href);
        }

        updateCurrentQueryFromUrl(nextUrl);
        initializePageContent();
        syncFullscreenState();
      });
  }

  function handleInternalLinkClick(event) {
    var link;
    var href;
    var targetUrl;

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link || (link.target && link.target !== "_self")) {
      return;
    }

    href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      return;
    }

    targetUrl = new URL(href, window.location.href);
    if (!shouldNavigateWithinShell(targetUrl)) {
      return;
    }

    event.preventDefault();
    navigateWithinShell(targetUrl).catch(function () {
      window.location.href = targetUrl.href;
    });
  }

  function setupInternalNavigation() {
    if (document.body.getAttribute("data-shell-navigation-ready") === "true") {
      return;
    }

    document.body.setAttribute("data-shell-navigation-ready", "true");
    document.addEventListener("click", handleInternalLinkClick);
    window.addEventListener("popstate", function () {
      var targetUrl = new URL(window.location.href);

      if (shouldNavigateWithinShell(targetUrl)) {
        navigateWithinShell(targetUrl, { replaceHistory: true }).catch(function () {
          window.location.href = targetUrl.href;
        });
      }
    });
  }

  function getFullscreenElement() {
    return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
  }

  function requestFullscreen(element) {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    }

    if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    }

    if (element.msRequestFullscreen) {
      return element.msRequestFullscreen();
    }

    return null;
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }

    if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    }

    if (document.msExitFullscreen) {
      return document.msExitFullscreen();
    }

    return null;
  }

  function toggleFullscreen() {
    if (getFullscreenElement()) {
      exitFullscreen();
      return;
    }

    requestFullscreen(document.documentElement);
  }

  function syncFullscreenState() {
    var isFullscreen = !!getFullscreenElement();
    var maximizeButton = document.querySelector('[data-window-control="maximize"]');

    document.body.classList.toggle("is-fullscreen", isFullscreen);

    if (maximizeButton) {
      maximizeButton.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
      maximizeButton.setAttribute("title", isFullscreen ? "Salir de pantalla completa" : "Pantalla completa");
    }

    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 0);
  }

  function setupFullscreenSync() {
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);
    document.addEventListener("MSFullscreenChange", syncFullscreenState);
    syncFullscreenState();
  }

  function setupBrowserNavigationButtons() {
    var backButton = document.querySelector('[data-browser-nav="back"]');
    var forwardButton = document.querySelector('[data-browser-nav="forward"]');

    if (backButton) {
      backButton.addEventListener("click", function () {
        window.history.back();
      });
    }

    if (forwardButton) {
      forwardButton.addEventListener("click", function () {
        window.history.forward();
      });
    }
  }

  function setupBrowserShell() {
    var body = document.body;
    var desktop;
    var browserWindow;
    var chrome;
    var content;
    var taskbar;
    var scripts;
    var nodes = [];
    var child;
    var maximizeButton;

    if (body.classList.contains("xp-shell-active")) {
      return;
    }

    desktop = document.createElement("div");
    browserWindow = document.createElement("section");
    chrome = document.createElement("div");
    content = document.createElement("div");
    taskbar = document.createElement("footer");

    desktop.className = "xp-desktop";
    browserWindow.className = "ie-window";
    browserWindow.setAttribute("aria-label", "Windows Internet Explorer");
    chrome.className = "ie-chrome";
    content.className = "browser-content";
    taskbar.className = "xp-taskbar";

    chrome.innerHTML =
      '<div class="ie-titlebar">' +
        '<span class="ie-title-icon">e</span>' +
        '<span class="ie-title-text" data-browser-title></span>' +
        '<span class="ie-window-controls"><button type="button">_</button><button type="button" data-window-control="maximize" aria-label="Pantalla completa">[]</button><button type="button">X</button></span>' +
      '</div>' +
      '<div class="ie-menubar"><span>Archivo</span><span>Edici&oacute;n</span><span>Ver</span><span>Favoritos</span><span>Herramientas</span><span>Ayuda</span></div>' +
      '<div class="ie-toolbar">' +
        '<button type="button" class="ie-round-button" data-browser-nav="back" aria-label="Atr&aacute;s" title="Atr&aacute;s">&lt;</button>' +
        '<button type="button" class="ie-round-button" data-browser-nav="forward" aria-label="Adelante" title="Adelante">&gt;</button>' +
        '<button type="button" class="ie-tool-button">Detener</button>' +
        '<button type="button" class="ie-tool-button">Actualizar</button>' +
        '<label class="ie-address-label">Direcci&oacute;n</label>' +
        '<div class="ie-address-box"><span class="ie-address-icon">TS</span><span class="ie-address-text" data-browser-address></span></div>' +
        '<button type="button" class="ie-go-button">Ir</button>' +
      '</div>' +
      '<div class="ie-linksbar"><span>Favoritos</span><a href="#">The Searcher</a><a href="#">Noticias</a><a href="#">Correo</a><a href="#">Blogbikes</a></div>';

    taskbar.innerHTML =
      '<button type="button" class="xp-start-button"><span class="xp-start-icon"></span><span>Inicio</span></button>' +
      '<div class="xp-task-button"><span class="xp-task-icon">e</span><span data-xp-task-label></span></div>' +
      '<div class="xp-task-spacer"></div>' +
      '<div class="xp-tray"><span>ES</span><span class="xp-tray-light"></span></div>';

    scripts = body.querySelectorAll("script");
    child = body.firstChild;
    while (child) {
      var next = child.nextSibling;
      if (!(child.nodeType === 1 && child.tagName.toLowerCase() === "script")) {
        nodes.push(child);
      }
      child = next;
    }

    for (var i = 0; i < nodes.length; i += 1) {
      content.appendChild(nodes[i]);
    }

    browserWindow.appendChild(chrome);
    browserWindow.appendChild(content);
    desktop.appendChild(browserWindow);

    body.insertBefore(desktop, scripts.length ? scripts[0] : null);
    body.insertBefore(taskbar, scripts.length ? scripts[0] : null);
    body.classList.add("xp-shell-active");

    updateBrowserChrome();

    maximizeButton = body.querySelector('[data-window-control="maximize"]');
    if (maximizeButton) {
      maximizeButton.addEventListener("click", toggleFullscreen);
    }

    setupBrowserNavigationButtons();
    setupFullscreenSync();

  }

  setupBrowserShell();
  initializePageContent();
  setupInternalNavigation();
}());
