# Registry Hub — convenciones de diseño

Sistema visual del hub de APIs (CalidadPRO). Español por defecto, inglés como segundo idioma. Densidad alta: texto base de 11px.

## Setup
- Los estilos llegan por `styles.css` (incluye `tokens.css`, `global.css` y los estilos de componentes). Sin él, nada tiene estilo.
- Los componentes usan `react-i18next`; la librería ya inicializa i18n al cargarse (`window.RegistryHub`). Los textos visibles de `TopBar`, `Modal`, `Snackbar`, `ErrorState`, `Breadcrumbs` y `CallVolume` salen de ahí.
- Modo oscuro: poner `data-theme="dark"` en `<html>`; los tokens cambian solos. Sin el atributo es modo claro.
- Fuente: `var(--cp-ff)` (Verdana → Geneva → DejaVu Sans). No hay fuentes mono: los datos técnicos (rutas, slugs) llevan la clase `cp-code`.

## Estilo: tokens `var(--cp-*)`, nunca hex
- Color de marca: `--cp-primary-50…700`, `--cp-brand`, `--cp-brand-mid`, `--cp-brand-light`. Neutrales: `--cp-n-50…900`.
- Semánticos (cada uno con `-surface`, `-border`; algunos `-hover`): `--cp-success`, `--cp-error`, `--cp-warning`, `--cp-info`.
- Superficies/texto: `--cp-bg-page`, `--cp-bg-card`, `--cp-bg-tinted`, `--cp-bg-inset`, `--cp-text-primary`, `--cp-text-secondary`, `--cp-text-muted`, `--cp-text-inverse`, `--cp-border`, `--cp-border-subtle`, `--cp-border-strong`.
- Espaciado `--cp-sp-1…6` (2, 5, 8, 13, 16, 26px). Radios `--cp-r-xs`, `--cp-r-sm`, `--cp-r-lg`. Sombras `--cp-shadow-card`, `--cp-shadow-modal`.
- Verbos HTTP: `--cp-method-{get,post,put,patch,delete,neutral}-{bg,fg}` (los pinta `MethodBadge`; no los redefinas).
- Clases utilitarias existentes: `cp-btn` (+ `cp-btn--primary`, `cp-btn--ghost`, `cp-btn--icon`), `cp-card`, `cp-card-head`, `cp-chip`, `cp-tag`, `cp-input`, `cp-select`, `cp-banner` (+ `--error`, `--warning`), `cp-thead`, `cp-trow` (+ `--clickable`), `cp-num`, `cp-code`, `cp-ellipsis`, `cp-center`. No inventes otras con prefijo `cp-`.

## Dónde está la verdad
Lee antes de diseñar: `styles.css` y sus imports (tokens y estilos de componentes), y por componente `components/<grupo>/<Nombre>/<Nombre>.d.ts` y `.prompt.md`.

## Ejemplo
```jsx
const { MethodBadge, ServiceRef, CallVolume, HealthDot } = window.RegistryHub;

<div className="cp-card" style={{ padding: 'var(--cp-sp-4)', display: 'flex', gap: 'var(--cp-sp-3)', alignItems: 'center' }}>
  <ServiceRef slug="billing" name="Billing" />
  <MethodBadge method="POST" />
  <span className="cp-code">/v1/invoices</span>
  <CallVolume value={12400} />
  <HealthDot status="ok" label="Reportando" tooltip="Último reporte hace 2 min" />
</div>
```
