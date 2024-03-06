<script lang="ts">
  import CodeMirror from 'svelte-codemirror-editor'
  import { EditorView } from 'codemirror'
  import { markdown } from '@codemirror/lang-markdown'
  import {
    HighlightStyle,
    syntaxHighlighting,
    bracketMatching,
  } from '@codemirror/language'
  import { tags, Tag, styleTags } from '@lezer/highlight'
  import { vim } from '@replit/codemirror-vim'
  import { awesome_line_wrapping_plugin } from './js/linewrapping'

  const customTags = {
    lineThrough: Tag.define(),
    list: Tag.define(),
    listMarker: Tag.define(),
    task: Tag.define(),
    taskMarker: Tag.define(),
    done: Tag.define(),
    doneMarker: Tag.define(),
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
        // lineThroughMark: defaultTags.processingInstruction,
        lineThrough: customTags.lineThrough,
      }),
    ],
  }

  class doneParser {
    nextLine() {
      return false
    }
    finish(cx: any, leaf: any) {
      cx.addLeafElement(
        leaf,
        cx.elt('done', leaf.start, leaf.start + leaf.content.length, [
          cx.elt('doneMarker', leaf.start, leaf.start + 4),
          ...cx.parser.parseInline(leaf.content.slice(4), leaf.start + 4),
        ])
      )
      return true
    }
  }
  const done = {
    name: 'done',
    // defineNodes: [
    //   { name: 'done', block: true, style: tags.list },
    //   { name: 'doneMarker', style: tags.atom },
    // ],
    defineNodes: ['done', 'doneMarker'],
    parseBlock: [
      {
        name: 'done',
        leaf(cx: any, leaf: any) {
          const regex = new RegExp('\\[[xX]\\]\\s')
          return regex.test(leaf.content) && cx.parentType().name == 'ListItem'
            ? new doneParser()
            : null
        },
      },
    ],
    props: [
      styleTags({
        doneMarker: customTags.doneMarker,
        done: customTags.done,
      }),
    ],
  }

  class taskParser {
    nextLine() {
      return false
    }
    finish(cx: any, leaf: any) {
      cx.addLeafElement(
        leaf,
        cx.elt('task', leaf.start, leaf.start + leaf.content.length, [
          cx.elt('taskMarker', leaf.start, leaf.start + 4),
          ...cx.parser.parseInline(leaf.content.slice(4), leaf.start + 4),
        ])
      )
      return true
    }
  }

  const task = {
    name: 'task',
    defineNodes: ['task', 'taskMarker'],
    parseBlock: [
      {
        name: 'task',
        leaf(cx: any, leaf: any) {
          const regex = new RegExp('\\[[\\s]\\]\\s')
          return regex.test(leaf.content) && cx.parentType().name == 'ListItem'
            ? new taskParser()
            : null
        },
      },
    ],
    props: [
      styleTags({
        taskMarker: customTags.taskMarker,
        task: customTags.task,
      }),
    ],
  }

  const list = {
    props: [
      styleTags({
        ListMark: customTags.listMarker,
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
      { tag: customTags.task, class: 'task' },
      { tag: customTags.taskMarker, class: 'task-marker' },
      { tag: customTags.list, class: 'list' },
      { tag: customTags.listMarker, class: 'list-marker' },
      { tag: customTags.done, class: 'done' },
      { tag: customTags.doneMarker, class: 'done-marker' },
    ])
  )

  let extensions = [
    vim(),
    styles,
    bracketMatching({ brackets: '{}' }),
    EditorView.lineWrapping,
    awesome_line_wrapping_plugin,
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
    '.cm-line:not(.cm-activeLine) .list-marker, .cm-line:not(.cm-activeLine) .task-marker, .cm-line:not(.cm-activeLine) .done-marker':
      {
        'font-size': '1px',
      },
    '.cm-line:not(.cm-activeLine) .list-marker:not(:has(+ .task-marker)):not(:has(+ .done-marker))::before':
      {
        content: '"-"',
        'font-size': '1rem',
      },
    '.cm-line:not(.cm-activeLine) .list-marker:has(+ .task-marker)::before': {
      content: '"\\25AA"',
      'font-size': '1rem',
    },
    '.cm-line:not(.cm-activeLine) .done': {
      color: '#c4c4c4',
    },
    '.cm-line:not(.cm-activeLine) .list-marker:has(+ .done-marker)::before': {
      content: '"\\2718"',
      'font-size': '1rem',
      color: '#c4c4c4',
    },
  }

  let value: string = ''
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
            task,
            done,
            list,
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
