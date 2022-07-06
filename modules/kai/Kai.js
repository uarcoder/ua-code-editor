class Kai {
  constructor() {


  }

  switchEditors(editors) {
    window.addEventListener("click", e => {
      kai.editorFocus(e, editors)
    })
  }

  editorFocus(e, editors) {
    editors.forEach(editor=> {
      editor.cursor.passive()
    })
    editors.forEach(editor => {
      if (editors[0].isClickNode(e.target, editor.linesWrapper)) {
        if (editor.isFocus === true) editor.isFocus = 1
        if (editor.isFocus === false) {
          editor.isFocus = true
          editor.kai.isFocused = true
        }
        editor.targetEvent(e)
      } else {
        editor.isFocus = false
        editor.kai.isFocused = false
      }
    })
  }
}
