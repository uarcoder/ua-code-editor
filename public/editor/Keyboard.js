const Keyboard = Kai.Keyboard = class {
  constructor() {
    this.dom = new Kai.Dom()
    this.input = this.dom.createTag({
      tagName: "input",
      className: "keyboard__input",
      type: "append",
      node: document.querySelector(".kai-app")
    })

    this.canvas = this.dom.createTag({
      tagName: "canvas",
      className: "canvas",
      type: "append",
      node: document.body
    })

    this.onBeforeinput = e => {}
    this.onInput = e => {}
    this.onFocus = e => {}
    this.onBlur = e => {}

    this.isBackspacePressed = false

    this.input.addEventListener("beforeinput", e => {
      this.onBeforeInput(e)
    })

    this.input.addEventListener("input", e => {
      this.onInput(e)
    })

    this.input.onfocus = e => {
      this.onFocus(e)
    }

    this.input.onblur = e => {
      this.onBlur(e)
    }
  }

  keypress(e) {

  }
}


const keyboardEvent = new Keyboard()
const ctx = keyboardEvent.canvas.getContext("2d")
const measureText = char => ctx.measureText(char)
