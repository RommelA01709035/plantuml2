export default function Docs() {
  return (
    <div className="docs-shell">
      <nav className="docs-toc">
        <div className="docs-toc-title">Contenido</div>
        <ol>
          <li><a href="#overview">Visión general</a></li>
          <li><a href="#tipos">Tipos de diagrama</a></li>
          <li><a href="#empezar">Empezar</a></li>
          <li><a href="#componentes">Componentes</a></li>
          <li><a href="#pasos">Pasos y retornos</a></li>
          <li><a href="#self">Self-calls</a></li>
          <li><a href="#condiciones">Condiciones (alt)</a></li>
          <li><a href="#separadores">Separadores</a></li>
          <li><a href="#temas">Temas</a></li>
          <li><a href="#draw">draw()</a></li>
          <li><a href="#validaciones">Validaciones</a></li>
          <li><a href="#editor">Edición visual</a></li>
          <li><a href="#ejemplos">Ejemplos</a></li>
          <li><a href="#limites">Límites conocidos</a></li>
        </ol>
      </nav>

      <main className="docs-content">
        <header className="docs-hero">
          <h1>Fluent Diagram Grammar</h1>
          <p>API encadenada tipo Keras para diagramas de secuencia UML. Escribes intención (componentes, pasos, condiciones); el motor calcula layout, valida y dibuja.</p>
        </header>

        <section id="overview">
          <p className="docs-kicker">Visión general</p>
          <h2>Un diagrama es una cadena de métodos</h2>
          <p>Nada de bloques con llaves ni sintaxis de texto plano. El código <em>es</em> el modelo — se ejecuta como JS real (mismo motor que <code>Sequence(...).draw()</code> usa internamente) y produce un AST validado más un canvas interactivo.</p>
          <pre><code>{`Sequence("Login")
  .uses(
    actor("Usuario"),
    app("Frontend"),
    service("Auth"),
    db("Users")
  )
  .step("Usuario", "Frontend", "Ingresa credenciales")
  .step("Frontend", "Auth", "Valida credenciales")
  .when("Credenciales correctas")
    .then()
      .step("Auth", "Frontend", "Crea sesión")
    .otherwise()
      .return("Auth", "Frontend", "Error")
  .end()
  .theme("modern")
  .draw()`}</code></pre>
        </section>

        <section id="tipos">
          <p className="docs-kicker">Alcance actual</p>
          <h2>Qué diagramas se pueden usar</h2>
          <p>La gramática está diseñada pa que <code>TipoDeDiagrama(nombre).uses().step().when().theme().draw()</code> sea el mismo patrón mental sin importar el tipo — pero hoy solo uno está implementado.</p>
          <div className="docs-tbl-wrap">
            <table>
              <thead><tr><th>Tipo</th><th>Estado</th><th>Notas</th></tr></thead>
              <tbody>
                <tr><td><code>Sequence(name)</code></td><td className="docs-sev-ok">Disponible</td><td>Todo lo documentado en esta página. Es lo único que puedes escribir/dibujar ahorita.</td></tr>
                <tr><td><code>Activity(name)</code></td><td className="docs-sev-pending">Planeado</td><td>Diagrama de actividad — <code>.lane()</code>, <code>.task()</code>, <code>.start()</code>/<code>.finish()</code>. No implementado.</td></tr>
                <tr><td><code>ER(name)</code></td><td className="docs-sev-pending">Planeado</td><td>Entidad-relación — <code>.table()</code>, <code>.oneToMany()</code>. No implementado.</td></tr>
                <tr><td><code>Package(name)</code></td><td className="docs-sev-pending">Planeado</td><td>Diagrama de paquetes — <code>.add()</code>, <code>.depends()</code>. No implementado.</td></tr>
                <tr><td><code>Deployment(name)</code></td><td className="docs-sev-pending">Planeado</td><td>Diagrama de despliegue — <code>.node()</code>, <code>.link()</code>. No implementado.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="docs-muted">Si escribes <code>Activity(...)</code> hoy, <code>new Function</code> tira <code>ReferenceError: Activity is not defined</code> — solo <code>Sequence</code>, <code>actor</code>, <code>app</code>, <code>service</code>, <code>db</code>, <code>api</code>, <code>queue</code>, <code>storage</code> están inyectados al evaluar el código.</p>
        </section>

        <section id="empezar">
          <p className="docs-kicker">Empezar</p>
          <h2>Sequence, uses, draw</h2>
          <p><code>Sequence(name)</code> abre la cadena. <code>.uses(...)</code> declara participantes (opcional — ver inferencia abajo). <code>.draw()</code> cierra la cadena y regresa el resultado.</p>
          <div className="docs-tbl-wrap">
            <table>
              <thead><tr><th>Método</th><th>Qué hace</th></tr></thead>
              <tbody>
                <tr><td><code>Sequence(name)</code></td><td>Crea el builder. <code>name</code> es el título del diagrama.</td></tr>
                <tr><td><code>.uses(...componentes)</code></td><td>Declara participantes explícitos. Activa el modo "estricto" — referenciar un nombre no declarado en <code>.step()</code> es error.</td></tr>
                <tr><td><code>.theme(nombre)</code></td><td>Ver sección Temas.</td></tr>
                <tr><td><code>.draw()</code></td><td>Valida y regresa <code>{'{ ast, warnings, svg }'}</code>.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="componentes">
          <p className="docs-kicker">Componentes</p>
          <h2>Helpers y tipos</h2>
          <p>Cada helper regresa <code>{'{ id, label, type }'}</code>. El <code>id</code> se genera con slugify: <code>"Usuario Final"</code> → <code>"usuario-final"</code>.</p>
          <div className="docs-pill-row">
            <span className="docs-pill">actor(name)</span>
            <span className="docs-pill">app(name)</span>
            <span className="docs-pill">service(name)</span>
            <span className="docs-pill">db(name)</span>
            <span className="docs-pill">api(name)</span>
            <span className="docs-pill">queue(name)</span>
            <span className="docs-pill">storage(name)</span>
          </div>

          <h3>Referencia por string u objeto</h3>
          <pre><code>{`const Usuario = actor("Usuario")
const Frontend = app("Frontend")

// ambas formas funcionan en .step()/.return():
.step("Usuario", "Frontend", "mensaje")
.step(Usuario, Frontend, "mensaje")`}</code></pre>

          <h3>Modo inferencia (sin <code>.uses()</code>)</h3>
          <p>Si nunca llamas <code>.uses()</code>, cada nombre nuevo en <code>.step()</code> crea un componente automático, con tipo inferido por el nombre:</p>
          <div className="docs-tbl-wrap">
            <table>
              <thead><tr><th>Patrón en el nombre</th><th>Tipo inferido</th></tr></thead>
              <tbody>
                <tr><td><code>whatsapp</code>, <code>api</code></td><td><code>api</code></td></tr>
                <tr><td><code>queue</code>, <code>cola</code></td><td><code>queue</code></td></tr>
                <tr><td><code>storage</code>, <code>bucket</code></td><td><code>storage</code></td></tr>
                <tr><td><code>db</code>, <code>database</code>, <code>users</code></td><td><code>db</code></td></tr>
                <tr><td><code>auth</code>, <code>service</code></td><td><code>service</code></td></tr>
                <tr><td><code>front</code>, <code>app</code>, <code>ui</code></td><td><code>app</code></td></tr>
                <tr><td><code>usuario</code>, <code>user</code>, <code>actor</code>, <code>client</code></td><td><code>actor</code></td></tr>
                <tr><td>ninguno de los anteriores</td><td><code>unknown</code></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pasos">
          <p className="docs-kicker">Pasos y retornos</p>
          <h2>step vs return</h2>
          <p><code>.step()</code> dibuja flecha sólida con punta cerrada (llamada). <code>.return()</code> dibuja flecha punteada con punta abierta — semántica UML de retorno callee→caller.</p>
          <pre><code>{`.step("Frontend", "Auth", "valida")     // sólida, →
.return("Auth", "Frontend", "ok")       // punteada, - ->`}</code></pre>
          <p className="docs-muted">Ambas aceptan el mismo <code>(from, to, message)</code>. El orden de llamada en la cadena determina el orden temporal (eje Y) — no hay coordenadas manuales.</p>
        </section>

        <section id="self">
          <p className="docs-kicker">Detección automática</p>
          <h2>Self-calls</h2>
          <p>Si <code>from === to</code>, el step se dibuja como loop rectangular sobre la misma lifeline en vez de una flecha horizontal inútil. No requiere sintaxis especial:</p>
          <pre><code>.step("Auth", "Auth", "checa cache interno")</code></pre>
        </section>

        <section id="condiciones">
          <p className="docs-kicker">Branching</p>
          <h2>when / then / otherwise / end</h2>
          <p>Se renderiza como fragmento <strong>alt</strong> real dentro del canvas (caja punteada, tab "ALT", divisor "si no") — no como lista de texto aparte.</p>
          <pre><code>{`.when("Token expirado")
  .then()
    .step("Frontend", "Auth", "refresca")
  .otherwise()
    .step("Frontend", "Usuario", "continúa")
.end()`}</code></pre>
          <p>Se anida sin límite — un <code>.when()</code> dentro de un <code>.then()</code>/<code>.otherwise()</code> dibuja un fragmento dentro de otro.</p>
          <h3>Alias</h3>
          <div className="docs-pill-row">
            <span className="docs-pill">.if(label) = .when(label)</span>
            <span className="docs-pill">.yes() = .then()</span>
            <span className="docs-pill">.no() = .otherwise()</span>
          </div>
        </section>

        <section id="separadores">
          <p className="docs-kicker">Fases</p>
          <h2>separator</h2>
          <p>Equivalente al <code>{'== texto =='}</code> de PlantUML — línea horizontal con label centrado, marca una fase nueva sin ser participante ni mensaje.</p>
          <pre><code>.separator("Segunda fase")</code></pre>
        </section>

        <section id="temas">
          <p className="docs-kicker">Estética</p>
          <h2>theme()</h2>
          <div className="docs-pill-row">
            <span className="docs-pill">modern (default)</span>
            <span className="docs-pill">clean</span>
            <span className="docs-pill">warm</span>
            <span className="docs-pill">dark</span>
            <span className="docs-pill">compact</span>
          </div>
          <p className="docs-muted">Afecta solo el <code>svg</code> estático que regresa <code>.draw()</code>. El canvas interactivo del editor usa su propio tema fijo, independiente de esto.</p>
        </section>

        <section id="draw">
          <p className="docs-kicker">Salida</p>
          <h2>¿Qué regresa draw()?</h2>
          <pre><code>{`{
  ast: DiagramModel,        // componentes + flow, fuente de verdad
  warnings: ValidationWarning[],
  svg: string               // render estático standalone (no interactivo)
}`}</code></pre>
          <p className="docs-muted">El editor visual (canvas ReactFlow) se construye a partir de <code>ast</code>, no de <code>svg</code> — <code>svg</code> es un export independiente, útil si usas la librería fuera de la app.</p>
        </section>

        <section id="validaciones">
          <p className="docs-kicker">Antes de dibujar</p>
          <h2>Validaciones automáticas</h2>
          <div className="docs-tbl-wrap">
            <table>
              <thead><tr><th>Caso</th><th>Severidad</th><th>Detalle</th></tr></thead>
              <tbody>
                <tr><td>Participante no declarado (modo <code>.uses()</code> estricto)</td><td className="docs-sev-error">Error</td><td>Sugiere el nombre declarado más parecido.</td></tr>
                <tr><td><code>.when()</code> sin <code>.then()</code></td><td className="docs-sev-error">Error</td><td>Toda condición necesita rama then.</td></tr>
                <tr><td><code>.when()</code> sin <code>.otherwise()</code></td><td className="docs-sev-warn">Warning</td><td>No bloquea el dibujo, solo avisa.</td></tr>
                <tr><td>Mismo nombre con dos tipos distintos en <code>.uses()</code></td><td className="docs-sev-error">Error</td><td>Ej. <code>app("Auth")</code> y <code>db("Auth")</code> a la vez.</td></tr>
                <tr><td>Mensaje de <code>.step()</code> vacío</td><td className="docs-sev-warn">Warning</td><td>Da ejemplo del formato esperado.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="docs-callout docs-callout-error">
            <strong>Errores</strong> detienen <code>.draw()</code> (lanzan <code>DiagramValidationError</code> con mensaje accionable).
          </div>
          <div className="docs-callout docs-callout-warn">
            <strong>Warnings</strong> no detienen nada — llegan en <code>result.warnings</code> y se muestran bajo el canvas.
          </div>
        </section>

        <section id="editor">
          <p className="docs-kicker">Más allá del código</p>
          <h2>Edición visual (canvas)</h2>
          <p>El código y el diagrama están sincronizados en ambas direcciones. Escribir código redibuja el canvas (debounce 500ms); editar el canvas regenera el código automáticamente.</p>

          <h3>Participantes</h3>
          <div className="docs-icon-key">
            <span>drag ↔</span><span>mueve el participante horizontalmente (la lifeline lo sigue)</span>
            <span>doble-click</span><span>renombra inline</span>
            <span>🗑</span><span>borra el participante y cualquier step que lo referenciaba</span>
          </div>

          <h3>Pasos (steps)</h3>
          <div className="docs-icon-key">
            <span>drag de un handle a otro</span><span>conecta dos participantes → crea step nuevo al final</span>
            <span>click en el mensaje</span><span>edita el texto inline</span>
            <span>▲ / ▼</span><span>reordena el step (swap con el vecino) — cambia el orden temporal</span>
            <span>↕ alargar / acortar</span><span>agrega o quita 20px de espacio vertical después de ese step</span>
            <span>🗑</span><span>borra el step</span>
          </div>

          <h3>Condiciones, separadores, participantes nuevos</h3>
          <p>Botones <code>+ condición</code>, <code>+ separador</code>, <code>+ participante</code> en la barra superior agregan al nivel raíz. Dentro de cada fragmento <em>alt</em>, cada rama (then/otherwise) tiene sus propios <code>+ paso</code> / <code>+ condición</code> pa anidar.</p>

          <h3>Activation bars</h3>
          <p className="docs-muted">Barra vertical sobre la lifeline mientras un participante está "ocupado": se abre cuando recibe un <code>.step()</code> (llamada), se cierra cuando manda el <code>.return()</code> correspondiente (pila LIFO por participante). Lo que queda abierto se cierra al final del diagrama — versión simple, no contabiliza llamadas anidadas perfectamente.</p>
        </section>

        <section id="ejemplos">
          <p className="docs-kicker">Código real</p>
          <h2>El pipeline de esta misma app</h2>
          <p>Este ejemplo no es genérico — documenta el flujo real de <code>FluentEditor → SequenceBuilder → ParticipantGraph</code> que ya viste funcionando. Úsalo pa probar <code>.return()</code>, self-call y <code>.separator()</code> juntos: pégalo en la pestaña <strong>Editor</strong>.</p>
          <pre><code>{`Sequence("Fluent Diagram Grammar — pipeline interno")
  .uses(
    actor("Usuario"),
    app("FluentEditor"),
    service("runFluentCode"),
    service("SequenceBuilder"),
    service("computeSequenceLayout"),
    app("ParticipantGraph"),
    service("astOps"),
    service("generateFluentCode")
  )
  .step("Usuario", "FluentEditor", "escribe código")
  .step("FluentEditor", "runFluentCode", "runNow(code)")
  .step("runFluentCode", "SequenceBuilder", "Sequence().uses().step()...draw()")
  .return("SequenceBuilder", "runFluentCode", "{ ast, warnings }")
  .return("runFluentCode", "FluentEditor", "setAst(ast)")
  .step("FluentEditor", "computeSequenceLayout", "computeSequenceLayout(ast)")
  .return("computeSequenceLayout", "FluentEditor", "steps + frames + activations")
  .step("FluentEditor", "ParticipantGraph", "props (model, resetSignal++)")
  .step("ParticipantGraph", "ParticipantGraph", "build nodes + edges")
  .return("ParticipantGraph", "Usuario", "dibuja diagrama")
  .separator("Usuario edita en el diagrama")
  .step("Usuario", "ParticipantGraph", "drag / connect / +paso")
  .step("ParticipantGraph", "astOps", "renameComponent() / addStep() / moveComponent()")
  .return("astOps", "ParticipantGraph", "nuevo AST inmutable")
  .step("ParticipantGraph", "FluentEditor", "onChange(nuevoAst)")
  .step("FluentEditor", "generateFluentCode", "generateFluentCode(nuevoAst)")
  .return("generateFluentCode", "FluentEditor", "código regenerado")
  .return("FluentEditor", "Usuario", "textarea actualizado")
  .theme("modern")
  .draw()`}</code></pre>
          <p className="docs-muted">Trae: <code>.step()</code> normal, <code>.return()</code> punteado, self-call (<code>ParticipantGraph → ParticipantGraph</code>) y <code>.separator()</code> — los 4 elementos que no salen en el ejemplo de <a href="#overview">Login</a> de arriba.</p>
        </section>

        <section id="limites">
          <p className="docs-kicker">Honestidad</p>
          <h2>Límites conocidos</h2>
          <div className="docs-callout">
            <strong>Posición y espaciado son UI-only</strong>
            <p>La posición X de un participante y el <code>gapAfter</code> de un step no existen en la gramática (no hay coordenadas en el diseño). Sobreviven mientras edites vía diagrama, pero si reemplazas el código completo desde cero, el espaciado manual se resetea (la posición de participantes sí se preserva por id).</p>
          </div>
          <div className="docs-callout">
            <strong>Solo <code>Sequence</code> existe</strong>
            <p>La arquitectura está pensada para soportar después <code>Activity</code>, <code>ER</code>, <code>Package</code>, <code>Deployment</code> con el mismo patrón mental — pero hoy solo el diagrama de secuencia está implementado.</p>
          </div>
          <div className="docs-callout">
            <strong>No hay rotar/resize de cajas</strong>
            <p>Las cajas de participante tienen ancho fijo (140px) — es notación UML fija, no un lienzo de dibujo libre.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
