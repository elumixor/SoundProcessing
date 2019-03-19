export function createElement(name: string, classes: string[] = [], attributes: {key: string, value: string}[] = []) {
    const el = document.createElement(name)
    el.className = classes.join(" ")
    attributes.forEach(a => el.setAttribute(a.key, a.value))

    return document.body.appendChild(el)
}
