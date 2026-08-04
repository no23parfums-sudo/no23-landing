# NO.23 — Operational Data Dictionary v1.1

Source of truth for the NO.23 Library physical schema and pilot data.

Rules:

- Do not redesign, simplify, rename, or infer fields not present here.
- Preserve the distinctions between objective facts, NO.23 editorial data, calculated data, public fields, internal fields, official notes, and NO.23-detected notes.
- If a required entity or field is not defined here, stop and ask instead of inventing it.


## 00_Instrucciones

| NO.23 — Biblioteca | Diccionario Operativo v1.0 |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| Archivo maestro para convertir la arquitectura conceptual en campos cargables y validar el primer perfume piloto. |  |  |  |  |  |
|  |  |  |  |  |  |
| PASO | ACCIÓN | RESPONSABLE | ESTADO | RESULTADO ESPERADO | NOTAS |
| 1 | Guardar este archivo en Google Drive dentro de NO.23 / Biblioteca / Arquitectura | Santiago | Pendiente | Una única copia maestra accesible | No crear versiones paralelas. |
| 2 | Completar y revisar el diccionario entidad por entidad | NO.23 + ChatGPT | En curso | Campos, reglas y validaciones cerrados | Empezamos por Perfume. |
| 3 | Completar catálogos controlados | NO.23 + ChatGPT | Pendiente | Dropdowns consistentes | Estados, confianza, posiciones, métricas, etc. |
| 4 | Cargar Bleu de Chanel Eau de Parfum como piloto | NO.23 + ChatGPT | Pendiente | Primera ficha completa | No se escala antes de revisar. |
| 5 | Auditar qué falta, sobra o se duplica | NO.23 + ChatGPT | Pendiente | Modelo v1.1 validado con datos reales | Revisar UX y trazabilidad. |
| 6 | Traducir el modelo validado a Supabase | Desarrollo | Pendiente | Tablas y relaciones físicas | Recién después del piloto. |

## 01_Diccionario

| Entidad | Grupo visual | Campo técnico | Nombre visible | Definición exacta | Tipo de dato | Cardinalidad | Requerimiento | Naturaleza | Visibilidad | Fuente requerida | Valores permitidos / relación | Regla de validación | Ejemplo | Observaciones | Editable por IA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Perfume | Identidad | id | ID | Identificador interno único e inmutable. | UUID | Uno | Obligatorio | Sistema | Interno | No | Generado automáticamente | Único; nunca reutilizable | UUID |  | No |
| Perfume | Identidad | official_name | Nombre oficial | Nombre comercial completo utilizado oficialmente por la marca. | Texto | Uno | Obligatorio | Objetivo | Público | Sí |  | No vacío; conservar grafía oficial | Bleu de Chanel Eau de Parfum |  | No |
| Perfume | Identidad | display_name | Nombre visible | Nombre mostrado por NO.23; puede abreviar sin alterar el dato oficial. | Texto | Uno | Obligatorio | Editorial controlado | Público | No |  | Debe ser claro y no ambiguo | Bleu de Chanel EDP |  | Mixto |
| Perfume | Identidad | slug | URL | Identificador legible y único utilizado en la URL. | Texto | Uno | Obligatorio | Sistema | Interno/URL | No |  | Minúsculas, sin tildes, único | bleu-de-chanel-eau-de-parfum |  | No |
| Perfume | Estructura | brand_id | Marca | Marca responsable del lanzamiento comercial. | Relación | Uno | Obligatorio | Objetivo | Público | Sí | Brand | Debe apuntar a una marca publicada | Chanel |  | No |
| Perfume | Estructura | universe | Universo | Clasificación editorial de NO.23 para grandes segmentos del mercado (Diseñador, Nicho, Árabe, Indie, Celebrity, Inspiración, etc.). | Enum | Uno | Recomendado | Editorial NO.23 | Público | No | Diseñador; Nicho; Árabe; Indie; Celebrity; Inspiración | Valor controlado; una única categoría principal | Nicho |  | No |
| Perfume | Estructura | private_collection_id | Colección privada | Universo privado o exclusivo oficial dentro de una marca comercial. | Relación | Cero o uno | Opcional | Objetivo | Público condicional | Sí | PrivateCollection | Solo si la pertenencia está documentada | Maison Christian Dior |  | Mixto |
| Perfume | Estructura | collection_ids | Colección | Agrupaciones oficiales a las que pertenece el perfume. | Relación | Cero o varios | Opcional | Objetivo | Público condicional | Sí | Collection | Relación muchos-a-muchos; una puede marcarse principal | Join the Club |  | Mixto |
| Perfume | Estructura | line_id | Línea | Familia comercial de lanzamientos directamente emparentados. | Relación | Cero o uno | Opcional | Objetivo | Público condicional | Sí | Line | No usar para colecciones conceptuales | Bleu de Chanel |  | Mixto |
| Perfume | Información oficial | launch_year | Año de lanzamiento | Año del lanzamiento comercial del perfume. | Año | Uno | Recomendado | Objetivo | Público | Sí | 1900–año actual+1 | Entero de cuatro dígitos | 2014 |  | No |
| Perfume | Información oficial | concentration_id | Concentración | Denominación normalizada de concentración. | Relación | Cero o uno | Recomendado | Objetivo | Público | Sí | Concentration | No inferir cuando la marca no la declara | Eau de Parfum |  | No |
| Perfume | Información oficial | commercial_concentration_label | Denominación comercial | Texto literal utilizado por la marca para la concentración. | Texto | Cero o uno | Opcional | Objetivo | Público condicional | Sí |  | Conservar la grafía oficial | Eau de Parfum |  | No |
| Perfume | Información oficial | perfumer_ids | Perfumista | Personas acreditadas oficialmente por la creación. | Relación | Cero o varios | Recomendado | Objetivo | Público | Sí | Perfumer | No atribuir sin respaldo suficiente | Jacques Polge |  | Mixto |
| Perfume | Información oficial | declared_gender | Género declarado | Segmentación comercial declarada por la marca. | Enum | Uno | Opcional | Objetivo | Público | Sí | Masculino; Femenino; Unisex; No especificado | No usar para excluir resultados | Masculino |  | Mixto |
| Perfume | Composición | note_observations | Notas y pirámide | Relaciones con notas, posición, fuente, orden y protagonismo. | Relación | Cero o varios | Recomendado | Objetivo/editorial | Público | Sí | PerfumeNoteObservation | Separar oficial, NO.23 y comunidad | Bergamota — salida — oficial |  | Mixto |
| Perfume | Clasificación | family_summary | Familia olfativa | Síntesis principal de la clasificación global del perfume. | Relación calculada | Uno principal + secundarios | Recomendado | Calculado/editorial | Público | Sí | PerfumeFamilySummary | Debe conservar fuentes y taxonomía | Amaderado aromático |  | Mixto |
| Perfume | Clasificación | accord_summary | Acordes principales | Impresiones olfativas predominantes agregadas. | Relación calculada | Varios | Recomendado | Calculado/editorial | Público | Sí | PerfumeAccordSummary | Mostrar 4–5 principales en primer nivel | Amaderado; Aromático; Cítrico |  | Mixto |
| Perfume | Perfil sensorial | descriptor_summary | Perfil sensorial | Cualidades perceptivas como luminoso, seco, cremoso o denso. | Relación calculada | Varios | Opcional | Editorial/calculado | Público | Sí | OlfactiveDescriptor | No confundir con notas, acordes o contextos | Luminoso; Seco; Aireado |  | Mixto |
| Perfume | Experiencia | context_summary | Cuándo usarlo | Síntesis de estación, temperatura, momento, ocasión y formalidad. | Relación calculada | Varios | Opcional | Editorial/calculado | Público | Sí | PerfumeContext | Escala interna 0–4; sin falsa precisión | Otoño 3/4; Oficina 4/4 |  | Mixto |
| Perfume | Performance | performance_summary | Performance | Duración, proyección, estela, evolución y versatilidad. | Relación calculada | Varios | Opcional | Editorial/calculado | Público | Sí | PerfumePerformanceSummary | Mostrar metodología y confianza | 7–10 h; proyección social |  | Mixto |
| Perfume | Contenido | summary | Resumen | Descripción breve y clara del perfume. | Texto | Uno | Recomendado | Editorial NO.23 | Público | No | 160–300 caracteres sugeridos | No copiar texto oficial | Una interpretación moderna... |  | Sí |
| Perfume | Contenido | official_description | Descripción oficial | Descripción o síntesis atribuida a la marca. | Texto | Cero o uno | Opcional | Objetivo | Público condicional | Sí |  | Parafrasear salvo citas breves permitidas | Descripción oficial sintetizada |  | Sí |
| Perfume | Contenido | no23_editorial | Editorial NO.23 | Análisis propio profundo, reservado para perfumes seleccionados. | Texto | Cero o uno | Opcional | Editorial NO.23 | Público condicional | No |  | No obligatorio para publicar | Review editorial |  | Sí |
| Perfume | Estado | commercial_status | Estado comercial | Situación actual del lanzamiento. | Enum | Uno | Obligatorio | Objetivo | Público | Sí | Activo; Discontinuado; Limitado; Próximo; Desconocido | Usar valor controlado | Activo |  | No |
| Perfume | Control | verification_status | Verificación | Estado interno de validación del registro. | Enum | Uno | Obligatorio | Sistema | Interno | No | No verificado; Parcialmente verificado; Verificado; Disputado | No publicar como verificado sin evidencia | Verificado |  | No |
| Perfume | Control | completeness_level | Nivel de ficha | Nivel de enriquecimiento alcanzado por la ficha. | Enum calculado | Uno | Obligatorio | Calculado | Interno | No | Minimum; Standard; Enriched; Editorial | Calculado desde campos presentes | Standard |  | Mixto |

## 02_Catalogos

| Catálogo | Código | Nombre visible | Descripción | Activo | Orden |
| --- | --- | --- | --- | --- | --- |
| Nature | objective | Objetivo | Dato factual o documental. | True | 1 |
| Nature | editorial | Editorial NO.23 | Evaluación o interpretación propia. | True | 2 |
| Nature | calculated | Calculado | Resultado derivado por el sistema. | True | 3 |
| VerificationStatus | unverified | No verificado |  | True | 1 |
| VerificationStatus | partially_verified | Parcialmente verificado |  | True | 2 |
| VerificationStatus | verified | Verificado |  | True | 3 |
| VerificationStatus | disputed | Disputado |  | True | 4 |
| CommercialStatus | active | Activo |  | True | 1 |
| CommercialStatus | discontinued | Discontinuado |  | True | 2 |
| CommercialStatus | limited | Limitado |  | True | 3 |
| CommercialStatus | upcoming | Próximo |  | True | 4 |
| CommercialStatus | unknown | Desconocido |  | True | 5 |
| Confidence | very_low | Muy baja |  | True | 1 |
| Confidence | low | Baja |  | True | 2 |
| Confidence | medium | Media |  | True | 3 |
| Confidence | high | Alta |  | True | 4 |
| Confidence | very_high | Muy alta |  | True | 5 |
| NotePosition | top | Salida |  | True | 1 |
| NotePosition | heart | Corazón |  | True | 2 |
| NotePosition | base | Fondo |  | True | 3 |
| NotePosition | unclassified | Sin posición declarada |  | True | 4 |
| NotePosition | throughout | Durante toda la evolución |  | True | 5 |
| NotePosition | unknown | Posición desconocida |  | True | 6 |

## 03_Piloto_BDC_EDP

| Primera carga piloto — Bleu de Chanel Eau de Parfum |  |  |  |
| --- | --- | --- | --- |
|  |  |  |  |
| Campo | Valor | Estado | Fuente / observación |
| official_name | Bleu de Chanel Eau de Parfum | Completar | chanel.com |
| display_name | Bleu de Chanel EDP | Completar |  |
| brand | Chanel | Completar |  |
| line | Bleu de Chanel | Completar |  |
| launch_year |  | Pendiente de verificación |  |
| concentration | Eau de Parfum | Completar |  |
| perfumers |  | Pendiente de verificación |  |
| declared_gender |  | Pendiente de verificación |  |
| commercial_status | Activo | Revisar |  |
| summary |  | Redactar |  |
| official_notes |  | Pendiente |  |
| family |  | Pendiente |  |
| accords |  | Pendiente |  |
| descriptors |  | Pendiente |  |
| contexts |  | Pendiente |  |
| performance |  | Pendiente |  |
| hero_media |  | Pendiente de derechos |  |
| sources |  | Pendiente |  |

## 04_Fuentes

| ID | Tipo | Título | Publicador | Autor | URL | Fecha publicación | Fecha consulta | Entidad | Campo / relación respaldada | Valor snapshot | Rol evidencia | Confianza | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 05_Multimedia

| ID | Entidad | Rol | Archivo / URL | Tipo | Fuente | Derechos | Aprobación | Alt text | Primario | Notas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |