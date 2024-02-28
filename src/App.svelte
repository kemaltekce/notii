<script lang="ts">
  import Welcome from './lib/Welcome.svelte'

  let text: string = ''
  let focused: boolean = false
  let contentRef: HTMLElement

  window.api.onSendData(async (data: string) => {
    text = data
  })

  function log(data: string) {
    window.api.logData(data)
  }

  function focusIfNotFocused(event: any) {
    if (!focused) {
      event.preventDefault()
      contentRef.focus()
      setCaret(contentRef)
    }
  }

  function setCaret(contentEditableElement: HTMLElement) {
    let range: any
    let selection: any
    range = document.createRange()
    range.selectNodeContents(contentEditableElement)
    range.collapse(false)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
</script>

<svelte:window on:keydown={focusIfNotFocused} />

<main class="">
  <Welcome />
  <div
    role="textbox"
    tabindex="0"
    contenteditable="true"
    data-text="Start typing"
    class="w-full mt-7 px-3"
    bind:innerText={text}
    bind:this={contentRef}
    on:keydown={() => log(text)}
    on:focus={() => {
      focused = true
    }}
    on:blur={() => {
      focused = false
    }}
  />
</main>

<style>
  ::-webkit-scrollbar {
    display: none;
  }
  [contenteditable='true']:empty:not(:focus):before {
    content: attr(data-text);
  }
  [contenteditable] {
    outline: none;
  }
</style>
