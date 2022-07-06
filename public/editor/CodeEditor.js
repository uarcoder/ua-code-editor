let lastValue = null
let value = ""

const highlight = {
  operators: {
    val: ["const", "let", "class", "function"]
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

class CodeEditor {
  constructor(config) {
    this.settings = config || { width: 300, height: 100, fontSize: 12, fontFamily: "monospace" }
    this.landscapeWidth = this.settings.width
    this.landscapeHeight = this.settings.height
    this.lineHeight = this.settings.fontSize + 5
    this.scrollYHeight = this.settings.height + this.lineHeight
    this.kai = new Kai()
    this.dom = new Kai.Dom()
    this.keyboard = keyboardEvent
    ctx.font = `${this.settings.fontSize}px ${this.settings.fontFamily}`

    this.createTag = this.dom.createTag.bind(this.dom)



    this.numbersWrapperWidth = 30
    this.nextNumber = 1
    this.scrollY = 0
    this.scrollX = 0
    this.currentScrollY = 0
    this.currentScrollX = 0
    this.blurLine = null

    this.isOrientationPortrait = true

    this.isFocus = false
    this.isKeyboardVisible = false
    this.init()
    this.setCursorPosition()

  }

  init() {
    this.root = this.createTag({
      className: "code__editor",
      type: "append",
      node: this.settings.node,
      styles: {
        width: this.settings.width + "px",
        height: this.settings.height + "px",
        fontFamily: this.settings.fontFamily
      }
    })

    this.scrollYWrapper = this.createTag({
      className: "scrollY__wrapper",
      type: "append",
      node: this.root,
      styles: {
        width: this.settings.width + "px",
        height: this.settings.height + "px",
      }
    })
    this.numbersWrapper = this.createTag({
      className: "numbers__wrapper",
      type: "append",
      node: this.scrollYWrapper,
      styles: {
        flex: "0 1 " + this.numbersWrapperWidth + "px",
        height: this.scrollYHeight + "px"
      }
    })
    this.linesWrapper = this.createTag({
      className: "lines__wrapper",
      type: "append",
      node: this.scrollYWrapper,
      styles: {
        flex: "1 1 auto"
      }
    })
    const { width, height } = this.linesWrapper.getBoundingClientRect()
    this.scrollXWrapperWidth = width
    this.scrollXWrapper = this.createTag({
      className: "scrollX__wrapper",
      type: "append",
      node: this.linesWrapper,
      styles: {
        width: width + "px",
        height: height + "px"
      }
    })
    this.numbers = [this.createTag({
      className: "line__number_wrapper",
      type: "append",
      node: this.numbersWrapper,
      textContent: this.nextNumber,
      styles: {
        lineHeight: this.lineHeight + "px"
      }
    })]
    this.lines = [this.createTag({
        tagName: "pre",
        className: "line__wrapper active__row",
        type: "append",
        node: this.scrollXWrapper,
        textContent: "",
        styles: {
          width: this.scrollXWrapperWidth + "px",
          height: this.lineHeight + "px",
          lineHeight: this.lineHeight + "px",
          fontFamily: this.settings.fontFamily,
          fontSize: this.settings.fontSize + "px"
        }
      })
    ]
    this.inputs = [new Input()]
    this.cursor = new Cursor(this.scrollXWrapper, this.lineHeight)

    this.editorPosition = this.root.getBoundingClientRect()

    this.root.style.fontSize = this.settings.fontSize + "px"
    this.numbersWrapper.style.paddingTop = "15px"
    this.linesWrapper.style.paddingTop = "15px"
    this.numbersWrapper.style.fontSize = this.settings.fontSize + "px"
    this.lastLine = null
    this.lastLineNumber = null
    this.currentLine = this.isClickNode(this.lines[0])
    this.currentLineNumber = this.numbers[this.currentLine.id]

    if (this.settings.type === "fullscreen") {
      window.addEventListener("resize", e => {
        this.resize(e)
      })
    }

    this.root.addEventListener("scroll", this.scrollYEvent.bind(this))
    this.scrollXWrapper.addEventListener("scroll", this.scrollXEvent.bind(this))
    window.addEventListener("load", e => {
      this.startWidth = localStorage.getItem("startWidth") || window.innerWidth
      this.startHeight = localStorage.getItem("startHeight") || window.innerHeight
      localStorage.setItem("startHeight", this.startHeight)
    })

  }
  setCursorPosition() {
    let { x: clx, y } = this.currentLine.row.getBoundingClientRect()
    y = y - this.lines[0].getBoundingClientRect().y
    const input = this.inputs[this.currentLine.id]
    const x = input.cursorPosition.x + 5
    this.cursorPosition = { x, y }
    this.cursor.setPosition(x, y)
    if (this.isFocus) {
      this.cursor.active()
    } else {
      this.cursor.passive()
    }
  }

  isClickNode(target, node) {
    if (arguments.length === 1) {
      for (let i = 0; i < this.lines.length; i++) {
        const row = this.lines[i]
        if (row === target || row.contains(target)) return { row, id: i }
      }
      return false
    } else if (arguments.length === 2) {
      if (node === target || node.contains(target)) {
        return true
      }
      return false
    }

  }

  insertLineBreak() {
    const newLines = []
    const newLinesNumbers = []
    const newInputs = []
    let currentLine = null
    let currentLineNumber = null
    let idx = -1
    if (this.lines.length < 2) {
      this.currentLine = this.isClickNode(this.lines[0])
      this.currentLineNumber = this.numbers[0]
    }
    for (let i = 0; i < this.numbers.length; i++) {
      if (i > this.currentLine.id) {
        currentLineNumber = this.numbers[i]
        currentLineNumber.textContent = parseInt(currentLineNumber.textContent) + 1
      }
      newLinesNumbers.push(this.numbers[i])
      newLines.push(this.lines[i])
      newInputs.push(this.inputs[i])
      if (i === this.currentLine.id) {
        currentLineNumber = this.createTag({
          className: "line__number_wrapper",
          type: "afterend",
          node: this.currentLineNumber,
          textContent: i + 2,
          styles: {
            lineHeight: this.lineHeight + "px"
          }
        })
        currentLine = this.createTag({
          tagName: "pre",
          className: "line__wrapper active__row",
          type: "afterend",
          node: this.currentLine.row,
          styles: {
            width: this.scrollXWrapperWidth + "px",
            height: this.lineHeight + "px",
            lineHeight: this.lineHeight + "px",
            fontFamily: this.settings.fontFamily,
            fontSize: this.settings.fontSize + "px"
          }
        })
        idx = i + 1
        newLinesNumbers.push(currentLineNumber)
        newLines.push(currentLine)
        newInputs.push(new Input())
      }
    }

    this.numbers = [...newLinesNumbers]
    this.lines = [...newLines]
    this.inputs = [...newInputs]

    this.lastLine = this.currentLine
    this.lastLineNumber = this.currentLineNumber
    this.currentLine = this.isClickNode(this.lines[idx])
    this.currentLineNumber = this.numbers[this.currentLine.id]
    this.currentLinePosition = this.currentLine.row.getBoundingClientRect()
    this.scrollYHeight += this.lineHeight
    this.scrollYWrapper.style.height = this.scrollYHeight + "px"
    this.numbersWrapper.style.height = this.scrollYHeight + "px"
    this.scrollXWrapper.style.height = this.scrollYHeight + "px"
    if (this.lastLine) this.lastLine.row.classList.remove("active__row")
    this.setScrollY("insertLine")
    this.insertTextAfterCursor(this.lastLine, this.currentLine)
    this.setCursorPosition()
  }

  insertTextAfterCursor(lastLine, currentLine) {
    const lInput = this.inputs[lastLine.id]
    const cInput = this.inputs[currentLine.id]
    const cursorPosX = lInput.cursorPosition.x
    let lastText = ""
    let currentText = ""
    let lastSCW = 0
    let currentSCW = 0
    let sumCharWidths = 0
    for (let i = 0; i < lInput.text.length; i++) {
      const text = lInput.text[i]
      const sumCharWidth = this.getWidthChars(text)
      if (sumCharWidths < cursorPosX) {
        lastSCW += sumCharWidth
        lastText += text
      } else {
        currentSCW += sumCharWidth
        currentText += text
      }
      sumCharWidths += sumCharWidth
    }

    lInput.sumCharCode = lastSCW
    lInput.text = lastText
    cInput.sumCharCode = currentSCW
    cInput.text = currentText

    this.setLinesWidth(lastSCW, "insert")
    this.scrollX = 0
    this.scrollXWrapper.scroll(this.scrollX, 0)

    lastLine.row.innerHTML = this.highlightText(lInput)
    currentLine.row.innerHTML = this.highlightText(cInput)
  }

  removeInsertTextAfterCursor(lastLine, currentLine) {
    const lInput = this.inputs[lastLine.id]
    const cInput = this.inputs[currentLine.id]
    let lastText = lInput.text
    let currentText = cInput.text + lastText
    let lastSCW = lInput.sumCharCode
    let currentSCW = cInput.sumCharCode + lastSCW

    //cInput.cursorPosition.x = cInput.sumCharCode
        cInput.cursorPosition.x = cInput.sumCharCode

    this.setCursorPosition()
    cInput.sumCharCode = currentSCW
    cInput.text = currentText
    this.setLinesWidth(currentSCW, "remove-insert")
    const cursorX = cInput.cursorPosition.x
    if (cursorX > this.settings.width && !this.currentScrollX) {
      this.scrollX = cursorX - this.settings.width + this.numbersWrapperWidth + 20
      this.scrollXWrapper.scroll(this.scrollX, 0)
    }
    currentLine.row.innerHTML = this.highlightText(cInput)
  }

  scrollYEvent(e) {
    this.currentScrollY = this.root.scrollTop
    this.setCursorPosition()
  }

  scrollXEvent(e) {
    this.currentScrollX = this.scrollXWrapper.scrollLeft
    this.setCursorPosition()

  }

  setScrollY(type) {
    const totalHeight = this.editorPosition.y + this.editorPosition.height
    const totalLine = this.currentLinePosition.y + this.lineHeight
    if (this.currentLinePosition.y < this.editorPosition.y) {
      const linePosDiff = this.editorPosition.y - this.currentLinePosition.y
      this.scrollY = this.root.scrollTop - linePosDiff
      this.root.scroll(0, this.scrollY)
    }
    if (type === "insertLine") {
      if (totalLine > totalHeight) {
        const linePosDiff = totalLine - totalHeight
        this.scrollY = this.root.scrollTop + linePosDiff
        this.root.scroll(0, this.scrollY)
      }
    }
  }

  setScrollX(type) {


  }

  removeLineBreak() {
    if (this.lines.length < 2) return
    if (this.currentLine.id === 0) return
    const newLines = []
    const newLinesNumbers = []
    const newInputs = []
    let currentLine = null
    let currentLineNumber = null
    let currentInput = null
    let saveCurrentLine = this.currentLine

    for (let i = 0; i < this.numbers.length; i++) {
      currentLineNumber = this.numbers[i]
      currentLine = this.lines[i]
      currentInput = this.inputs[i]

      if (i > this.currentLine.id) {
        currentLineNumber.textContent = parseInt(currentLineNumber.textContent) - 1
      }

      if (i !== this.currentLine.id) {
        newLinesNumbers.push(currentLineNumber)
        newLines.push(currentLine)
        newInputs.push(currentInput)
      } else {
        this.numbersWrapper.removeChild(currentLineNumber)
        this.scrollXWrapper.removeChild(currentLine)
      }
    }


    this.lastLine = this.isClickNode(this.lines[this.currentLine.id - 1]) || this.isClickNode(this.lines[1])
    this.lastLineNumber = this.numbers[this.currentLine.id - 1] || this.numbers[1]
    this.currentLine = this.lastLine
    this.currentLineNumber = this.lastLineNumber
    this.currentLinePosition = this.currentLine.row.getBoundingClientRect()
    this.scrollYHeight -= this.lineHeight
    this.scrollYWrapper.style.height = this.scrollYHeight + "px"
    this.numbersWrapper.style.height = this.scrollYHeight + "px"
    this.currentLine.row.classList.add("active__row")
    this.setScrollY("removeLine")
    this.setCursorPosition()
    this.removeInsertTextAfterCursor(saveCurrentLine, this.lastLine)
    this.numbers = [...newLinesNumbers]
    this.lines = [...newLines]
    this.inputs = [...newInputs]
  }

  addKeyboardEvent() {
    this.keyboard.onBeforeInput = this.onBeforeInput.bind(this)
    this.keyboard.onInput = this.onInput.bind(this)
    this.keyboard.onFocus = this.onFocus.bind(this)
    this.keyboard.onBlur = this.onBlur.bind(this)
  }




  targetEvent(e, index) {
    this.addKeyboardEvent()
    const isNotLine = this.isClickNode(e.target, this.linesWrapper) && e.target.classList[0] !== "line__wrapper"
    this.lastLine = this.currentLine
    this.currentLine = this.isClickNode(this.lines[index - 1]) || this.isClickNode(e.target)
    if (!this.currentLine) {
      if (isNotLine) {
        this.currentLine = this.isClickNode(this.lines[this.lines.length - 1])
      } else {
        this.keyboard.input.blur()
        return
      }
    }
    this.currentLinePosition = this.currentLine.row.getBoundingClientRect()
    this.currentLineNumber = this.numbers[this.currentLine.id]
    if (this.blurLine) this.blurLine.classList.remove("active__row")

    if (this.currentLine) {
      this.lastLineNumber = this.currentLineNumber
      this.currentLineNumber = this.numbers[this.currentLine.id]
    } else if (this.isClickNode(e.target, this.linesWrapper)) {
      if (this.lastLine) this.lastLine.row.classList.remove("active__row")
      this.lastLine = this.currentLine
      this.lastLineNumber = this.currentLineNumber
      this.currentLineNumber = this.numbers[this.numbers.length - 1]
      this.currentLine = this.isClickNode(this.lines[this.lines.length - 1])
    }
    if (this.lastLine) this.lastLine.row.classList.remove("active__row")
    this.currentLine.row.classList.add("active__row")
    if (this.settings.type === "normal") this.lineCenter()
    this.keyboard.input.focus()
    if (!this.isClickNode(e.target)) {
      const endLineId = this.lines.length-1
      const {x} = this.lines[endLineId]
      const input = this.inputs[endLineId]
      this.setCursorPosition()
      this.insertCursorPosition({pageX:x+input.sumCharCode,pageY:e.pageY})
    } else {
      this.setCursorPosition()
      this.insertCursorPosition(e)
    }
  }

  resize(e) {
    this.settings.width = window.outerWidth
    this.settings.height = window.outerHeight - 83
    this.scrollYHeight = this.settings.height + this.lines.length * this.lineHeight

    this.root.style.width = this.settings.width + "px"
    this.root.style.height = this.settings.height + "px"
    this.scrollYWrapper.style.width = this.settings.width + "px"
    this.scrollYWrapper.style.height = this.scrollYHeight + "px"
    this.numbersWrapper.style.height = this.scrollYHeight + "px"
    this.scrollXWrapper.style.width = this.settings.width - 30 + "px"
    const input = this.inputs[this.currentLine.id]
    const cursorX = input.cursorPosition.x
    if (cursorX > this.settings.width && !this.currentScrollX) {
      this.scrollX = cursorX - this.settings.width + this.numbersWrapperWidth + 20
      this.scrollXWrapper.scroll(this.scrollX, 0)
    }
    this.lineCenter()
    if (!window.orientation) {
      if (window.outerHeight < this.startHeight) {
        this.isKeyboardVisible = true
      } else {
        this.root.scrollTop = this.currentScrollY
        this.isKeyboardVisible = false
        this.isFocus = false
        this.setCursorPosition()
      }
      if (!this.isOrientationPortrait) this.setLinesWidth(window.screen.width - window.screen.height, "resize")
      else {
        const input = this.inputs[this.currentLine.id]
        const cursorPosX = input.cursorPosition.x
        this.scrollX = cursorPosX - this.settings.width + this.numbersWrapperWidth + 20
        this.scrollXWrapper.scroll(this.scrollX, 0)
      }
      this.isOrientationPortrait = true
    } else {
      if (window.outerHeight < this.startWidth * .7) {
        this.isFocus = true
        this.isKeyboardVisible = true
        this.setCursorPosition()
      } else {
        this.root.scrollTop = this.currentScrollY
        this.isKeyboardVisible = false
        this.isFocus = false
        this.setCursorPosition()
      }
      if (this.isOrientationPortrait) this.setLinesWidth(window.screen.width - window.screen.height, "resize")
      this.isOrientationPortrait = false

    }
  }

  setLinesWidth(width) {
    const input = this.inputs[this.currentLine.id]
    const cursorPosX = input.cursorPosition.x
    let lineMaxTextLength = this.lines[0]
    let maxTextLength = 0

    this.lines.forEach((line, idx) => {
      const input = this.inputs[idx]
      if (maxTextLength < input.sumCharCode) {
        maxTextLength = input.sumCharCode
        lineMaxTextLength = line
      }
    })

    if (arguments[1] === "insert") {
      this.scrollXWrapperWidth = this.settings.width - 30 + maxTextLength
      this.lines.forEach(line => {
        line.style.width = this.scrollXWrapperWidth + 5 + "px"
      })
    } else if (arguments[1] === "remove-insert") {
      const cInput = this.inputs[this.currentLine.id]
      if (cInput.sumCharCode >= maxTextLength) {
        this.scrollXWrapperWidth = this.settings.width - 30 + cInput.sumCharCode
        this.lines.forEach(line => {
          line.style.width = this.scrollXWrapperWidth + 5 + "px"
        })
      }
    } else if (this.currentLine.row === lineMaxTextLength || arguments.length === 2 && arguments[1] === "resize") {
      this.scrollXWrapperWidth += width
      this.lines.forEach(line => {
        line.style.width = this.scrollXWrapperWidth + 5 + "px"
      })
    }
  }

  lineCenter() {
    this.editorPosition = this.root.getBoundingClientRect()
    const editorMiddleHeight = this.editorPosition.height / 2
    if (this.currentLine.id * this.lineHeight > editorMiddleHeight && this.isFocus === true) {
      const diff = this.editorPosition.y + editorMiddleHeight - this.currentLinePosition.y
      this.scrollY = this.root.scrollTop - diff + this.lineHeight / 2
      this.root.scroll(0, this.scrollY)
    }
  }

  getInputWorlds(lastValue, value) {
    let worlds = ""
    let idx = 0
    for (let i = 0; i < value.length; i++) {
      if (lastValue[idx] !== value[i]) {
        worlds += value[i]
      } else {
        idx++
      }
    }
    return worlds
  }

  getWidthChars(chars) {
    return ctx.measureText(chars).width
  }
  
  

  removeText() {
    const input = this.inputs[this.currentLine.id]
    const cursorPosX = input.cursorPosition.x

    let newText = ""
    let charWidths = 0
    let charWidth = 0

    if (cursorPosX === 0) {
      return false
    } else {
      for (let i = 0; i < input.text.length; i++) {
        const symb = input.text[i]
        const symbWidth = this.getWidthChars(symb)
        charWidths += symbWidth

        if (cursorPosX === charWidths) {
          charWidth = this.getWidthChars(symb)
        } else {
          newText += symb
        }
      }
    }

    input.sumCharCode -= charWidth
    input.cursorPosition.x -= charWidth
    this.setCursorPosition()

    input.text = newText
    this.currentLine.row.innerHTML = this.highlightText(input)
    if (cursorPosX - this.scrollXWrapper.scrollLeft < this.settings.width / 2) {
      this.scrollX = cursorPosX - this.settings.width + this.settings.width - this.settings.width / 2
      this.scrollXWrapper.scroll(this.scrollX, 0)
    }
    this.setLinesWidth(-charWidth)
    return true
  }

  insertText(char) {
    const input = this.inputs[this.currentLine.id]
    const cursorPosX = input.cursorPosition.x
    const charWidth = this.getWidthChars(char)
    let newText = ""
    let charWidths = 0
    if (cursorPosX === 0 && !input.text.length) {
      newText += char
    } else if (cursorPosX === 0 && input.text.length) {
      newText = char + input.text
    }
    else {
      for (let i = 0; i < input.text.length; i++) {
        const symb = input.text[i]
        const symbWidth = this.getWidthChars(symb)
        charWidths += symbWidth
        newText += symb
        if (cursorPosX === charWidths) {
          newText += char
        }
      }
    }


    input.sumCharCode += charWidth
    input.cursorPosition.x += charWidth
    this.setCursorPosition()

    input.text = newText
    this.currentLine.row.innerHTML = this.highlightText(input)
    this.setLinesWidth(charWidth)
    if (cursorPosX - this.scrollXWrapper.scrollLeft > this.settings.width - this.numbersWrapperWidth - 20) {
      this.scrollX = cursorPosX - this.settings.width + this.numbersWrapperWidth + 20
      this.scrollXWrapper.scroll(this.scrollX, 0)
    }
  }

  insertCursorPosition(e) {
    const x = e.pageX - this.numbersWrapperWidth + this.scrollXWrapper.scrollLeft
    const lInput = this.inputs[this.lastLine.id]
    const input = this.inputs[this.currentLine.id]
    let sumCharWidth = 0
    if (x > input.sumCharCode) {
      input.cursorPosition.x = input.sumCharCode
      this.setCursorPosition()
      if (input.cursorPosition.x < this.currentScrollX) {
        this.scrollX = input.cursorPosition.x - this.settings.width - 30
        this.scrollXWrapper.scroll(this.scrollX, 0)
      }
      return
    }
    if (x < 1) {
      input.cursorPosition.x = 0
      this.setCursorPosition()
      return
    }
    for (let i = 0; i < input.text.length; i++) {
      const char = input.text[i]
      const width = this.getWidthChars(char)
      const middleWidth = width / 2
      if (x > sumCharWidth && x < sumCharWidth + middleWidth) {
        input.cursorPosition.x = sumCharWidth
        this.setCursorPosition()
        return
      } else if (x > sumCharWidth && x > sumCharWidth + middleWidth && x < sumCharWidth + width) {
        input.cursorPosition.x = sumCharWidth + width
        this.setCursorPosition()
        return
      }
      sumCharWidth += width


    }
  }

  highlightText(input) {
    const text = input.text

    return hljs.highlight(text, { language: "javascript", ignoreillegals: true }).value
  }


  onInput(e) {
    value = this.keyboard.input.value
    const valueLength = value.length || 0
    const dataLength = e.data?.length || 0
    const valueBefore = lastValue[valueLength - 1] || ""
    let charBeforeCursor = e.data ? e.data[dataLength - 1 > -1 ? dataLength - 1 : 0] : valueLength > 0 && value[valueLength - 1] === " " ? " " : value[valueLength - 1] !== " " ? value[valueLength - 1] : ""
    charBeforeCursor = !charBeforeCursor ? "" : charBeforeCursor
    const is = lastValue.length > valueLength
    if (charBeforeCursor === valueBefore && is) {
      this.keyboard.input.value = ""
      if (!this.keyboard.isBackspacePressed) {
        if (!this.removeText()) {
          this.removeLineBreak()
        }
      } else {
        this.keyboard.isBackspacePressed = false
      }
    } else {
      const char = this.getInputWorlds(lastValue, value)

      this.insertText(char)

    }

  }

  onBeforeInput(e) {
    lastValue = this.keyboard.input.value
    if (e.inputType === "insertLineBreak") {
      this.insertLineBreak()
    }
    if (e.inputType === "deleteContentBackward") {
      this.keyboard.isBackspacePressed = true
      this.keyboard.input.value = ""
      if (!this.removeText()) {
        this.removeLineBreak()
      }
      this.keyboard.isBackspacePressed = true
    }
  }

  onFocus(e) {}

  onBlur(e) {
    this.blurLine = this.currentLine.row
  }
}

const kaiEditor = document.querySelector(".kai-editor")

const { width, height } = kaiEditor.getBoundingClientRect()

const js = new CodeEditor({
  width,
  height,
  fontSize: 12,
  fontFamily: "monospace",
  node: kaiEditor,
  type: "fullscreen"
})



const kai = new Kai()

kai.switchEditors([js])
