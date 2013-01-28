/*
 * Simple HTML to Markdown Extra converter with regex.
 *
 * Copy your HTML to the input area, press Ctrl+Enter, and copy your
 * Markdown Extra from the output area.
 *
 * Copyright (C) 2013 Scito <http://scito.ch>
 *
 *
 * Changelog:
 * - 27.01.2013: Initial version by scito
 *
 *
 * Dependencies:
 * - jQuery <http://jquery.com/>
 *
 *
 * HMTL code to run this script:
 * <div title="Sample code to run the html2md converter">
 *    <div id="regexhtml2md"></div>
 *    <script src="/pathToScript/regexhtml2md.js?v=1.0"></script>
 * </div>
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Dieses Programm ist Freie Software: Sie können es unter den Bedingungen
 * der GNU General Public License, wie von der Free Software Foundation,
 * Version 3 der Lizenz oder (nach Ihrer Option) jeder späteren
 * veröffentlichten Version, weiterverbreiten und/oder modifizieren.
 *
 * Dieses Programm wird in der Hoffnung, dass es nützlich sein wird, aber
 * OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
 * Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
 * Siehe die GNU General Public License für weitere Details.
 *
 * Sie sollten eine Kopie der GNU General Public License zusammen mit diesem
 * Programm erhalten haben. Wenn nicht, siehe <http://www.gnu.org/licenses/>.
 *
 */

;(function ($) {

    var areastyle = 'font-size: small; overflow: auto; font-family: monospace; width:100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;';

    /** "Main function" */
    $(function() {
        // Output simulation UI as HTML
        $('#regexhtml2md').html('\
<h3>HTML-Input</h3>\
<div>\
<textarea id="rhtml2md-input" autofocus rows="10" cols="60" wrap="off" style="' + areastyle + '" placeholder="Please enter your HTML text here.">\
<p><strong>Strong</strong></p>\n\
<!--break-->\n\
<p>Normal -- kurz <em>Em</em>.</p>\n\
<p>Normal<br>Break Line</p>\n\
<ul>\n\
<li>Foo</li>\n\
<li>Bar</li>\n\
</ul>\n\
<ol>\n\
<li>One</li>\n\
<li>Two</li>\n\
</ol>\n\
<p><a href="http://scito.ch">Scito</a></p>\n\
<p><a href="http://scito.ch" title="Visit me">Scito</a></p>\
</textarea>\
<input id="rhtml2md-br" value="0" type="checkbox">\
<label for="rhtml2md-br" style="display: inline; font-weight: normal; margin-left: 0.5em;">Keep &lt;br&gt;</label>\
<p>To convert, press <kbd>Ctrl</kbd>&nbsp;<kbd>Enter</kbd> or click on the "Convert" button.\</p>\
</div>\
\
<div style="text-align:center;"><button id="rhtml2md-convert" type="button" title="Starts the conversion" style="margin-top: 1em; margin-bottom: 1em; font-size: x-large;" class="no-print">Convert</button></div>\
\
<div id="rhtml2md-output"></div>\
            ');

        $('#rhtml2md-input').keydown(function (event) {
            if (event.keyCode === 10 || event.keyCode == 13 && event.ctrlKey) {
                // Ctrl-Enter pressed
                convert(event);
            }
        });

        // Bind start button
        $("#rhtml2md-convert").click(function(event) {
            convert(event)
        });

        $('#rhtml2md-input').select();
    });

    /**
     * Converts basic HTML to Markdown Extra with regex.
     *
     * @param event JavaScript event
     *
     * @return false
     */
    function convert(event) {
        event.preventDefault();
        var input = $('#rhtml2md-input').val();
        var ignoreBR = $('#rhtml2md-br').attr('checked');

        var converted = convertOl(input).replace(/<p>/igm, "").replace(/<\/p>/igm, "\n")
            .replace(/<\/?strong>/igm, "**")
            .replace(/<\/?em>/igm, "_")
            .replace(/<\/?ul>/igm, "")
            .replace(/<li>/igm, "* ").replace(/<\/li>/igm, "")
            .replace(/<h1>/igm, "# ").replace(/<h2>/igm, "## ").replace(/<h3>/igm, "### ").replace(/<h4>/igm, "#### ").replace(/<h5>/igm, "##### ").replace(/<\/h[12345]>/igm, "")
            .replace(/<a href="([^"]+)">([^<]+)<\/a>/igm, "[$2]($1)")
            .replace(/<a href="([^"]+)" title="([^"]+)">([^<]+)<\/a>/igm, "[$3]($1 \"$2\")")
        ;
        converted = ignoreBR ? converted.replace(/<br ?\/?>/gm, "<br>\n")
            : converted.replace(/<br ?\/?>/gm, "  \n");

        converted = converted.replace(/\n{3,}/gm, '\n\n');

        // Write conversion output
        $('#rhtml2md-output').html('\
<h3>Markdown Extra Output</h3>\
<textarea id="rhtml2md-output-md" rows="10" cols="60" wrap="off" style="' + areastyle + '"></textarea>\
');

        $('#rhtml2md-output-md').text(converted);
        $('#rhtml2md-output-md').select();

        if (typeof Drupal != 'undefined') {
            // Run attached Drupal behaviors
            Drupal.attachBehaviors($('#regexhtml2md').get());
        }

        return false;
    }

    /** Convert ol > li to 1. */
    function convertOl(str) {
        var r = str;
        var pat = /<ol>([\s\S]*?)<\/ol>/mi;  //[\s\S] = dotall; ? = non-greedy match
        var lipat = /<li>/i;
        for (var mat; (mat = r.match(pat)) !== null; ) {
            mat = mat[1].replace(/<\/li>/igm, "")/*.replace(/<li>/igm, "1. ")*/;
            for (var c = 1; mat.search(lipat) !== -1; c++) {
                mat = mat.replace(lipat, c + ". ");
            }
            r = r.replace(pat, mat);
        }
        return r;
    }

})(jQuery);
