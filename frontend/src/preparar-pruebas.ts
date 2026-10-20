// jsdom dice que el navegador está en inglés; los tests esperan la interfaz en español.
Object.defineProperty(navigator, 'language', { value: 'es-ES', configurable: true });
