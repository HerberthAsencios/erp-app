# Quiz ERP

Aplicación web tipo quiz para practicar preguntas del balotario de **Planeamiento de Recursos Empresariales** (UNMSM).

## Funcionalidades

- Selección por **tema/grupo** (Finanzas, SAP S/4HANA, Oracle NetSuite, etc.)
- **Feedback inmediato** tras cada respuesta
- **Temporizador** y barra de progreso
- **Resultados** con puntaje, porcentaje y repaso pregunta por pregunta

## Requisitos

- Node.js 20+
- Angular CLI 20+

## Desarrollo

```bash
cd quiz-erp
npm install
ng serve
```

Abre `http://localhost:4200/`

## Producción

```bash
ng build
```

Los archivos estáticos quedan en `dist/quiz-erp/browser/`.

## Actualizar preguntas

El dataset se genera desde `scripts/build-questions.mjs`, alineado con
`BalotarioERP/balotario_consolidado.pdf` (respuestas oficiales debajo de cada pregunta).

```bash
node scripts/build-questions.mjs
ng serve
```

### Esquema de cada pregunta

```json
{
  "id": "g1-fin-01",
  "grupo": 1,
  "tema": "Finanzas",
  "temaSlug": "finanzas",
  "enunciado": "...",
  "opciones": [{ "letra": "A", "texto": "..." }],
  "correcta": "D",
  "explicacion": "opcional"
}
```

Las 100 preguntas incluyen la clave correcta y explicación según el balotario consolidado.
