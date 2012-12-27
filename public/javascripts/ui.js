/**!
 *
 * REQUIRED
 * @required jquery v1.8+
 *
 * IMPORTS
 * @codekit-prepend "prettify/prettify.js"
 *
 * VALIDATION
 * All code must validate with JSHint (http://www.jshint.com/) to be launched
 * within a LIVE web application. NO debug code should remain in your final
 * versions e.g. remove EVERY reference to window.console.log().
 *
 * STYLE
 * All code should be within 79 characters WIDE to meet standard Hatchd
 * protocol. Reformat code cleanly to fit within this tool.
 *
 * jshint = { "laxcomma": true, "laxbreak": true, "browser": true }
 *
 * @author Jimmy Hillis <jimmy@hillis.me>
 *
 */

$(document).ready(function() {

    // Color code on my pages, with CSS stored in my standard files. Due to
    // the way my content markup is built using markdown I need to run some
    // JS to apply to correct classes before we can run the styler, no
    // big deal as it wont work without JS anyway!
	$('pre code').addClass('prettyprint');
	prettyPrint();

    // Run Disqus script to setup commenting on any page that has the
    // required markup.
    if ($('#disqus_thread').length) {
        var disqus_shortname = 'jimmyhillis'
          , disqus_developer = 1
          , disqus_title = 'Try me!';
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    }
});
