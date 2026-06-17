(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var resultInputs = document.querySelectorAll('.results-form input[name="q"]');

  for (var i = 0; i < resultInputs.length; i += 1) {
    resultInputs[i].value = query;
  }

  var forms = document.querySelectorAll(".search-form");

  function submitToResults(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var input = form.querySelector('input[name="q"]');
    var value = input && input.value ? input.value : "";
    var encoded = encodeURIComponent(value.trim());
    var target = "resultados.html" + (encoded ? "?q=" + encoded : "?q=");

    window.location.href = target;
  }

  for (var j = 0; j < forms.length; j += 1) {
    forms[j].addEventListener("submit", submitToResults);
  }
}());
