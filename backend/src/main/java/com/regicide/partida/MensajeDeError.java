package com.regicide.partida;

/** El código es la clave del texto: el cliente decide con él, no con el texto, que depende del idioma. */
record MensajeDeError(String codigo, String mensaje) {
}
