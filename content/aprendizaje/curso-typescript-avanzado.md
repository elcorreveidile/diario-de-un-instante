---
titulo: 'Completé el módulo de TypeScript avanzado'
fecha: '2026-01-18'
area: 'aprendizaje'
tipo: 'accion'
slug: 'curso-typescript-avanzado'
---

Terminé el módulo sobre tipos genéricos y utility types en TypeScript. Los conceptos de `Partial`, `Pick`, `Omit` y los tipos condicionales finalmente tienen sentido.

## Lo que aprendí hoy

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

Este tipo de conocimiento profundo hace que escribir código sea mucho más satisfactorio. Ya no estoy solo usando TypeScript, estoy aprovechando su verdadero poder.
