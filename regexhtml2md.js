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

(function ($) {

    var areastyle = 'font-size: small; overflow: auto; font-family: monospace; width:100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;';

    /** "Main function" */
    $(function() {
        // Output simulation UI as HTML
        $('#regexhtml2md').html('\
<h3>HTML-Input</h3>\
<div>\
<textarea id="rhtml2md-input" autofocus rows="10" cols="60" wrap="off" style="' + areastyle + '" placeholder="Please enter your HTML text here.">\
<p><strong>Im Gesundheitswesen gibt es viele Lobbygruppen – die Ärzteschaft, die Pharmaindustrie, die Apotheker, die Krankenkassen, … Ihre Interessen werden vertreten. Wer vertritt die Patienten und&nbsp;Bürger? Die Patienten selber? Lassen die Krankheiten das überhaupt zu?</strong></p>\n\
<p><strong>Wie läuft die medizinische Forschung ab? Wer forscht? Was wird geforscht? Wer bezahlt die Forschung?</strong><!--break--></p>\n\
<p>Er betrachtet das Gesundheitswesens und die Wissenschaft mit den Augen eines Patienten und Bürgers -- kurz <em>aus Patientensicht</em>.</p>\n\
<p>Es sollen die Interessen von Bürgern und Patienten eingebracht und vertreten werden. Ja, Patienten und Bürgern. Denn jeder Patient ist auch ein Bürger und jeder Bürger wird früher oder später einmal zum Patienten. Und als Bürger zahlen wir alle die Rechnung.</p>\n\
<p>Ich habe mich in den letzten zwei Jahren mit der medizinischen Forschung und der Gesundheitspolitik befasst. Dieses Wissen möchte ich weitergeben und auf wichtige Punkte aufmerksam machen. Einige Themen, finde ich, werden im deutschsprachigen Raum noch zu wenig wahrgenommen und diskutiert, so zum Beispiel die Thematik der Interessenkonflikte.</p>\n\
<p><ul>\n\
<li>Foo</li>\n\
<li>Bar</li>\n\
</ul>\n\
<p><a href="http://patientensicht.ch">Patientensicht</a></p>\n\
<p><a href="http://patientensicht.ch" title="Besuche mich">Patientensicht</a></p>\n\
</textarea>\
<p>To convert, press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> or click on the "Convert" button.\</p>\
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

        var converted = input.replace(/<p>/igm, "").replace(/<\/p>/igm, "\n")
            .replace(/<br ?\/?>/igm, "  \n")
            .replace(/<\/?strong>/igm, "**")
            .replace(/<\/?em>/igm, "_")
            .replace(/<\/?ul>/igm, "")
            .replace(/<li>/igm, "* ").replace(/<\/li>/igm, "")
            .replace(/<h1>/igm, "# ").replace(/<h2>/igm, "## ").replace(/<h3>/igm, "### ").replace(/<h4>/igm, "#### ").replace(/<h5>/igm, "##### ").replace(/<\/h[12345]>/igm, "")
            .replace(/<a href="([^"]+)">([^<]+)<\/a>/igm, "[$2]($1)")
            .replace(/<a href="([^"]+)" title="([^"]+)">([^<]+)<\/a>/igm, "[$3]($1 \"$2\")")
        ;

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

})(jQuery);
