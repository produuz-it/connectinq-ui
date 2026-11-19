// The images the library imports; the front's Vite turns each into a URL.
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
