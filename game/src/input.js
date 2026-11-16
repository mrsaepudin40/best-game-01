// Keyboard + pointer input, kept as plain state the game loop reads.
// Mouse moves the arms, click or Space closes them, Enter starts, R restarts,
// M mutes, P pauses. Arrow keys / W / S also move the arms.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.pointerX = 640;
    this.pointerY = 300;
    this.pointerSeen = false;
    this.closeQueued = false;
    this.startQueued = false;
    this.restartQueued = false;
    this.muteQueued = false;
    this.pauseQueued = false;
    this.keysHeld = new Set();

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.pointerX = (e.clientX - rect.left) * scaleX;
      this.pointerY = (e.clientY - rect.top) * scaleY;
      this.pointerSeen = true;
    });
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.pointerX = (e.clientX - rect.left) * scaleX;
      this.pointerY = (e.clientY - rect.top) * scaleY;
      this.pointerSeen = true;
      this.closeQueued = true;
      this.startQueued = true;
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        if (e.code === 'Space') e.preventDefault();
        return;
      }
      this.keysHeld.add(e.code);
      if (e.code === 'Space') {
        e.preventDefault();
        this.closeQueued = true;
        this.startQueued = true;
      }
      if (e.code === 'Enter') this.startQueued = true;
      if (e.code === 'KeyR') this.restartQueued = true;
      if (e.code === 'KeyM') this.muteQueued = true;
      if (e.code === 'KeyP') this.pauseQueued = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keysHeld.delete(e.code);
    });
    window.addEventListener('blur', () => this.keysHeld.clear());
  }

  takeClose() {
    const v = this.closeQueued;
    this.closeQueued = false;
    return v;
  }

  takeStart() {
    const v = this.startQueued;
    this.startQueued = false;
    return v;
  }

  takeRestart() {
    const v = this.restartQueued;
    this.restartQueued = false;
    return v;
  }

  takeMute() {
    const v = this.muteQueued;
    this.muteQueued = false;
    return v;
  }

  takePause() {
    const v = this.pauseQueued;
    this.pauseQueued = false;
    return v;
  }

  clearAll() {
    this.closeQueued = false;
    this.startQueued = false;
    this.restartQueued = false;
    this.muteQueued = false;
    this.pauseQueued = false;
  }

  armKeyDirection() {
    let d = 0;
    if (this.keysHeld.has('ArrowUp') || this.keysHeld.has('KeyW')) d -= 1;
    if (this.keysHeld.has('ArrowDown') || this.keysHeld.has('KeyS')) d += 1;
    return d;
  }
}
