(function () {
  var params = new URLSearchParams(window.location.search);
  var defaultResultsQuery = "blog apoyo Miguel Carca\u00f1o";
  var query = params.get("q") || (document.body.classList.contains("results-page") ? defaultResultsQuery : "");
  var resultInputs = document.querySelectorAll('.results-form input[name="q"]');
  var forms = document.querySelectorAll(".search-form");

  function submitToResults(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var input = form.querySelector('input[name="q"]');
    var value = input && input.value ? input.value : "";
    var encoded = encodeURIComponent(value.trim());

    window.location.href = "resultados.html?q=" + encoded;
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function fakeCommentDate() {
    var now = new Date();
    return "martes, 24 de marzo de 2009, " + pad(now.getHours()) + ":" + pad(now.getMinutes());
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

  function appendComment(list, comment) {
    var wrapper = document.createElement("div");
    var meta = document.createElement("p");
    var name = document.createElement("strong");
    var date = document.createElement("span");
    var body = document.createElement("p");
    var button = document.createElement("button");

    wrapper.className = "comment";
    meta.className = "comment-meta";
    name.textContent = comment.name || "Anonimo";
    date.textContent = comment.date || fakeCommentDate();
    meta.appendChild(name);
    meta.appendChild(document.createTextNode(" dijo... "));
    meta.appendChild(date);

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

      for (var j = 0; j < stored.length; j += 1) {
        appendComment(list, stored[j]);
      }

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
          text: text,
          date: fakeCommentDate()
        };

        comments.push(comment);
        writeStoredComments(currentPostId, comments);
        appendComment(currentList, comment);
        currentForm.reset();
      });
    }
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

    setInterval(function () {
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
      return "blog apoyo Miguel Carca\u00f1o - The Searcher - Windows Internet Explorer";
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
    var addressNode;
    var addresses;
    var addressIndex = 0;
    var taskLabel;

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
        '<span class="ie-window-controls"><button type="button">_</button><button type="button">[]</button><button type="button">X</button></span>' +
      '</div>' +
      '<div class="ie-menubar"><span>Archivo</span><span>Edici&oacute;n</span><span>Ver</span><span>Favoritos</span><span>Herramientas</span><span>Ayuda</span></div>' +
      '<div class="ie-toolbar">' +
        '<button type="button" class="ie-round-button">&lt;</button>' +
        '<button type="button" class="ie-round-button muted">&gt;</button>' +
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

    addressNode = body.querySelector("[data-browser-address]");
    addresses = getBrowserAddresses();
    taskLabel = body.querySelector("[data-xp-task-label]");
    body.querySelector("[data-browser-title]").textContent = getBrowserTitle();

    if (taskLabel) {
      taskLabel.textContent = getBrowserTitle().replace(" - Windows Internet Explorer", "");
    }

    if (addressNode && addresses.length) {
      addressNode.textContent = addresses[0];

      if (addresses.length > 1) {
        setInterval(function () {
          addressIndex = (addressIndex + 1) % addresses.length;
          addressNode.textContent = addresses[addressIndex];
        }, 3200);
      }
    }

  }

  for (var i = 0; i < resultInputs.length; i += 1) {
    resultInputs[i].value = query;
  }

  for (var j = 0; j < forms.length; j += 1) {
    forms[j].addEventListener("submit", submitToResults);
  }

  setupBlogComments();
  setupVisitCounter();
  setupBrowserShell();
}());
