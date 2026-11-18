// InputController.js — keyboard + mouse, in game coordinates (1280x720 space).
export class InputController {
  constructor(canvas, onClick, onKey) {
    this.left = false; this.right = false; this.mouseX = null;
    this.onClick = onClick; this.onKey = onKey;
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.right = true;
      if (this.onKey) this.onKey(e.key);
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.right = false;
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseX = ((e.clientX - r.left) / r.width) * 1280;
    });
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 1280;
      const my = ((e.clientY - r.top) / r.height) * 720;
      if (this.onClick) this.onClick(mx, my);
    });
  }
}
