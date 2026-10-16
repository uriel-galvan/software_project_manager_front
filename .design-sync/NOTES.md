# design-sync notes — software_manager_front

- Repo es una **app** Vite/React, no una librería. Para sincronizar se creó un entry de librería: `src/design-system.ts` + `vite.lib.config.ts` + `tsconfig.lib.json`; `npm run build:lib` genera `dist-lib/` (index.es.js, styles.css, types/). Hay que correrlo antes de cada re-sync (`buildCmd`). Después copiar `dist-lib/types/design-system.d.ts` a `dist-lib/index.es.d.ts` reescribiendo `./` por `./types/`.
- El conversor no encuentra los componentes por `package.json` (sin `types`), por eso `componentSrcMap` en config.json los lista explícitamente. **Componente nuevo → añadirlo a `src/design-system.ts`, a `componentSrcMap` y escribir su preview.**
- `dtsPropsFor` fija a mano las props de MethodBadge, HealthDot, Snackbar, ErrorState, SortableHeader, Breadcrumbs y TopBar (el extractor dejaba `any`/tipos sin resolver). Si cambian esas props en `src/`, actualizar ahí.
- i18n: el entry importa `./i18n`, así los componentes traducen sin provider.
- `[FONT_MISSING] Geneva`: es solo fallback de la pila `Verdana, Geneva, "DejaVu Sans"`; se aceptó con `runtimeFontPrefixes`.

## Estado
- Las 15 previews están autoradas en `.design-sync/previews/` y se verificaron con Chromium: 15/15 limpias, sin warns. Subidas al proyecto.
- Material Icons va empaquetada (`src/styles/ds-fonts.css` + `ds-fonts/material-icons.ttf`, inline en el CSS vía `assetsInlineLimit`). La app la carga desde index.html y el DS no; sin eso los iconos salen como texto.
- `overrides` en config.json: Modal y Snackbar en cardMode single; TableSkeleton, Breadcrumbs y TopBar en column.
- No incluido: pantallas completas (ServicesPage, EndpointDetailPage, HealthPanel…). Solo hay componentes sueltos.
- El proyecto remoto tiene archivos que no son de esta sync (`_ds_manifest.json`, `_adherence.oxlintrc.json`, `templates/vista-general/`). No están en el plan de borrado: no tocarlos.

## Entorno (Windows, antivirus)
- En esta máquina algo borra archivos sueltos: `node.exe`, `cp.exe` de Git Bash y los .js de playwright-core (index.js, cli.js, lib/*). Node quedó en `C:/Users/uriel.hernandez/dev/node` (añadir al PATH de la sesión).
- Playwright: `npm i` deja `playwright-core` incompleto y dentro de `.ds-sync/` se vuelve a borrar. Lo que funcionó: `npm pack playwright-core@1.63.0`, extraer con tar, copiarlo a `C:/Users/uriel.hernandez/dev/pw-core` y enlazarlo con una junction en `.ds-sync/node_modules/playwright-core`. `playwright@1.63.0` normal va en `.ds-sync/node_modules`; Chromium 1243 ya está en caché.
- `resync.mjs` no encontraba playwright (fallaba el render check); `package-validate.mjs` directo sí.

## Re-sync risks
- Los `dtsPropsFor` pueden quedar desfasados respecto a `src/`.
- Las previews usan textos reales en español; si cambian las claves i18n (ERRORS.*, COMMON.*) revisar ErrorState, Modal y Snackbar.
- CSS nuevo debe importarse desde `src/design-system.ts`.
