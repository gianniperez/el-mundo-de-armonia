# 🏰 El Mundo de Armonía — Novela Visual Web & CMS

Plataforma interactiva para la novela visual **El Mundo de Armonía**, desarrollada con **Next.js 15**, **React 19**, **Payload CMS 3.0** y **Tailwind CSS**.

---

## 🎮 Estructura del Proyecto

1. **Juego Interactivo (`/`):**
   * Motor de novela visual en lienzo 16:9 con transiciones fluidas.
   * Sistema de decisiones y ramificaciones de historia (árbol narrativo).
   * Renderizado de personajes multicapa (expresiones intercambiables) y soporte de slides completos.
   * Cuadro de diálogo interactivo con efecto máquina de escribir y estética idéntica al diseño original.
   * Sistema de guardado y carga de partidas con 3 ranuras en `localStorage`.
   * Bloqueo inteligente de orientación para móviles (solicita girar a horizontal).

2. **Panel de Administración (`/admin`):**
   * Gestionado por **Payload CMS 3.0**.
   * Acceso protegido con usuario y contraseña para la ilustradora.
   * Colecciones organizadas:
     * **`Media`**: Biblioteca de fondos, sprites, música (BGM) y efectos (SFX).
     * **`Characters`**: Personajes y sus bibliotecas de expresiones (dormido, feliz, serio, etc.).
     * **`Scenes`**: Nodos de la historia con modo híbrido (Slide completo o Multicapa) y enlaces de decisión.
     * **`Chapters`**: Organización de la historia por partes.

---

## 🚀 Inicio Rápido en Local

```bash
cd el-mundo-de-armonia
npm run dev
```

* **Juego:** Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
* **Panel CMS:** Abre [http://localhost:3000/admin](http://localhost:3000/admin) para registrar tu usuario administrador inicial y gestionar el contenido.

---

## 🎨 Modo Híbrido de Carga (Para tu hermana)

* **Modo Diapositiva Completa (`flat`):** Permite subir de inmediato las ilustraciones completas que ya tiene en Drive/PDF con texto pegado.
* **Modo Multicapa (`layered`):** Permite seleccionar un fondo reutilizable, colocar personajes a la izquierda/centro/derecha con su expresión correspondiente y escribir el diálogo editable.
