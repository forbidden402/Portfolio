document.querySelectorAll('.toggle-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var target = document.getElementById(btn.getAttribute('data-target'));
    var open = target.classList.toggle('show');
    btn.classList.toggle('open', open);
  });
});
