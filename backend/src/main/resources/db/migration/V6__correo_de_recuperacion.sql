-- El código de recuperación se cambia por un correo opcional. De los enlaces (confirmar el
-- correo y restablecer la contraseña) solo se guarda el SHA-256, como del código antes.
alter table usuarios
    drop column codigo_recuperacion,
    add column correo varchar(254),
    add column correo_pendiente varchar(254),
    add column enlace_correo varchar(64),
    add column enlace_correo_caduca timestamptz,
    add column enlace_contrasena varchar(64),
    add column enlace_contrasena_caduca timestamptz;

create index usuarios_enlace_correo on usuarios (enlace_correo);
create index usuarios_enlace_contrasena on usuarios (enlace_contrasena);
