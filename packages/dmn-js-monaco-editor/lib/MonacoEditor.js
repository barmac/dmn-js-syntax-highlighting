/**
 * This file contains source code adapted from declab (licensed Apache-2.0).
 *
 * Copyright 2020 Materna Information & Communications SE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @see https://github.com/materna-se/declab/blob/efa78fa/client/src/components/dmn/dmn-editor.vue
 */

import * as monaco from 'monaco-editor';

export default function MonacoEditor(config) {

  this.init();

  // API
  this.getEditor = function(container) {

    const monacoEditor = monaco.editor.create(
      container,
      {
        language: 'feel-language',
        theme: 'feel-theme',
        fontSize: 15,
        contextmenu: false,
        lineNumbersMinChars: 1,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        scrollbar: {
          useShadows: false
        },
        minimap: {
          enabled: false
        },
        value: this.value
      }
    );

    const editor = {};


    editor.setContent = function(newContent) {
      monacoEditor.setValue(newContent);
    };

    editor.attachTo = function(parentNode) {
      parentNode.appendChild(monacoEditor.getDomNode());
    };

    editor.detach = function() {
      const domNode = monacoEditor.getDomNode();

      if (domNode.parentNode) {
        domNode.parentNode.removeChild(domNode);
      }
    };

    const changeDetector = new ChangeDetector(monacoEditor);

    editor.onChange = function(fn) {
      changeDetector.on(fn);
    };

    editor.offChange = function(fn) {
      changeDetector.off(fn);
    };

    return editor;
  };
}

MonacoEditor.$inject = [ 'config.codeEditor' ];

MonacoEditor.prototype.init = function() {

  // Initialize language
  monaco.languages.register({ id: 'feel-language' });
  monaco.languages.setMonarchTokensProvider('feel-language', {
    tokenizer: {
      root: [
        [/(?:true|false)/, 'feel-boolean'],
        [/[0-9]+/, 'feel-numeric'],
        [/(?:"(?:.*?)")/, 'feel-string'],
        [/(?:(?:[a-z ]+\()|(?:\()|(?:\)))/, 'feel-function'],
        [/(?:if|then|else)/, 'feel-keyword'],
        [/(?:for|in|return)/, 'feel-keyword']
      ]
    }
  });
  monaco.languages.registerCompletionItemProvider('feel-language', {
    provideCompletionItems: function() {
      const suggestions = [];
      const suggestionTypes = {
        Snippet: [
          ['if', 'if $1 then\n\t$0\nelse\n\t'],
          ['for', 'for element in $1 return\n\t$0']
        ],
        Function: [

          // String
          [
            'substring(string, start position, length?)',
            'substring($1, $2, $3)'
          ],
          ['string length(string)', 'string length($1)'],
          ['upper case(string)', 'upper case($1)'],
          ['lower case(string)', 'lower case($1)'],
          ['substring before(string, match)', 'substring before($1, $2)'],
          ['substring after(string, match)', 'substring after($1, $2)'],
          [
            'replace(input, pattern, replacement, flags?)',
            'replace($1, $2, $3, $4)'
          ],
          ['contains(string, match)', 'contains($1, $2)'],
          ['starts with(string, match)', 'starts with($1, $2)'],
          ['ends with(string, match)', 'ends with($1, $2)'],
          ['matches(input, pattern, flags?)', 'matches($1, $2, $3)'],
          ['split(string, delimiter)', 'split($1, $2)'],

          // List
          ['list contains(list, element)', 'list contains($1, $2)'],
          ['count(list)', 'count($1)'],
          ['min(list)', 'min($1)'],
          ['max(list)', 'max($1)'],
          ['sum(list)', 'sum($1)'],
          ['mean(list)', 'mean($1)'],
          ['and(list)', 'and($1)'],
          ['or(list)', 'or($1)'],
          ['sublist(list, start position, length?)', 'sublist($1, $2, $3)'],
          ['append(list, item...)', 'append($1, $2)'],
          ['concatenate(list...)', 'concatenate($1)'],
          [
            'insert before(list, position, newItem)',
            'insert before($1, $2, $3)'
          ],
          ['remove(list, position)', 'remove($1, $2)'],
          ['reverse(list)', 'remove($1)'],
          ['index of(list, match)', 'index of($1, $2)'],
          ['union(list...)', 'union($1)'],
          ['distinct values(list)', 'distinct values($1)'],
          ['flatten(list)', 'flatten($1)'],
          ['product(list)', 'product($1)'],
          ['median(list)', 'median($1)'],
          ['stddev(list)', 'stddev($1)'],
          ['mode(list)', 'mode($1)'],

          // Number
          ['decimal(n, scale)', 'decimal($1, $2)'],
          ['floor(n)', 'floor($1)'],
          ['ceiling(n)', 'ceiling($1)'],
          ['abs(n)', 'abs($1)'],
          ['modulo(dividend, divisor)', 'modulo($1, $2)'],
          ['sqrt(number)', 'sqrt($1)'],
          ['log(number)', 'log($1)'],
          ['exp(number)', 'exp($1)'],
          ['odd(number)', 'odd($1)'],
          ['even(number)', 'even($1)'],

          // Boolean
          ['not(negand)', 'not($1)']
        ]
      };
      for (const key in suggestionTypes) {
        for (const suggestion of suggestionTypes[key]) {
          suggestions.push({
            kind: monaco.languages.CompletionItemKind[key],
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            label: suggestion[0],
            insertText: suggestion[1]
          });
        }
      }
      return {
        suggestions: suggestions
      };
    }
  });

  // Initialize monaco theme
  monaco.editor.defineTheme('feel-theme', {
    base: 'vs',
    inherit: false, // We don't want to inherit rules
    rules: [
      { token: 'feel-keyword', foreground: 'ec5b69', fontStyle: 'bold' }, // Lighter foreground color to counteract the bold font
      { token: 'feel-numeric', foreground: '005cc5' },
      { token: 'feel-boolean', foreground: 'd73a49' },
      { token: 'feel-string', foreground: '22863a' },
      { token: 'feel-function', foreground: '6f42c1' }
    ],
    colors: {
      'editorLineNumber.foreground': '#000000'
    }
  });
};


function ChangeDetector(editor) {
  const listeners = new Map();

  function on(listener) {
    const disposable = editor.onKeyUp(() => {
      const value = editor.getValue();

      listener(value);
    });

    listeners.set(listener, disposable);
  }

  function off(listener) {
    const disposable = listeners.get(listener);

    disposable.dispose();
    listeners.delete(listener);
  }

  // API
  this.on = on;
  this.off = off;
}
