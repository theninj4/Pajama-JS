
// Build the navigation menu
var counter = 0;
$('#main-content h2').each(function(i) {
  counter++;
  var heading = $(this);
  heading.attr('id', counter);
  var container = jQuery('<li/>', { });

  var link = jQuery('<a/>', {
    href: '#'+counter,
    text: heading.html()
  });
  link.appendTo(container);

  var subHeadings = heading.nextUntil("h2", "h3");
  if (subHeadings) {
    var subList = jQuery('<ul/>', {
      class: 'nav'
    });
    subHeadings.each(function(j) {
      counter++;
      var subHeading = $(this);
      subHeading.attr('id', counter);
      var subContainer = jQuery('<li/>', { });

      var subLink = jQuery('<a/>', {
        href: '#'+counter,
        text: subHeading.html()
      });
      // smooth scrolling
      subLink.on('click', function(e) {
        e.preventDefault();
        history.pushState({ }, "", $(this).attr('href'));
        $('html, body').animate({
          scrollTop: subHeading.offset().top
        }, 300);
      });

      subLink.appendTo(subContainer);
      subContainer.appendTo(subList)
    });
    subList.appendTo(container);
  }

  // smooth scrolling
  link.on('click', function(e) {
    e.preventDefault();
    history.pushState({ }, "", $(this).attr('href'));
    $('html, body').animate({
      scrollTop: heading.offset().top
    }, 300);
  });
  
  container.appendTo('#nav-menu');
});
$('body').scrollspy({ target: '#nav-container' });

// Swap each script tag into a displayable, syntax highlighted element
$('script').each(function() {
  var scriptTag = $(this);
  var scriptTagType = scriptTag.attr('type');
  if (!scriptTagType || (scriptTagType == 'text/javascript')) return;

  var snippet = scriptTag.html().replace(/\n/, '');
  var snippetLanguage = scriptTag.attr('type').split('/').pop();
  if (snippetLanguage == 'template') snippetLanguage = 'javascript';
  var indentation = snippet.match(/ +/);
  if (indentation) {
    snippet = snippet.replace(new RegExp('^'+indentation[0], 'gm'), '  ');
  }
  snippet = snippet.replace(/\n +$/, '');

  var pre = jQuery('<pre/>', { });
  var code = jQuery('<code/>', { 
    class: 'language-'+snippetLanguage
  });
  code.html(snippet);
  code.appendTo(pre);
  pre.insertBefore($(this));
});

window.onhashchange = function(e) {
  e.preventDefault();
};

if (window.location.hash) {
  $('html, body').animate({
      scrollTop: $(window.location.hash).offset().top - 30
    }, 300);
}
