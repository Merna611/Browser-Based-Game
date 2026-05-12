const state = { left: false, right: false, jump: false }
let jumpPressedThisFrame = false
let jumpJustReleased = false

const KEY_MAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
}

function onKeyDown(e) {
  const action = KEY_MAP[e.code]
  if (!action) return
  e.preventDefault()
  if (action === 'jump' && !state.jump) jumpPressedThisFrame = true
  state[action] = true
}

function onKeyUp(e) {
  const action = KEY_MAP[e.code]
  if (!action) return
  e.preventDefault()
  if (action === 'jump') jumpJustReleased = true
  state[action] = false
}

export const InputManager = {
  init() {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  },
  destroy() {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  },
  setButton(name, pressed) {
    if (name === 'jump' && pressed && !state.jump) jumpPressedThisFrame = true
    if (name === 'jump' && !pressed) jumpJustReleased = true
    state[name] = pressed
  },
  get left() { return state.left },
  get right() { return state.right },
  get jump() { return state.jump },
  consumeJumpPress() {
    const v = jumpPressedThisFrame
    jumpPressedThisFrame = false
    return v
  },
  consumeJumpRelease() {
    const v = jumpJustReleased
    jumpJustReleased = false
    return v
  },
  reset() {
    state.left = false; state.right = false; state.jump = false
    jumpPressedThisFrame = false; jumpJustReleased = false
  },
}
