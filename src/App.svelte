<script lang="ts">
  import CodeMirror from 'svelte-codemirror-editor'
  import { EditorView } from 'codemirror'
  import { markdown } from '@codemirror/lang-markdown'
  import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
  import { tags, Tag, styleTags } from '@lezer/highlight'
  import { vim } from '@replit/codemirror-vim'

  const customTags = {
    lineThrough: Tag.define(),
  }

  const lineThroughDelim = { resolve: 'lineThrough', mark: 'lineThroughMark' }

  const lineThrough = {
    defineNodes: ['lineThrough', 'lineThroughMark'],
    parseInline: [
      {
        name: 'lineThrough',
        parse(cx: any, next: any, pos: any) {
          if (next != 45 /* '-' */ || cx.char(pos + 1) != 45) {
            return -1
          }
          return cx.addDelimiter(lineThroughDelim, pos, pos + 2, true, true)
        },
        after: 'Emphasis',
      },
    ],
    props: [
      styleTags({
        // HighlightMark: defaultTags.processingInstruction,
        lineThrough: customTags.lineThrough,
      }),
    ],
  }

  const styles = syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.heading1, fontSize: '2rem', fontWeight: 'bold' },
      { tag: tags.heading2, fontSize: '1.5rem', fontWeight: 'bold' },
      { tag: tags.heading3, fontSize: '1.25rem', fontWeight: 'bold' },
      { tag: tags.strong, fontWeight: 'bold' },
      { tag: tags.emphasis, fontStyle: 'italic' },
      { tag: tags.contentSeparator, class: 'separator' },
      { tag: customTags.lineThrough, class: 'linethrough' },
    ])
  )

  let extensions = [
    vim(),
    styles,
    EditorView.lineWrapping,
    EditorView.domEventHandlers({
      focus: () => {
        focused = true
      },
      blur: () => {
        focused = false
      },
    }),
  ]
  const cmStyles = {
    '.cm-activeLine': {
      'background-color': 'transparent !important',
    },
    '.cm-gutters': {
      display: 'none',
    },
    '.cm-line': {
      padding: '0 1px',
    },
    '.cm-scroller': {
      'overflow-x': 'clip',
    },
    '.cm-line:has(.separator):not(.cm-activeLine):not(:has(.cm-selectionMatch))':
      {
        color: '#00000000',
        background:
          'linear-gradient(to top, #f9f9f9 44%, #c4c4c4 44%, #c4c4c4 56%, #f9f9f9 56%)',
      },
    '.linethrough': {
      'text-decoration': 'line-through',
    },
  }

  let value: string = '--hallo-- \n\n---'
  let focused: boolean = false
  let view: any

  // window.api.onSendData(async (data: string) => {
  //   value = data
  // })

  function log(data: string) {
    window.api.logData(data)
  }

  function focusIfNotFocused(event: any) {
    if (!focused) {
      event.preventDefault()
      view.focus()
    }
  }
</script>

<svelte:window on:keydown={focusIfNotFocused} />

<main class="px-3 py-3 h-screen">
  <div
    class="
    flex flex-col justify-between px-5 py-5 bg-[#f9f9f9] h-full rounded-[11px]"
  >
    <div class="flex flex-row justify-between font-bold">
      <div>(っ ᵔ-ᵔ)っ</div>
      <div>♪♪♪ ヽ(ᵔ-ᵔ )ゞ</div>
    </div>
    <div class="flex-1 overflow-scroll mt-5">
      <CodeMirror
        bind:value
        lang={markdown({
          extensions: [
            lineThrough,
            {
              remove: ['SetextHeading'],
            },
          ],
        })}
        on:change={() => log(value)}
        on:ready={(e) => {
          view = e.detail
        }}
        {extensions}
        styles={cmStyles}
      />
    </div>
    <div class="flex flex-row justify-end text-[#C4C4C4]">
      <button on:click={() => (value = '')}>clear</button>
      <div />
    </div>
  </div>
</main>

<style>
  ::-webkit-scrollbar {
    display: none !important;
  }
</style>
