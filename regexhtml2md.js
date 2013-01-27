/*
 * p-value one sample simulator v1.
 *
 * Copyright (C) 2013 ibex from Patientensicht.ch
 *
 * Homepage: <http://patientensicht.ch/node/169>
 *
 * Changelog:
 * - 26.01.2013: Clean up by ibex
 * - 02.01.2013: Initial version by ibex
 *
 *
 * Dependencies:
 * - jStat <https://github.com/jstat/jstat>
 * - jQuery <http://jquery.com/>
 * - jQuery UI <http://jqueryui.com/>
 *
 *
 * HMTL code to run this script:
 * <div title="Sample code for p-value one sample simulator">
 *     <div id="p1s-simulation"></div>
 *
 *     < style>@import url("/misc/ui/jquery.ui.slider.css?mg24xt");</style>                                                                *
 *     <style>
 *            .tight-rows-min th, .tight-rows-min td {
 *             padding: 1px 1px;
 *     }
 *     </style>
 *
 *     <script src="/misc/ui/jquery.ui.widget.min.js?v=1.8.7"></script>
 *     <script src="/misc/ui/jquery.ui.mouse.min.js?v=1.8.7"></script>
 *     <script src="/misc/ui/jquery.ui.slider.min.js?v=1.8.7"></script>
 *     <script src="/sites/all/libraries/jstat/jstat.js?v=1"></script>
 *     <script src="/pathToScript/pval_1sample_simulator1.js?v=1.0"></script>
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

    /** "Main function" */
    $(function() {
            // Output simulation UI as HTML
            $('#regexhtml2md').html('\
<h3>HTML-Input</h3>\
<div>\
<textarea id="rhtml2md-input" rows="5" cols="60" wrap="off" class="overflow: auto; font-family: monospace;" placeholder="Please enter your HTML text here.">\
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
</div>\
\
<div style="text-align:center;"><button id="rhtml2md-convert" type="button" autofocus title="Starts the conversion" style="margin-top: 1em; margin-bottom: 1em; font-size: x-large;" class="no-print">Convert</button></div>\
\
<div id="rhtml2md-output"></div>\
            ');

        // Additional CSS styling
        //$('#p1s-summary tr th:nth-child(2), #p1s-summary tr td:nth-child(2)').css({'text-align': 'right'});

        // Bind start button
        $("#rhtml2md-convert").click(function(event) {
            event.preventDefault();
            var input = $('#rhtml2md-input').val();
            convert(input);
        });
    });

    /**
     * Runs a simulation with a sample size n and runs runs and the probability p0 for 0.
     *
     * @param n Sample size
     * @param runs Number of runs
     * @param p0 Actual probability for 0
     *
     * @return true
     */
    function convert(input) {
//         """Converts HTML tags with MD."""
//         text = re.compile(r'<p>').sub(r'', text)
//         text = re.compile(r'</p>').sub(r'\n\n', text)
//         text = re.compile(r'<br ?/?>').sub(r'  \n', text)
//         text = re.compile(r'</?strong>').sub(r'**', text)
//         text = re.compile(r'</?em>').sub(r'_', text)
//         text = re.compile(r'</?ul>').sub(r'\n', text)
//         text = re.compile(r'</li>').sub(r'', text)
//         text = re.compile(r'<li>').sub(r'* ', text)
//         text = re.compile(r'<h1>').sub(r'# ', text)
//         text = re.compile(r'<h2>').sub(r'## ', text)
//         text = re.compile(r'<h3>').sub(r'### ', text)
//         text = re.compile(r'<h4>').sub(r'#### ', text)
//         text = re.compile(r'<h5>').sub(r'##### ', text)
//         text = re.compile(r'</h[12345]>').sub(r'', text)
//         text = re.compile(r'<a href="([^"]+)">([^<]+)</a>').sub(r'[\2](\1)', text)
//         text = re.compile(r'<a href="([^"]+)" title="([^"]+)">([^<]+)</a>').sub(r'[\3](\1 "\2")', text)

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
        // Write result output
        $('#rhtml2md-output').html('\
<h3>Markdown Extra Output</h3>\
<textarea id="rhtml2md-output-md" rows="5" cols="60" wrap="off" style="overflow: auto; font-family: monospace;"></textarea>\
');

        $('#rhtml2md-output-md').text(converted);
        $('#rhtml2md-output-md').select();

        return true;
    }

})(jQuery);
