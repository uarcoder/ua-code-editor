class Cursor {
  constructor(node, lineHeight) {
    this.kai = new Kai()
    this.dom = new Kai.Dom()
    this.position = { x: null, y: null }

    this.root = this.dom.createTag({
      className: "cursor",
      type: "append",
      node
    })

    this.root.style.position = "absolute"
    this.root.style.width = "1px"
    this.root.style.height = lineHeight + "px"
    this.passive()
  }

  active() {
    this.root.style.opacity = 1
    //this.root.style.background = "rgba(255,255,255,.8)"
  }

  passive() {
    this.root.style.opacity = .4
    //this.root.style.background = "rgba(255,255,255,.2)"
  }

  setPosition(x, y) {
    this.position = { x, y }
    this.root.style.top = y + "px"
    this.root.style.left = x + "px"
  }
}
