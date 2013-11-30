chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('stm8.html', {
    'bounds': {
      'width': 800,
      'height': 500
    }
  });

});





