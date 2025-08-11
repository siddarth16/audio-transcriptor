declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.css' {
  const content: string
  export default content
}