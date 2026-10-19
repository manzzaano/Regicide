// Ayudas compartidas por los tests.

/** Un JWT sin firma válida: al navegador solo le interesan el nombre y la caducidad. */
export function tokenDePrueba(nombre: string, segundosHastaCaducar = 3600): string {
  const base64url = (texto: string) => btoa(texto).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + segundosHastaCaducar;
  return `${base64url('{"alg":"HS256"}')}.${base64url(JSON.stringify({ sub: nombre, exp }))}.firma`;
}
