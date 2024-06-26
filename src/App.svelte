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
  import { Vim, vim } from '@replit/codemirror-vim'
  import { awesome_line_wrapping_plugin } from './js/linewrapping'
  import backgroundSoundUrl from './assets/background.mp3'

  const customTags = {
    lineThrough: Tag.define(),
    lineThroughMark: Tag.define(),
    list: Tag.define(),
    listMarker: Tag.define(),
    task: Tag.define(),
    taskMarker: Tag.define(),
    done: Tag.define(),
    doneMarker: Tag.define(),
    strong: Tag.define(),
    emphasis: Tag.define(),
    emphasisMark: Tag.define(),
    code: Tag.define(),
    codeMark: Tag.define(),
    codeText: Tag.define(),
    quoteMark: Tag.define(),
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
        lineThroughMark: customTags.lineThroughMark,
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
        StrongEmphasis: customTags.strong,
        Emphasis: customTags.emphasis,
        EmphasisMark: customTags.emphasisMark,
        InlineCode: customTags.code,
        CodeMark: customTags.codeMark,
        CodeText: customTags.codeText,
        QuoteMark: customTags.quoteMark,
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
      { tag: customTags.lineThroughMark, class: 'linethrough-marker' },
      { tag: customTags.task, class: 'task' },
      { tag: customTags.taskMarker, class: 'task-marker' },
      { tag: customTags.list, class: 'list' },
      { tag: customTags.listMarker, class: 'list-marker' },
      { tag: customTags.done, class: 'done' },
      { tag: customTags.doneMarker, class: 'done-marker' },
      { tag: customTags.strong, class: 'strong' },
      { tag: customTags.emphasis, class: 'emphasis' },
      { tag: customTags.emphasisMark, class: 'emphasis-marker' },
      { tag: customTags.code, class: 'code' },
      { tag: customTags.codeMark, class: 'code-marker' },
      { tag: customTags.codeText, class: 'code-text' },
      { tag: customTags.quoteMark, class: 'quote-marker' },
    ])
  )

  let cmStyles = {
    '.cm-activeLine': {
      'background-color': 'transparent',
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
    // horizontal line
    '.cm-line:has(.separator):not(.cm-activeLine):not(:has(.cm-selectionMatch))':
      {
        color: '#00000000',
        background:
          'linear-gradient(to top, #FEFEFE 44%, #c4c4c4 44%, #c4c4c4 56%, #FEFEFE 56%)',
      },
    '.cm-line:has(.code-marker):not(:has(.code)):not(.cm-activeLine):not(:has(.cm-selectionMatch))':
      {
        color: '#00000000',
        background: '#fcd0a5',
        // 'linear-gradient(to top, #FEFEFE 44%, #c4c4c4 44%, #c4c4c4 56%, #FEFEFE 56%)',
      },
    // inline
    '.linethrough': {
      'text-decoration': '3px #be9cf3 wavy line-through',
      // color: '#c4c4c4',
    },
    '.strong': {
      'font-weight': 'bold',
    },
    '.emphasis': {
      'font-style': 'italic',
      color: '#d14c4c',
    },
    '.code': {
      background: '#fcd0a5',
      padding: '0 7px',
      'border-radius': '3px',
    },
    '.cm-line:has(.code-text)': {
      background: '#fcd0a5',
    },
    // '.cm-line:has(.quote-marker):not(.cm-activeLine):not(:has(.cm-selectionMatch))':
    //   {
    //     'border-left': '3px solid #c4c4c4',
    //     'margin-left': '0.5rem',
    //   },
    '.cm-line:not(.cm-activeLine):not(:has(.cm-selectionMatch)) .quote-marker::before':
      {
        content: '"\\00a0"',
        'border-left': '3px solid #c4c4c4',
        'font-size': '1rem',
      },
    '.cm-line:not(.cm-activeLine):not(:has(.cm-selectionMatch)) .emphasis-marker':
      {
        'font-size': '1px',
      },
    '.cm-line:not(.cm-activeLine):not(:has(.cm-selectionMatch)) .code-marker':
      {
        'font-size': '1px',
      },
    '.cm-line:not(.cm-activeLine):not(:has(.cm-selectionMatch)) .quote-marker':
      {
        'font-size': '1px',
      },
    '.cm-line:not(.cm-activeLine):not(:has(.cm-selectionMatch)) .linethrough-marker':
      {
        'font-size': '1px',
      },
    // list, task, done
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

  function addStringAroundSelection(
    selection: { to: number; from: number },
    str: string
  ) {
    view.dispatch({
      changes: {
        from: selection.to,
        to: selection.to,
        insert: str,
      },
    })
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.from,
        insert: str,
      },
    })
  }

  function deleteStringAroundSelection(
    selection: { to: number; from: number },
    str: string
  ) {
    view.dispatch({
      changes: {
        from: selection.to,
        to: selection.to + str.length,
        insert: '',
      },
    })
    view.dispatch({
      changes: {
        from: selection.from - str.length,
        to: selection.from,
        insert: '',
      },
    })
  }

  Vim.unmap('j')
  Vim.unmap('k')
  Vim.map('j', 'g<Down>')
  Vim.map('k', 'g<Up>')

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
      keydown: (event: KeyboardEvent, view: any) => {
        const hotkeys: { [key: string]: string } = {
          b: '**',
          j: '*',
          k: '`',
          l: '--',
        }
        const cursor = view.state.selection.main.head
        const line = view.state.doc.lineAt(cursor)
        const lineStart: number = line.from
        let text: string = line.text
        const indent: number = text.split(/[^\s]/)[0].length
        if (event.metaKey && event.shiftKey && event.key === 'i') {
          // task to done
          if (/^\s*-\s\[[\s]\]\s/.test(text)) {
            view.dispatch({
              changes: {
                from: lineStart + indent,
                to: lineStart + indent + 6,
                insert: '- [x] ',
              },
            })
            // done to note
          } else if (/^\s*-\s\[[xX]\]\s/.test(text)) {
            view.dispatch({
              changes: {
                from: lineStart + indent,
                to: lineStart + indent + 6,
                insert: '',
              },
            })
            // note to task
          } else if (/^\s*-\s/.test(text)) {
            view.dispatch({
              changes: {
                from: lineStart + indent,
                to: lineStart + indent + 2,
                insert: '- [ ] ',
              },
            })
          } else {
            view.dispatch({
              changes: {
                from: lineStart + indent,
                to: lineStart + indent,
                insert: '- ',
              },
            })
          }
          // add and remove tags/highlights
        } else if (event.metaKey && event.key === 'h') {
          const heading = /^\s*\#{1,3}\s/
          const headingLength = heading.test(text)
            ? text.match(heading)![0].trim().length
            : 0
          const nextHeading = (headingLength + 1) % 4
          const space = headingLength ? 0 : 1
          const removeSpace = headingLength === 3 ? 1 : 0
          view.dispatch({
            changes: {
              from: lineStart + indent,
              to: lineStart + indent + headingLength + removeSpace,
              insert: '#'.repeat(nextHeading) + ' '.repeat(space),
            },
          })
        } else if (event.metaKey && Object.keys(hotkeys).includes(event.key)) {
          const selection = view.state.selection.main
          const str = hotkeys[event.key]
          const before = view.state.sliceDoc(
            selection.from - str.length,
            selection.from
          )
          const after = view.state.sliceDoc(
            selection.to,
            selection.to + str.length
          )
          if (before === str && after === str) {
            deleteStringAroundSelection(selection, str)
          } else {
            addStringAroundSelection(selection, str)
          }
        }
      },
    }),
  ]

  let value: string = '- [ ] asdfasdf'
  let focused: boolean = false
  let view: any
  let withVim: boolean = true
  const audioLoop = new Audio(backgroundSoundUrl)
  audioLoop.loop = true
  audioLoop.volume = 0.3
  let loopPlaying: boolean = false

  window.api.onSendData(async (data: string) => {
    value = data
  })

  window.api.onTurnOnOffVim(async () => {
    changeVimMode()
  })

  function save(data: string) {
    window.api.saveData(data)
  }

  function focusIfNotFocused(event: any) {
    if (!focused) {
      event.preventDefault()
      view.focus()
    }
  }

  function changeVimMode() {
    if (withVim) {
      extensions = extensions.slice(1)
      withVim = false
    } else {
      extensions = [vim(), ...extensions]
      withVim = true
    }
  }

  function playPauseMusic() {
    if (loopPlaying) {
      audioLoop.pause()
    } else {
      audioLoop.play()
    }
    loopPlaying = !loopPlaying
  }
</script>

<svelte:window on:keydown={focusIfNotFocused} />

<main class="px-3 py-3 h-screen">
  <div
    class="
    flex flex-col justify-between px-5 py-4 bg-[#FEFEFE] h-full rounded-[7px] border-[#c4c4c450] border-[1px]"
  >
    <div class="flex flex-row justify-between font-semibold">
      <button on:click={changeVimMode}>(っ ᵔ-ᵔ)っ</button>
      <button on:click={playPauseMusic}>♪♪♪ ヽ(ᵔ-ᵔ )ゞ</button>
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
        on:change={() => save(value)}
        on:ready={(e) => {
          view = e.detail
        }}
        {extensions}
        styles={cmStyles}
      />
    </div>
    <!-- <div class="flex flex-row justify-end text-[#C4C4C4] font-light">
      <button on:click={() => (value = '')}>clear</button>
      <div />
    </div> -->
  </div>
</main>

<style>
  ::-webkit-scrollbar {
    display: none !important;
  }
</style>
