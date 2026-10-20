-- Argon2 ocupa más que BCrypt. version_sesion va en cada token: al subirla, los tokens
-- anteriores dejan de valer (cerrar sesión, cambiar o recuperar la contraseña).
alter table usuarios
    alter column contrasena type varchar(255),
    add column version_sesion int not null default 0,
    add column codigo_recuperacion varchar(64);
