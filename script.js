(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
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

  for (var i = 0; i < resultInputs.length; i += 1) {
    resultInputs[i].value = query;
  }

  for (var j = 0; j < forms.length; j += 1) {
    forms[j].addEventListener("submit", submitToResults);
  }

  setupBlogComments();
}());
