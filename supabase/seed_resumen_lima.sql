-- ============================================================
-- seed_resumen_lima.sql
-- Carga el resumen detallado (capítulo por capítulo) del libro
-- "Lima, la capital de las balas" en la columna book.summary,
-- agregada por migration_10.sql.
--
-- IMPORTANTE: ajusta el WHERE slug = '...' al final para que
-- coincida con el slug real de este libro en tu catálogo.
--
-- Ejecutar DESPUÉS de migration_10.sql, en: Supabase Dashboard > SQL Editor
-- ============================================================

UPDATE public.book
SET summary = $sum$
## Parte 1: El caos como sistema

### 01. Geografía del miedo
El mapa que nadie quiere dibujar
- I · El mapa secreto: Cada limeño lo carga: esta calle hasta las siete, esta nunca de noche. Sus fronteras no respetan clase ni distrito. | SJL: 5.496 denuncias | Miraflores: 4.260
- II · Las cifras que el gobierno calla: «La extorsión no creció: se industrializó.» | +478% · 2019-24 | 6,4 asesinatos/día
- III · El Tren de Aragua: De crimen doméstico a franquicia regional: un barrio, un rubro, una tarifa. Trajo método, no solo violencia — «gobernanza criminal».
- IV · Los 14 distritos en emergencia: El crimen migró a los distritos sin estado de emergencia. | 385 vs 82-85 soles/hab.
- V · El chofer de bus: Jair (chofer) y Urbana (pasajera), asesinados. «Ser pasajero es suficiente para morir.» | 95,4% camina con miedo (SJL)
- VI · La garúa como cómplice: El clima gris que oculta; una ciudad que aprendió a no ver demasiado.
> «La garúa no tiene culpa. El Estado sí.»

### 02. Extorsión y sicariato
Cuando el crimen se vuelve empresa
- I · La nota que llega en papel: «Paga o muere.» El dueño calcula y paga: denunciar «es un acto de valentía que pocos pueden permitirse».
- II · El negocio: estructura y tarifas: Industria con empresas fachada y lavado («pitufeo»). Tarifas de 100.000 a 100 soles — «el precio de unas zapatillas». | Los Gallegos: 15M soles/año
- III · El perfil del sicario: Jóvenes marginados (menores de 25). «No hay lobos solitarios: trabaja en red.» El Jorobado; Pequeño J (20 años, red transnacional). | 369 víctimas · ene-ago 2024
- IV · La prisión como sede central: «Ir a la cárcel no interrumpe las operaciones»: la cárcel como oficina a distancia. Más cárceles ≠ política de seguridad.
- V · Gamarra, el cantante y el ingeniero: Javier Carmona, baleado cantando; el ingeniero Chamorro, almorzando. Clasificar como «ajuste de cuentas» normaliza el crimen.
- VI · La economía del miedo: La extorsión como «impuesto regresivo» que ahoga a las pymes. | +2M empresas afectadas | 13 ministros del Interior
- VII · La motocicleta y el papel: La moto que desaparece y el papel sin metadatos: un sistema «primitivo y moderno a la vez». | moto: 84% de los casos
> «La inestabilidad institucional es el mejor aliado del crimen organizado.»

### 03. El Estado ausente
Cuando la policía no basta y el gobierno no llega
- I · La comisaría sin radio: Comisarías sin equipamiento básico. | 8.015 de 17.940 patrulleros inoperativos
- II · El 91,5% que lo sabe: Los propios policías reconocen la corrupción; la PNP, entre las instituciones de mayor riesgo. | 91,5% policías | 73% ciudadanía
- III · Los gasparines y la complicidad: Policías cómplices del crimen, a veces operando desde dentro de las propias unidades.
- IV · Trece ministros y ninguna política: La inestabilidad como sustituto de la política de seguridad. | 13 ministros · 2021-25
- V · El gasto que no se ejecuta: El presupuesto real cayó mientras la extorsión se multiplicaba por seis. | 52% ejecutado | 76% a patrullaje, 4% a inteligencia
- VI · La ley que nadie ve: Trece movilizaciones de transportistas en un año; el camino judicial rara vez termina en condena.
- VII · El costo de no actuar: El precio de la inacción, medido en pérdidas para toda la economía. | más de 5.800 M USD/año
- VIII · El vecino y el vacío: Cuando el Estado se ausenta, el vecino queda solo frente al vacío que alguien más llenará.
> «No se combate el crimen organizado con presupuesto de municipio rural.»

### 04. Congestión y colapso vial
La ciudad que no puede moverse
- I · Diez kilómetros: La congestión de Lima supera en 80% la de Santiago. | +6 días perdidos/año (2025)
- II · La aritmética del tiempo perdido: En hora punta, 68 horas extra al año por persona. | 27.691M soles · 2,6% del PBI
- III · La combi de ochenta años: Parque vehicular viejo e informal; gran parte de la contaminación del aire. | 67% transporte informal
- IV · El Metropolitano, el Metro y el 7%: El transporte masivo cubre apenas el 7% de los viajes. La Línea 1, saturada, falló 254 veces en 2025. | 7% de 24,6M viajes/día
- V · La ATU: seis presidentes en siete años: Una autoridad que «funciona a pedazos» y atiende a una minoría. | 6 presidentes / 7 años
- VI · El cuerpo en el tráfico: El costo en salud: asma infantil, contaminación, muertes ligadas al aire. | asma: 25% de los niños
- VII · La emergencia que llega tarde: Abril 2026: la Municipalidad declara emergencia vial (Ord. 2817). Tarde.
- VIII · El tráfico como espejo: La Línea 2 (iniciada 2014, prometida para 2020, ahora 2028): el patrón de obras inconclusas.
> «El tráfico como espejo» de una ciudad que empieza y no termina.

## Parte 2: La metrópoli que despegó

### 05. El boom empresarial
La Lima que también despega
- I · San Isidro a medianoche: El corazón financiero del país. | 47,6% de las empresas | 61,2% del PBI
- II · Credicorp y los conglomerados: Credicorp (BCP, 1889): la empresa más poderosa del Perú según la Encuesta del Poder 2024.
- III · El PBI que creció: Crecimiento sostenido e inflación baja; la inversión extranjera repuntó con fuerza. | PBI +3,4% (2025) | IED +56,7%
- IV · Chancay: el puerto que cambió el mapa: Megapuerto inaugurado en nov. 2024; buques de 24.000 TEU. | ~4.500M USD · 1,8% del PBI
- V · Las 3,5 millones de empresas: Vitalidad emprendedora, pero altísima mortalidad: por cada 77.000 nuevas, 292.000 cerraron. | 3,5M activas
- VI · Startups y ecosistema digital: Un ecosistema antes impensable: una startup limeña llegó a levantar 70M de dólares.
- VII · La agroexportación: El arándano: de casi inexistente (2010) a producto estrella. | 14.452M USD · +18%
- VIII · La ciudad que compite consigo misma: Sede de APEC (2008, 2016, 2024, 2027); Miraflores en la Cool List 2024.
> «La ciudad que compite consigo misma.»

### 06. Universidades y ascenso social
La ilusión y la promesa
- I · La primera generación: El acceso masivo creó la primera generación universitaria de muchas familias. | +95% universidades (2000-19)
- II · El Decreto Legislativo 882: 1996: universidades con fines de lucro; calidad insostenible. 2014: Ley universitaria y la Sunedu.
- III · La Sunedu debilitada: Agosto 2024: bajo presión del Congreso se recorta su capacidad de fiscalización. Un retroceso.
- IV · El ranking que Lima produce: San Marcos lidera el SCImago 2025, pero el acceso es desigual. | 51% accede | menos de 1% a posgrado
- V · El estudiante de Comas: La crónica del joven que estudia de noche en la biblioteca: la movilidad social que sí ocurre.
- VI · La investigación que no alcanza: Más publicaciones científicas, pero todavía insuficientes. | +170% publicaciones
- VII · La promesa diferida: Deserción y becas (Pronabec): una promesa de futuro que siempre llega después.
- VIII · La decana de América: San Marcos (1551): el prestigio frente al futuro que la inversión no termina de hacer llegar.
> «La universidad como promesa diferida.»

### 07. Gastronomía y marca Lima
Cuando la cocina conquistó el mundo
- I · El mejor restaurante del mundo: Maido (Tsumura) #1 del mundo (jun. 2025); Central (Martínez) lo fue en 2023.
- II · Gastón Acurio y la revolución: La revolución que arrancó en 1994. | +1.200 locales en EE.UU. | ~300 en Madrid
- III · Central, Maido y el ecosistema: No es casualidad: la cocina nikkei y la migración japonesa (1899) en la cima de la alta cocina.
- IV · El pan con chicharrón y lo digital: La Lima popular también entró al mapa; lo cotidiano, viralizado. | reservas +80% (2025)
- V · El impacto económico: Un motor de empleo y turismo. | 6.832M soles | 388.000 empleos
- VI · Las raíces: La despensa: microclimas y más de 500 alimentos domesticados por las culturas prehispánicas. | 85% de los microclimas
- VII · La Escuela de Pachacútec: Fundada por Acurio (2007) en Ventanilla: la cocina como movilidad social. | empleabilidad 63,6%
- VIII · El límite de la marca: El éxito es real e histórico; pero ¿cocina de élite mientras millones no acceden a una dieta digna?
> El límite de la marca: ¿cocina para el mundo, o también para los limeños?

### 08. Infraestructura moderna
La otra cara de Lima
- I · El aeropuerto y el colibrí: Nuevo Jorge Chávez (jun. 2025), inaugurado con 27 de 46 pasarelas. | 2.400M USD | 40M pasajeros
- II · El hub que Lima puede ser: Operación 24 horas, conexión regional. | 36 aerolíneas · +71 destinos
- III · El mercado inmobiliario: Crecimiento récord, pero un déficit habitacional de ~1,9 millones. | +30% · 21.479 viviendas
- IV · Los rascacielos que no pudo tener: Torres y autopistas (Periférico, Vía Central) frustradas o aplazadas.
- V · El Gran Teatro Nacional: Inaugurado en 2011 (1.500 butacas) y la Biblioteca Nacional: la infraestructura cultural que sí llegó.
- VI · La brecha: El aeropuerto de 2.400M frente a una ciudad donde el 44% de las comisarías no tiene equipamiento.
- VII · Proyecciones: la Lima que viene: Líneas 3 y 4 del Metro: del 7% al 30-40% de viajes hacia 2035, si se aprende de la Línea 2.
> La modernidad de la torre y la ausencia de la comisaría, en la misma ciudad.

## Parte 3: Dos Limas, una ciudad

### 09. Lima de arriba y Lima de abajo
El mapa que la ciudad no quiere reconocer
- I · El agua que revela todo: El consumo de agua dibuja la desigualdad mejor que cualquier mapa. | San Isidro: 227 L | Ventanilla: 103 L
- II · El Gini y los dos décimos: El sistema fiscal apenas corrige la desigualdad (4% vs 18% en Argentina). | Gini 0,403 | pobreza Lima 27%
- III · 17,55 y 9,63 soles por hora: El mismo trabajo, dos salarios; informalidad altísima en los conos. | Centro 17,55 · Sur menos de 10 | informalidad 62%
- IV · Dos ciudades con el mismo nombre: El IDH crece levemente, pero las mejoras no llegan parejas a toda la ciudad.
- V · El centralismo dentro del centralismo: Lima concentra el empleo formal; y dentro de Lima, los conos quedan al margen. | 76% del empleo formal
- VI · La pobreza invisible: Concentrada y normalizada; el 40% de los conos sin agua 24 horas. | 35,2% de la pobreza absoluta
- VII · La captura del Estado: Leyes que costaron 12.000M de soles al tesoro (2024); la mayoría cree que los ricos influyen indebidamente. | 69% lo percibe
- VIII · El hilo que une las dos Limas: El hilo invisible que las conecta —y las separa— al mismo tiempo.
> «El Estado peruano cobra, pero casi no corrige.»

### 10. La sociedad fatigada
Cuando el miedo se vuelve costumbre
- I · El parque que ya no se usa: El espacio público abandonado por miedo: la normalidad del encierro.
- II · Ocho de cada diez: La salud mental se desborda y queda sin atención. | 14.736 diagnósticos · +50% | 52,5% sin atención
- III · La desconfianza que corroe: La confianza en el gobierno se desplomó del 44% (2019) al 7,5% (2025). | 90% desconfía del Congreso
- IV · El 55% y el peligro del mesías: La fatiga democrática abre la puerta al autoritarismo. | 55% apoyaría cerrar el Congreso | ~230 protestas/mes
- V · La ansiedad que nadie atiende: Recursos de salud mental insuficientes para 33 millones de personas.
- VI · La política del desencanto: La satisfacción con la democracia se hundió. | 35,3% (2019) → 21,6% (2024) | 76% sin partido
- VII · Lo que resiste: Y aun así, algo resiste: la vida cotidiana, la solidaridad, la terquedad de seguir.
> Cuando el miedo deja de ser reacción y se vuelve una actitud permanente.

### 11. Migración y choque cultural
La Lima que llegó de todas partes
- I · El hombre con la maleta de cuero: La gran migración que multiplicó la ciudad en cuatro décadas. | 645.172 (1940) → ~6M (1984)
- II · Los distritos de una invasión: La cronología de las barriadas: El Agustino, Comas, Villa El Salvador, SJL, Huaycán.
- III · El racismo que no se llama racismo: La discriminación cotidiana, en aumento y concentrada en la capital. | +55% de las denuncias
- IV · La tercera generación: Del criollo de 1940 que veía llegar a los migrantes a una nueva identidad limeña, mestiza y propia.
- V · Los clubes provincianos: El tejido invisible: redes de solidaridad que sostuvieron a quienes llegaban sin nada.
- VI · La migración venezolana y el espejo: La gran migración reciente como espejo de la propia historia migrante de Lima.
- VII · Lo que la migración le dio a Lima: La revolución gastronómica, la economía popular, la energía: lo que la migración construyó.
> La Lima que llegó de todas partes y todavía no se reconoce entera.

### 12. ¿Puede Lima salvarse a sí misma?
La pregunta sin respuesta fácil
- I · La ciudad que el dato no explica: 35 candidatos, la cifra más alta de la historia electoral del país; nadie superó el 20% en primera vuelta. Keiko Fujimori ganó la segunda y juró el 28 de julio de 2026. | 35 candidatos | 1.826 días de plazo
- II · Lo que el diagnóstico muestra: Las dos Limas, el caos y el auge, la desigualdad: el retrato completo, sin anestesia.
- III · Las condiciones para el cambio: Estabilidad macroeconómica y sociedad civil activa sí existen; lo que falta es continuidad institucional.
- IV · Los modelos que existen: Medellín no resolvió la violencia solo con policía. | 300 → menos de 20 homicidios/100 mil
- V · Lo que Lima tiene que decidir: Tres decisiones pendientes: represión o prevención, subir impuestos a quienes más tienen, e instituciones que sobrevivan al gobierno de turno.
- VI · La generación que decide: Las protestas de 2025 articularon a los jóvenes: la generación que decide la Lima de 2040. | 1 muerto · 128 heridos
- VII · Una respuesta provisional: «Puede, pero no está claro que vaya a»: no hay respuesta definitiva, pero mirar la ciudad sin anestesia es el primer paso.
> El reloj de los 1.826 días ya corre. No cambia que el 91,5% de los policías sabe, ni que el metro mueve solo al 7%. El diagnóstico es el comienzo.
$sum$
WHERE slug = 'lima-la-capital-de-las-balas';