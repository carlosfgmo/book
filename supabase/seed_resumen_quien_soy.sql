-- ============================================================
-- seed_resumen_quien_soy.sql
-- Carga el resumen detallado (capítulo por capítulo) del libro
-- "¿Quién soy en la era de la Inteligencia Artificial?" en la
-- columna book.summary, agregada por migration_10.sql.
-- Ejecutar DESPUÉS de migration_10.sql, en: Supabase Dashboard > SQL Editor
-- ============================================================

UPDATE public.book
SET summary = $sum$
## Parte 1: El colapso de la identidad

### 01. El día que Julio dejó de ser programador
La pérdida silenciosa de una identidad construida sobre el trabajo.
- El cambio que no avisó: No hubo tormenta ni grito: un día silencioso. | «La densidad particular de las cosas que no regresan.»
- Quién era Julio: «Era programador. Y eso era suficiente.» | PHP, MySQL, Oracle: coordenadas que probaban que existía. | Una vida dada por sentada «como el aire»: Irene y María.
- El colapso: La empresa quebró; con ella, «la narrativa que le permitía reconocerse en el espejo». | Al principio lo leyó como un contratiempo: «ya encontraré otro trabajo».
- El mercado no esperó: Sus tecnologías miradas con «respeto nostálgico y condescendencia». | Las exigencias, más rápidas que sus manos.
- La IA: un cambio de naturaleza: Herramientas que escriben código en segundos, no se fatigan, no cobran.
- El limbo y la pregunta: Ante «¿a qué te dedicas?», dudaba: las palabras ya no le parecían verdaderas.
> «La irrelevancia es una forma de borrado que duele de una manera particular.»

### 02. Cuando el trabajo define quién eres
La mentira moderna de que «un hombre es lo que hace» — un edificio frágil.
- La mentira moderna: «Un hombre es lo que hace»: no lo que piensa o ama, sino lo que produce y cabe en un CV. | La pregunta social: «¿y a qué te dedicas?».
- El refugio del código: Llegó a programar porque «era el futuro». | Descubrió una lógica que lo tranquilizaba: «si hacías las cosas bien, funcionaban». Un orden controlable.
- El trabajo da un nombre: «Soy programador» = una declaración, una frontera, una muralla. | Cada título es un mapa social.
- Los territorios no son eternos: Las tecnologías se vuelven «pergaminos frente a la imprenta». | Quien construyó su identidad sobre la roca queda «parado sobre el aire».
- La gota que horada la piedra: Confundir lo que hago con lo que soy es un proceso lento. | La sociedad premia la productividad «como si fuera una virtud moral y no una métrica».
- El vacío que ya estaba: Lo aterrador no era el desempleo: el vacío «no era nuevo». | El trabajo había sido «suficientemente ruidoso como para no escucharlo».
> «Había confundido una máscara con un rostro.»

### 03. Ser reemplazado por personas o por máquinas
Lo que reemplaza a Julio no es un rival humano, sino una ecuación sin rostro.
- La desaparición silenciosa: No hay despido formal: una llamada que no llega, un proyecto asignado a otro. | «Cuando nadie te dice que ya no eres necesario, tardas más en creerlo.»
- No lo reemplazó un humano: Un rival humano sería «una derrota comprensible», con el consuelo de reconocer al adversario. | Lo reemplazó algo sin nombre ni insomnios.
- La propia sustitución: Algoritmos entrenados sobre código escrito «por personas como él». | Sin saberlo, «construían la arquitectura de su propia sustitución».
- Pura aritmética: La IA hace el 70–90 % de las tareas por una fracción del costo. | «La decisión no es cruel: es pura aritmética.»
- Lo desconcertante: tenían razón: Sus tarifas hallaban resistencia: «con IA sale más barato». | Lo perturbador no era la resistencia, sino que era cierta.
- El borde: La amenaza no tiene rostro; no hay con quién competir. | Solo «la sensación de estar parado en el borde», sin saber si avanzar.
> «No es personal. Hay, solamente, una ecuación.»

## Parte 2: La pregunta eterna

### 04. ¿Quién soy sin mi profesión?
Bajo la etiqueta hay algo — y resulta ser lo humano: una condición, no una habilidad.
- La pregunta que rompe: Aparece cuando el ruido se detiene: un martes ordinario, un vacío «que no grita, sino que zumba».
- La respuesta que ya no sirve: «Era programador», tan incorporado que no distinguía «entre llevarla puesta y serla». | Si retiras el título y los logros, ¿qué permanece?
- El miedo más antiguo: No el miedo a quedarse sin trabajo, sino «el miedo a ser nadie». | Se siente como «buscar el suelo con el pie y no encontrarlo».
- Lo que era suyo: Leer «el problema real detrás del problema declarado». | Traducir «entre el lenguaje del miedo y el de la solución»: empatía, no programación.
- Lo que lo diferencia de la máquina: No lo que comparte (resolver, aprender), sino la imprecisión, la necesidad de sentido. | «El cansancio mezclado con la intuición.» Es humanidad.
- Debajo de la etiqueta: Un nombre describe una función, y una función se reemplaza. | Lo que vio no era vacío: alguien demasiado ocupado para saber qué otra cosa era.
> «La humanidad no es una habilidad. Es una condición.»

### 05. Las máscaras que usamos
La máscara no es falsedad; el problema es olvidar que se puede quitar.
- Prósopon: Griego: «lo que se pone frente al rostro». Permite la comunicación. | El problema: llevarla tanto que olvidas que puedes quitártela.
- Las máscaras de Julio: Hijo (impuesta), estudiante (la promesa de futuro), trabajador, padre. | El trabajador es la que más cuesta reconocer: «no se siente enmascarado, se siente útil».
- La máscara del padre: Una expansión, no una restricción: «la única parte auténtica». | Y aun así, «padre es lo que hacía». ¿Quién era?
- Todas son relacionales: Existen en función de otros; ninguna existe sola. | Si la identidad depende de relaciones, es frágil: «las personas se van».
- Falta un centro: Cada máscara dice algo; ninguna lo dice todo, y juntas tampoco. | Falta «algo que no sea prósopon, sino rostro».
- La pista: Reacciones que ninguna máscara explica (la injusticia, la belleza, el dolor ajeno): «eso era suyo».
> «Las máscaras no son cimientos. Son superficie. Y la superficie, cuando el suelo tiembla, no alcanza.»

### 06. Identidad versus roles que cumplimos
Un rol es lo que haces; la identidad es lo que eres. La distinción libera los roles.
- La distinción: Un rol es lo que haces. La identidad es lo que eres.
- Qué es un rol: Asignado y contingente: «programador no existía antes de las computadoras». | Temporal: empieza y termina. «El rol termina. ¿Y tú?»
- Qué es la identidad: No lo que te asignan, sino lo que vas «descubriendo bajo capas de roles». | No se vuelve obsoleta con la IA; evoluciona, pero desde adentro.
- Saber tus roles ≠ conocerte: Los roles se enumeran en diez segundos. | Conocerse es saber «qué te mueve cuando nadie te observa». El trabajo de toda una vida.
- Los roles, liberados: Pierden el poder de definirte, no su importancia. | La distinción «los emancipa de la responsabilidad imposible de ser todo».
- No es tecnológico, es filosófico: La IA pone en juego «la identidad de millones que construyeron quiénes eran sobre lo que hacían». | «Ningún algoritmo puede conocerte mejor de lo que tú puedes conocerte.»
> «El río no es el cauce. Pero necesita de él para ser río.»

## Parte 3: La era de la Inteligencia Artificial

### 07. ¿La IA nos reemplaza o nos redefine?
Sí, te reemplaza en los roles que confundiste con identidad. Pero puedes ser orquestador.
- La honestidad incómoda: «Sí, te reemplaza» en muchas cosas que justificaron salarios e identidades. | Decirlo no es derrotismo, es honestidad.
- Dos movimientos: Resistir: los tejedores que rompieron los telares «también tenían razón en parte. También perdieron». | O avanzar: «¿qué puedo hacer ahora que esto existe?».
- La orquesta: El director no toca ningún instrumento ni reemplaza a los músicos: «sostiene la visión completa». | «Eso es lo que estamos llamados a ser: directores, orquestadores.»
- Dónde está el límite: El sistema genera código pero «no entiende por qué importa». | Escribe texto pero «no sabe si es honesto».
- Orquestar es humano: Requiere criterio, propósito, juicio ético y comprensión del otro. | «El sistema ejecuta y optimiza; Julio decide qué vale la pena.»
- La identidad como ventaja: «Solo sabe qué orquestar quien sabe qué le importa.» | Lo que la IA nunca tendrá: experiencia vivida. «La resonancia no se optimiza. Se vive.»
> «Delegar sin criterio no es eficiencia. Es otra forma de desaparecer.»

### 08. El miedo a volverse irrelevante
Un miedo existencial, no laboral. Distingue la irrelevancia del rol (real) de la de la persona (falsa).
- Dos miedos: El miedo al hambre: antiguo, biológico, direccionable. | Y debajo, otro: el miedo a volverse irrelevante.
- «Irrelevante»: No significa malo ni equivocado: «significa que ya no importas». | El fracaso tiene narrativa; la derrota, adversario. La irrelevancia, ninguno.
- Los cuarenta segundos: Lo que él resolvió en horas, la IA lo resolvió en cuarenta segundos. | No sintió enojo, sino vértigo: «¿para qué estaba él ahí?».
- Sentirnos necesarios: No es vanidad, es estructural. | Cuando se tambalea, «lo que se trastabilla no es la autoestima profesional. Es la narración entera».
- Dos tipos de irrelevancia: La del rol: real, a veces irreversible. La de la persona: casi siempre falsa. | El miedo no distingue: «llega como un bloque». Separarlas es de lo más exigente.
- Del paralizar al mover: El miedo cambia de función: de «detente» a «muévete». | Detrás está «el apego a una versión de uno mismo que ya no puede sostenerse». Hay que soltarla.
> «Volverse irrelevante en lo que uno era no es sinónimo de volverse insignificante.»

### 09. Humanos aumentados versus humanos perdidos
La diferencia no es tecnológica: ¿sabes quién eres cuando la herramienta se apaga?
- Dos caminos: Uno incorpora lo que viene y «se vuelve más de lo que era»; el otro se detiene porque «la amenaza es identitaria». | Una brecha: «entre los que saben qué pueden soltar y los que confunden soltarlo con perderse».
- El humano aumentado real: Hoy se hace con la herramienta lo que antes requería «equipo, presupuesto y semanas». | Amplifica lo que pones: claridad→claridad, confusión→confusión más rápido.
- La calidad de la pregunta: «La calidad del resultado depende de la calidad de la pregunta.» | «La herramienta es tan buena como la inteligencia que la dirige.»
- Dos formas de perderse: La resistencia: aferrarse a lo antiguo, «un atraso que se acumula». | La rendición: delegar «el pensamiento, el criterio, la voz». «El músculo que no se usa se atrofia.»
- La confesión: Julio estuvo cerca de la rendición: dependencia «con más de huida que de eficiencia». | Lo notó cuando su opinión brotó «como si fuera un prompt».
- Seguir siendo alguien: Tu voz «viene de tus errores, de tu martes sin nombre»: lo «más difícil de reemplazar». | «El criterio no es la herramienta que usas. Es la conciencia con la que la usas.»
> «El humano aumentado no es el que delega su pensamiento a la máquina. Es el que usa la máquina para pensar más lejos.»

## Parte 4: Reconstrucción

### 10. De empleado a emprendedor
No un cambio de posición en el mercado, sino de relación con uno mismo.
- El primer lunes: Sin empresa, sin estructura. | «La libertad, en su versión pura y sin andamiaje, se siente como vértigo.»
- No eligió emprender: No fue el «emprendedor heroico»: «el trabajo desapareció y tuvo que inventar el siguiente». | Sin plan ni capital, con la urgencia de generar ingresos.
- El emprendedor es el sistema: El empleado trabaja dentro de una estructura que absorbe la incertidumbre. | El emprendedor la absorbe «en primera persona, sin red». Te defines por «lo que decides construir».
- El inventario: Lo que sabía hacer (no el CV), lo que le importaba, y lo que no sabía (la lista más larga). | «El emprendimiento no es una estrategia laboral. Es una declaración de identidad.»
- Vender perspectiva: La barrera técnica se redujo: ya no diferencia lo que sabes hacer. | Sus clientes llegaron por «cómo escuchaba antes de proponer».
- El golpe y la elección: Meses sin ingresos, la soledad, y el divorcio: Irene pidió separarse, con otro umbral de incertidumbre. | Aun así no podía detenerse: construía «la siguiente versión de sí mismo».
> «El emprendedor no vende habilidades. Vende perspectiva. Y la perspectiva se construye viviendo.»

### 11. Aprender a utilizar la IA en lugar de temerla
No es un proceso tecnológico, sino de autoconocimiento. La IA es un espejo.
- Miedo y curiosidad: «El miedo dice: retrocede; la curiosidad dice: acércate más.» | Seguir escuchando al miedo dejó de ser prudencia y se volvió postergación.
- La curva que nadie menciona: No la técnica, sino «aprender a pensar con la herramienta». | La IA es «un colaborador capaz pero literal»: no adivina lo que no sabes decir.
- Vago vs. preciso: Pedir «un texto sobre emprendimiento» da algo genérico; un pedido con perspectiva da algo usable. | «La diferencia es entre no saber qué quieres y saberlo.»
- La IA es un espejo: Cuando el resultado era malo, «la causa estaba de su lado». | «Los espejos no mejoran lo que reflejan. Muestran lo que hay.»
- Tres actitudes: Temerla; usarla sin criterio («el firmante de un trabajo que no es suyo»); o integrarla con criterio. | Saber «cuándo confiar y cuándo verificar».
- Te hace más tú mismo: Al absorber lo mecánico, «lo que no puede hacer por ti es exactamente lo que te define». | «El miedo no es el destino. Es la puerta.»
> «La IA no te ahorra el trabajo de pensar. Te obliga a hacerlo mejor y más rápido.»

### 12. Elige quién quieres ser
¿Quién soy? no tiene una respuesta. Tiene una dirección. La identidad es proceso, no destino.
- La identidad es proceso: No un destino que se tiene o no: «no está hecha para terminarse, sino para habitarse». | Su evolución «no es inestabilidad. Es vida».
- La IA volvió urgente lo importante: Mientras el mercado fue estable, la pregunta pudo postergarse «llenando el espacio con trabajo». | «Pero el silencio siempre espera.»
- Descubrir ≠ elegir: Descubrir quién eres: el trabajo hacia adentro. Elegir quién quieres ser: hacia afuera. | «El paso que convierte la búsqueda en movimiento.»
- Elegir es una práctica: No un acto único, sino las decisiones pequeñas: «¿fui coherente con quién quiero ser?». | Y fallarás: esos momentos «son parte del camino».
- Carta al lector: «El miedo no es señal de que eres más frágil: es señal de que estás prestando atención.» | La identidad es más resistente que los roles.
- La dirección es suficiente: No necesitas saber quién serás en diez años, sino «hacia dónde apunta lo que haces hoy». | Si apunta hacia adentro, tiene cimientos.
> «Elegir quién quieres ser en esta era no requiere certeza. Requiere dirección.» · Transición + Crisis = Reconstrucción.
$sum$
WHERE slug = 'quien-soy-en-la-era-de-la-inteligencia-artificial';