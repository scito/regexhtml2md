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

/* Rational:
 * - Simple one to one Markown Extra replacement, no messing with other parts
 *   where maybe carefully made
 * - Convert only what is equivalent, rest is left untouched
 *
 * Todo/ideas:
 * - Describe advantages of this approach better, and its limitations
 * - Add markdown="1" marker for certain block tags, e.g. div, table, td
 *     - where is marker necessary, parent also?
 * - id and/or title for h1-5
 * - Header id generator (counting id) if not available
 * - Test robustness, process an MD text with only one html to change
 * - Write some unit test cases (see how is it done in other projects)
 *
 * Supports:
 * - Simple code, blockquote, p, br, ul, ol, li, strong, em, b, i, h1-5, hr
 * - a with optional title
 * - All other tags or comments are left unchanged
 * - Supports code blocks (-> fenced code blocks), inline code (-> backticks) and
 *   PHP tags. Content between code and PHP tags is left unchanged.
 *
 * Limitions:
 * - No nested listssupported (ol, ul)
 * - Nested blockquotes are basically supported
 * - Tables are left unchanged, probably won't change
 * - Images, waiting for support of classes, like titles
 * - Inline code with `
 * - No backslash escapes implemented
 * - Automatic links <url>, not yet implented
 * - Definition lists not supported
 * - Abbreviations not yet supported
 * - code tags in php are converted to Markdown
 *
 */

;(function ($) {

    /** Pretty print functionality:
     * 0: no pretty print
     * 1: Markdown extra fenced code block
     * 2: surround <code> with <div class="prettyprint">
     */
    var PRETTY_PRINT = 1;

    /** Wrap the converted Markdown text with a <div>. */
    var WRAP_GLOBAL_DIV = false;

    var ignore_BR = false;

    var areastyle = 'font-size: small; overflow: auto; font-family: monospace; width:100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;';

    /** "Main function" */
    $(function() {
        // Output simulation UI as HTML
        $('#regexhtml2md').html('\
<h3>HTML-Input</h3>\
<div>\
<textarea id="rhtml2md-input" autofocus rows="10" cols="60" wrap="off" style="' + areastyle + '" placeholder="Please enter your HTML text here.">\
<h2>Title</h2>\
<p><strong>Strong</strong></p>\n\
<!--break-->\n\
<p>Normal – text <em>Em</em>.</p>\n\
<p>Normal<br>Break Line</p>\n\
<ul>\n\
<li>Foo</li>\n\
<li>Bar</li>\n\
</ul>\n\
<ol>\n\
<li>One</li>\n\
<li>Two</li>\n\
</ol>\n\
<code>\n\
var i = 0;\n\
alert(i);\n\
</code>\n\
<blockquote>\n\
<p>It always seems impossible until it is done.</p>\n\
\n\
<i>Nelson Mandela</i>\n\
</blockquote>\n\
<p><a href="http://scito.ch">Scito</a></p>\n\
<p><a href="http://scito.ch" title="Visit me">Scito</a></p>\n\
<hr />\n\
<ul>\n\
<li>Foo</li>\n\
<li>Bar\n\
<ol>\n\
<li>One</li>\n\
<li>Two</li>\n\
</ol>\n\
</li>\n\
</ul>\n\
<code>\n\
<strong>Strong in Code</strong>\n\
</code>\n\
<p>Some inline <code><strong></code> in text.</p>\n\
<?php\n\
<strong>Strong in PHP</strong>\n\
?>\n\
<blockquote>\n\
<p>It always seems impossible until it is done.</p>\n\
\n\
<i>Nelson Mandela</i>\n\
<blockquote>\n\
<p>It always seems impossible until it is done.</p>\n\
\n\
<i>Nelson Mandela</i>\n\
</blockquote>\n\
</blockquote>\n\
<span><em>Some EM</em></span>\n\
<h2 id="some-title">An id title Test</h2>\n\
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

        $('#rhtml2md-input').focusin(function(event) {
            $(this).select();
        });

        $('#rhtml2md-input').select();

        convert(null);
    });

    /**
     * Converts basic HTML to Markdown Extra with regex.
     *
     * @param event JavaScript event
     *
     * @return false
     */
    function convert(event) {
        if (event !== null) event.preventDefault();
        var input = $('#rhtml2md-input').val();
        ignore_BR = $('#rhtml2md-br').attr('checked');

        var converted = regexConvert(input, ignore_BR);

        // Write conversion output
        $('#rhtml2md-output').html('\
<h3>Markdown Extra Output</h3>\
<textarea id="rhtml2md-output-md" rows="10" cols="60" wrap="off" style="' + areastyle + '"></textarea>\
<a id="rhtml2md-output-legal-link" onclick="false">Show terms of service</a>\
<p id="rhtml2md-output-legal-text" style="display: none"><small>Note: This is a simple regex HTML to Markdown converter. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.</small></p>\
        ');

        $('#rhtml2md-output-legal-link').click(function () {
            if ($('#rhtml2md-output-legal-text').is(':visible')) {
                $(this).html($(this).html().replace(/Hide/, 'Show'));
            } else {
                $(this).html($(this).html().replace(/Show/, 'Hide'));
            }
            // Do it afterwards as the operation is async
            $('#rhtml2md-output-legal-text').slideToggle('slow');
        });

        $('#rhtml2md-output-md').text(converted);

        $('#rhtml2md-output-md').focusin(function(event) {
            $(this).select();
        });

        $('#rhtml2md-output-md').select();

        // Copy to clipboard, ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
        document.execCommand("copy", false, null);

        if (typeof Drupal != 'undefined') {
            // Run attached Drupal behaviors
            Drupal.attachBehaviors($('#regexhtml2md').get());
        }

        return false;
    }

    /**
     * Regex replacer function inserting a warning comment if nested lists
     * are detected.
     *
     * @return the replaced string
     */
    function ulOlNestingDetector(match, p1, p2, offset, string) {
        if (p2.match(/<(ul|ol).*?>[\s\S]*?<\/\1>/)) {
            return '\n<!-- ' + p1 + ' is nested. -->\n' + match + '<!-- ' + p1 + ' nesting end -->\n';
        } else {
            return match;
        }
    }

    /**
     * Regex replacer function inserting a warning comment if nested blockquotes
     * are detected.
     *
     * @return the replaced string
     */
    function blockquoteNestingDetector(match, p1, p2, offset, string) {
        if (p2.match(/<(blockquote).*?>[\s\S]*?<\/\1>/)) {
            return '\n<!-- ' + p1 + ' is nested. -->\n' + match + '<!-- ' + p1 + ' nesting end -->\n';
        } else {
            return match;
        }
    }

    /**
     * Main string based conversion function.
     *
     * @param input string to convert
     *
     * @return the converted string
     */
    function regexConvert(input) {
        var converted = '';
        var s = input;
        var pat = /\s*(?:<(code)>|<(\?)php)([\s\S]+?)(?:<\/\1>|^\2>)\s*/mi;  //[\s\S] = dotall; ? = non-greedy match
        //var pat = /\s*(?:<(code)>)([\s\S]+?)(?:<\/\1>)\s*/mi;  //[\s\S] = dotall; ? = non-greedy match
        for (var i; (i = s.search(pat)) !== -1; ) {
            converted += mdConvert(s.substring(0, i));
            var m = s.match(pat)[0];
            switch (PRETTY_PRINT) {
                case 1 :
                    converted += m.replace(/^\s*<code>\s*$/gim, '\n\n~~~~ {.prettycode .lang-js}')
                    .replace(/^\s*<\/code>\s*$/gim, '~~~~\n\n')
                    .replace(/<\/?code>/gim, '`')
                    .replace(/^<\?php/im, '\n<?php').replace(/^\?>/im, '?>\n');
                    break;
                case 2 :
                    converted += m.replace(/^\s*<code>\s*/gim, '\n\n<div class="prettyprint">\n<code>')
                    .replace(/^\s*<\/code>/gim, '</code>\n</div>\n\n')
                    .replace(/^<\?php/im, '\n<?php').replace(/^\?>/im, '?>\n');
                    break;
                case 0 :
                default :
                    converted += '\n\n' + m + '\n\n';
            }
            s = s.substring(i + m.length);
        }
        converted += mdConvert(s);

        if (WRAP_GLOBAL_DIV) converted = '<div markdown="1">\n' + converted + '\n</div>';

        return converted;
    }

    /**
     * Replaces HTML with Markdown markup.
     *
     * @param input string to convert
     *
     * @return the converted string
     */
    function mdConvert(input) {
        var converted = input;

        converted = converted.replace(/<(ul|ol).*?>([\s\S]*?)<\/\1>/igm, ulOlNestingDetector);

        converted = convertBlockquote(convertOl(converted)).replace(/<p>/igm, '\n').replace(/<\/p>/igm, '\n')
        .replace(/><(strong|b)>/igm, '> **').replace(/<\/(strong|b)></igm, '** <').replace(/<\/?(strong|b)>/igm, '**')
        .replace(/><(em|i)>/igm, '> _').replace(/<\/(em|i)></igm, '_ <').replace(/<\/?(em|i)>/igm, '_')
        .replace(/<\/?ul>/igm, '\n')
        .replace(/<li>/igm, '* ').replace(/<\/li>/igm, '')
        .replace(/<h1\s+id="([-\w]+)">(.*?)<\/h1>/igm, '\n# $2 {#$1}\n')
        .replace(/<h2\s+id="([-\w]+)">(.*?)<\/h2>/igm, '\n## $2 {#$1}\n')
        .replace(/<h3\s+id="([-\w]+)">(.*?)<\/h3>/igm, '\n### $2 {#$1}\n')
        .replace(/<h4\s+id="([-\w]+)">(.*?)<\/h4>/igm, '\n#### $2 {#$1}\n')
        .replace(/<h5\s+id="([-\w]+)">(.*?)<\/h5>/igm, '\n##### $2 {#$1}\n')
        .replace(/<h6\s+id="([-\w]+)">(.*?)<\/h6>/igm, '\n###### $2 {#$1}\n')
        .replace(/<h1>/igm, '\n# ').replace(/<h2>/igm, '\n## ').replace(/<h3>/igm, '\n### ').replace(/<h4>/igm, '\n#### ').replace(/<h5>/igm, '\n##### ').replace(/<h6>/igm, '\n###### ').replace(/<\/h[123456]>/igm, '\n')
        .replace(/<a href="([^"]+)">([^<]+)<\/a>/igm, '[$2]($1)')
        .replace(/<a href="([^"]+)" title="([^"]+)">([^<]+)<\/a>/igm, '[$3]($1 "$2")')
        .replace(/<hr ?\/?>/, '\n- - -\n')
        ;
        converted = ignore_BR ? converted.replace(/<br ?\/?>/gm, '<br>\n')
        : converted.replace(/<br ?\/?>/gm, '  \n');

        converted = converted.replace(/\n{3,}/gm, '\n\n');
        converted = converted.replace(/(^\n+|\n+$)/g, '');

        return converted;
    }


    /** Convert ol > li to 1. */
    function convertOl(str) {
        var r = str;
        var pat = /<ol>([\s\S]*?)<\/ol>/mi;  //[\s\S] = dotall; ? = non-greedy match
        var lipat = /<li>/i;
        for (var mat; (mat = r.match(pat)) !== null; ) {
            mat = mat[1].replace(/<\/li>/igm, '')/*.replace(/<li>/igm, '1. ')*/;
            for (var c = 1; mat.search(lipat) !== -1; c++) {
                mat = mat.replace(lipat, c + '. ');
            }
            r = r.replace(pat, '\n' + mat + '\n');
        }
        return r;
    }

    /** Convert simple blockquote. */
    function convertBlockquote(str) {
        var r = str;
        //r = r.replace(/<(blockquote).*?>([\s\S]*?)<\/\1>/igm, blockquoteNestingDetector);
        var pat = /<blockquote>\n?([\s\S]*?)\n?<\/blockquote>/mi;  //[\s\S] = dotall; ? = non-greedy match
        for (var mat; (mat = r.match(pat)) !== null; ) {
            mat = mat[1].replace(/\n/gm, '\n> ').replace(/<p>/igm, '\n> ').replace(/<\/p>/igm, '\n> \n> ')
                .replace(/(\n> ?){3,}/gm,'\n> \n> ');
            r = r.replace(pat, '\n' + mat + '\n');
        }
        return r;
    }


})(jQuery);
