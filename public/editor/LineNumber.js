
class LineNumber {
  constructor(config) {
    this.settings = config || {}
    this.dom = new Kai.Dom()
    this.createTag = this.dom.createTag.bind(this.dom)
    
    this.root = this.createTag({
      className:"line__number_wrapper",
      type:this.settings.type,
      node:this.settings.node,
      text:this.settings.number
    })
      return this.root
  }
}
