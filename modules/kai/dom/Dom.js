const Dom = Kai.Dom = class {
  constructor() {

  }

  createTag(config) {
    const settings = config || {}
    const el = document.createElement(settings.tagName || "div")
    
    el.className = settings.className || "kai__class"
    el.textContent = settings.textContent || ""
    this.styles(el,settings.styles)
    
    if (settings.type === "append") {
      settings.node.append(el)
    } else if (settings.type === "prepend") {
      settings.node.prepend(el)
    } else {
      settings.node.insertAdjacentElement(settings.type, el)
    }
    return el
  }
  
  styles(el,config) {
    const styles = config || {}
    const stylesKeys = Object.keys(styles)
    
    for(let i = 0; i < stylesKeys.length;i++) {
      const key = stylesKeys[i]
      const value = styles[key]
      el.style[key] = value
    }
  }
}
