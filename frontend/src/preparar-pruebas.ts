// jsdom dice que el navegador está en inglés; los tests esperan la interfaz en español.
Object.defineProperty(navigator, 'language', { value: 'es-ES', configurable: true });

// jsdom no tiene showModal() ni close() en <dialog>: lo justo para que se abra y avise al cerrarse.
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement, valor?: string) {
  this.returnValue = valor ?? '';
  this.open = false;
  this.dispatchEvent(new Event('close'));
};
