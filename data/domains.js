// Contenido de la web de repaso CCDV-F.
// Regla: todo dato específico de Claude sale de ../apuntes/ (00-guia-examen, 01-messages-api, 02-cookbook, 03-context-windows).
// Texto entre backticks se muestra como código.

const G = "00-guia-examen.md";
const M = "01-messages-api.md";
const C = "02-cookbook.md";
const W = "03-context-windows.md";

export const exam = {
  code: "CCDV-F",
  questions: 53,
  minutes: 120,
  passingScore: "720 (escala 100–1.000)",
  cost: "USD 125 por intento",
  validity: "12 meses",
  source: G,
};

export const domains = [
  {
    id: "agents-workflows",
    number: 1,
    title: "Agents & Workflows",
    weight: 14.7,
    status: "completo",
    summary:
      "Un agente es, en el fondo, un loop: Claude recibe una tarea y un set de tools, decide si necesita usar alguna, el código del cliente la ejecuta, devuelve el resultado y Claude vuelve a decidir. El loop termina cuando el modelo responde sin pedir más tools. En la Messages API eso se ve como respuestas con `stop_reason: \"tool_use\"` que vos contestás con un bloque `tool_result` dentro de un mensaje `user`. Como la API no guarda estado, el que lleva el historial es tu código.\n\n" +
      "Este dominio pregunta cómo se construye ese loop y con qué piezas. Podés escribirlo a mano, usar el Agent SDK o desplegar con Managed Agents (Anthropic-hosted) en vez de self-hosted; la guía aclara que Managed Agents entra en el examen. También entran los harnesses y los hooks para acciones deterministas, es decir, cosas que tienen que pasar siempre y no dependen de lo que decida el modelo.\n\n" +
      "La otra mitad es de arquitectura y patrones: cuándo alcanza con un workflow (pasos fijos que vos orquestás) y cuándo conviene un agente que decide el camino; jerarquías manager/supervisor; subagents para repartir trabajo y aislar contexto; memoria y gestión de la ventana en tareas largas. El Cookbook trae los patrones con nombre (basic workflows, orchestrator-workers, evaluator-optimizer) y la guía menciona frameworks de terceros como Strands, LangGraph y PydanticAI.\n\n" +
      "Las preguntas son de escenario: elegir la arquitectura más simple que resuelve el problema y explicar por qué las otras sobran o no alcanzan.",
    keyPoints: [
      "Loop básico: `stop_reason: \"tool_use\"` → ejecutás la tool → devolvés `tool_result` en un mensaje `user` → Claude sigue.",
      "La API es sin estado: el cliente guarda y reenvía todo el historial en `messages`.",
      "Formas de construir: loop propio, Agent SDK, o Managed Agents (Anthropic-hosted) vs. self-hosted. Managed Agents entra en el examen.",
      "Workflow = pasos fijos orquestados por código; agente = el modelo decide el camino. Usá lo más simple que alcance.",
      "Subagents y jerarquías manager/supervisor reparten trabajo y aíslan contexto.",
      "Patrones del Cookbook: basic workflows, orchestrator-workers, evaluator-optimizer, memory & context management.",
    ],
    examples: [
      {
        title: "Loop de tools mínimo (TS)",
        text: "Mientras la respuesta pida tools, se ejecutan y se devuelven los resultados. El historial lo arma el cliente.",
        code: `const tools = [{
  name: "get_weather",
  description: "Clima actual de una ciudad",
  input_schema: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
}];
const messages = [{ role: "user", content: "¿Qué clima hace en Rosario?" }];

let res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 1024, tools, messages });
while (res.stop_reason === "tool_use") {
  messages.push({ role: "assistant", content: res.content });
  const results = res.content
    .filter((b) => b.type === "tool_use")
    .map((b) => ({ type: "tool_result", tool_use_id: b.id, content: runTool(b.name, b.input) }));
  messages.push({ role: "user", content: results });
  res = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 1024, tools, messages });
}`,
        source: M,
      },
    ],
    subtopics: [
      {
        id: "agent-construction",
        title: "Agent Construction",
        weight: 5.3,
        status: "completo",
        summary:
          "Cómo se arma un agente en la práctica. La guía nombra el Agent SDK, los agent loops propios, los harnesses, el despliegue self-hosted vs. Anthropic-hosted (Managed Agents) y los hooks para acciones deterministas. El mecanismo base es siempre el mismo: la respuesta trae `stop_reason: \"tool_use\"`, tu código ejecuta la tool y devuelve un `tool_result` en un mensaje `user`. La API no recuerda nada, así que el loop reenvía el historial completo en cada vuelta.",
        keyPoints: [
          "Opciones: loop propio, Agent SDK, Managed Agents (Anthropic-hosted) o self-hosted.",
          "Managed Agents no es opcional para el examen (la guía lo marca como hueco del roadmap).",
          "Hooks: para acciones que tienen que pasar siempre, sin depender de la decisión del modelo.",
          "El `tool_result` va en un mensaje con rol `user` y referencia el `tool_use_id`.",
        ],
        sources: [G, M],
      },
      {
        id: "patterns-frameworks",
        title: "Patterns & Frameworks",
        weight: 4.9,
        status: "completo",
        summary:
          "Los patrones reutilizables para armar agentes: tool-use loops, subagents, memoria y gestión de la ventana de contexto. El Cookbook los muestra con nombre: basic workflows, orchestrator-workers (un orquestador reparte subtareas a workers), evaluator-optimizer (un LLM genera, otro evalúa con criterios y devuelve feedback hasta aprobar) y memory & context management. En agentes largos, la compaction y el context editing evitan que la ventana se llene. La guía también nombra frameworks de terceros: Strands, LangGraph y PydanticAI.",
        keyPoints: [
          "Evaluator-optimizer: generar → evaluar con criterios → feedback → iterar hasta aprobar.",
          "Orchestrator-workers: un orquestador reparte subtareas y junta resultados.",
          "Agentes largos: server-side compaction (beta) y context editing para no llenar la ventana.",
          "Frameworks de terceros que nombra la guía: Strands, LangGraph, PydanticAI.",
        ],
        sources: [G, C, W],
      },
      {
        id: "architecture",
        title: "Architecture",
        weight: 4.5,
        status: "completo",
        summary:
          "Principios, patrones y tradeoffs de las arquitecturas de agentes y de workflows. El centro es el criterio de decisión: un workflow sigue pasos definidos de antemano y es más predecible, barato y fácil de depurar; un agente decide el camino en tiempo de ejecución y conviene cuando los pasos no se pueden prever. También entra cómo estructurar jerarquías manager/supervisor (uno coordina, otros ejecutan) y el rol de los subagents para ejecutar mejor una tarea: repartir trabajo y darle a cada parte un contexto acotado.",
        keyPoints: [
          "Workflow: camino fijo, más control y previsibilidad. Agente: camino dinámico, más flexibilidad y más costo.",
          "Regla práctica de escenario: elegir la arquitectura más simple que resuelve el problema.",
          "Jerarquía manager/supervisor: un agente coordina y delega; los demás ejecutan partes acotadas.",
          "Subagents: dividen la tarea y aíslan contexto para que cada parte trabaje con lo que necesita.",
        ],
        sources: [G],
      },
    ],
  },
  {
    id: "applications-integration",
    number: 2,
    title: "Applications & Integration",
    weight: 33.1,
    status: "completo",
    summary:
      "Es el dominio más pesado del examen: un tercio de las preguntas. Mezcla tres cosas: diseñar aplicaciones con Claude, conocer bien la mecánica de la API y tener base general de ingeniería de software.\n\n" +
      "Del lado de Claude, entra cómo interpreta las instrucciones según la interfaz (Claude Code, Desktop, claude.ai, la API, los SDKs), el diseño de schemas, los límites de contenido, la session hygiene y la gestión de plugins. La mecánica de la API es concreta: `POST /v1/messages` con tres parámetros obligatorios (`model`, `max_tokens`, `messages`), `system` como parámetro top-level, `content` de la respuesta siempre como array, `stop_reason` y `usage` para saber cómo terminó y cuánto costó. Suma streaming, tools, vision, thinking, caching, el acceso por terceros (Bedrock, Vertex, Foundry) y la Message Batches API para trabajos grandes que no necesitan respuesta inmediata.\n\n" +
      "Configuration Mgmt pide saber fijar la versión del modelo (pinning), versionar prompts y manejar CLAUDE.md, settings.json y dependencias de plugins.\n\n" +
      "La otra parte no viene de la docs de Claude: REST, JSON, programación asíncrona, control de versiones, SDLC, code review, refactors, entender requerimientos funcionales y de infraestructura, y gestión del ciclo de vida de sistemas. Según la guía, la base general de ingeniería ronda el 20% del examen, y buena parte está acá.",
    keyPoints: [
      "Pesa 33.1%: es el dominio más grande del examen.",
      "Obligatorios de `POST /v1/messages`: `model`, `max_tokens`, `messages`. `system` es top-level, no un rol.",
      "La respuesta trae `content` como array, `stop_reason` y `usage`.",
      "Batch vs. tiempo real: Message Batches API para volumen grande, asíncrono (dentro de 24 h) y más barato.",
      "Pinning: fijar el ID del modelo y el header `anthropic-version` para que nada cambie solo.",
      "Software Eng. Foundations, Requirements y Systems Life Cycle son ingeniería general, no docs de Claude.",
    ],
    examples: [
      {
        title: "Request mínimo y multi-turno (TS)",
        text: "La API no recuerda nada: para seguir la conversación, el cliente reenvía todo el historial.",
        code: `import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // toma la key de ANTHROPIC_API_KEY

const history = [];
history.push({ role: "user", content: "Hola" });
const r = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 512,
  system: "Sos un profesor paciente. Respondé en español.",
  messages: history,
});
history.push({ role: "assistant", content: r.content }); // se reenvía el array tal cual
history.push({ role: "user", content: "¿Y qué más?" });`,
        source: M,
      },
    ],
    subtopics: [
      {
        id: "claude-app-design",
        title: "Claude App Design",
        weight: 8.6,
        status: "completo",
        summary:
          "Diseñar aplicaciones que usan Claude. La guía incluye cómo interpreta Claude las instrucciones según la interfaz (Claude Code, Desktop, claude.ai, la API, los SDKs), los límites de contenido, el diseño de schemas, la session hygiene y la gestión de plugins. En la API, las instrucciones de comportamiento van en `system`, que es un parámetro top-level, y cuando necesitás datos con forma fija conviene definir un JSON Schema y usar structured outputs en lugar de pedir \"respondé en JSON\".",
        keyPoints: [
          "La misma instrucción puede leerse distinto según la interfaz: Claude Code, Desktop, claude.ai, API o SDK.",
          "En la API, `system` es top-level; no es un mensaje con rol.",
          "Schemas bien diseñados + structured outputs (`output_config.format`) para salidas con forma fija.",
          "Session hygiene: no arrastrar contexto que ya no sirve de una tarea a otra.",
        ],
        sources: [G, M],
      },
      {
        id: "software-eng-foundations",
        title: "Software Eng. Foundations",
        weight: 7.4,
        status: "completo",
        summary:
          "Base general de ingeniería que el examen da por sabida: REST (recursos, verbos HTTP, códigos de estado), JSON, programación asíncrona (promesas, `async`/`await`, no bloquear mientras esperás una respuesta de red), control de versiones, SDLC, code review y refactors chicos y grandes. No sale de la docs de Claude sino de la experiencia como developer. Junto con Technical Fundamentals, Requirements y Systems Life Cycle, la guía estima que esta base suma cerca del 20% del examen.",
        keyPoints: [
          "REST y JSON: la Messages API es un endpoint HTTP que recibe y devuelve JSON.",
          "Asincronía: las llamadas a la API son de red; se esperan sin bloquear (`await`).",
          "Control de versiones, code review y refactors: prácticas generales, no específicas de Claude.",
          "Cerca del 20% del examen es base general de ingeniería.",
        ],
        sources: [G],
      },
      {
        id: "api-mechanics",
        title: "API Mechanics",
        weight: 6.8,
        status: "completo",
        summary:
          "Cómo funciona la API por dentro. `POST /v1/messages` es sin estado y pide `model`, `max_tokens` y `messages`. La respuesta trae `content` como array de bloques, `stop_reason` y `usage`. Con `stream` llegan eventos (`message_start`, `content_block_delta`, `message_delta`, `message_stop`). Entran también tools, vision, thinking y caching. Por request se pueden mandar hasta 600 imágenes o páginas de PDF (100 en modelos de 200k). La Message Batches API procesa en forma asíncrona, dentro de 24 h y más barato. Claude también se accede por terceros: Bedrock, Vertex y Foundry.",
        keyPoints: [
          "Sin estado: cada request lleva toda la conversación.",
          "Streaming: `stop_reason` llega en `message_delta`, no en `message_start`.",
          "Hasta 600 imágenes/páginas PDF por request (100 en modelos de 200k).",
          "Batch (asíncrono, dentro de 24 h, más barato) vs. tiempo real: decide la urgencia.",
        ],
        sources: [G, M, W],
      },
      {
        id: "configuration-mgmt",
        title: "Configuration Mgmt",
        weight: 4.1,
        status: "completo",
        summary:
          "Gestionar la configuración para que el comportamiento sea reproducible. La guía nombra CLAUDE.md, settings.json, fijar la versión del modelo (pinning), versionar prompts y manejar dependencias de plugins. Pinning en la API significa usar un ID de modelo concreto (por ejemplo `claude-opus-5-5`, `claude-sonnet-5-5` o `claude-haiku-5-5`) y mandar el header `anthropic-version` (el ejemplo de la docs usa `2026-10-21`). Los prompts se versionan como código: un cambio de prompt es un cambio de comportamiento.",
        keyPoints: [
          "Pinning: ID de modelo explícito + header `anthropic-version`.",
          "Cambiar la versión puede romper cosas: con `anthropic-version: 2026-10-21`, `temperature` da 400.",
          "Prompts versionados como código, con historial y revisión.",
          "CLAUDE.md, settings.json y dependencias de plugins son configuración que también se gestiona.",
        ],
        sources: [G, M, C],
      },
      {
        id: "requirements",
        title: "Requirements",
        weight: 3.4,
        status: "completo",
        summary:
          "Entender requerimientos funcionales y de infraestructura a partir de los requerimientos de negocio y de la arquitectura de la solución. Los funcionales dicen qué tiene que hacer el sistema; los de infraestructura (o no funcionales) dicen con qué condiciones: volumen, latencia, disponibilidad, seguridad, costo. Es ingeniería general, no docs de Claude: el examen evalúa si sabés traducir una necesidad de negocio en decisiones técnicas concretas.",
        keyPoints: [
          "Funcionales: qué hace el sistema. De infraestructura: volumen, latencia, disponibilidad, seguridad, costo.",
          "Se derivan del negocio y de la arquitectura de la solución, no al revés.",
          "En preguntas de escenario, el requerimiento clave (por ejemplo, costo vs. urgencia) define la opción correcta.",
        ],
        sources: [G],
      },
      {
        id: "systems-life-cycle",
        title: "Systems Life Cycle",
        weight: 2.8,
        status: "completo",
        summary:
          "Conceptos y frameworks de gestión del ciclo de vida para desarrollar, implementar, operar y mantener sistemas de IT. Es la mirada completa de un sistema: no termina cuando se despliega, sino que sigue con operación, monitoreo, mantenimiento, actualizaciones y, eventualmente, retiro. Es base general de ingeniería, no docs de Claude, y se conecta con el SDLC de Software Eng. Foundations.",
        keyPoints: [
          "Etapas: desarrollar, implementar, operar y mantener (y retirar).",
          "Un sistema en producción necesita operación y mantenimiento continuos.",
          "Es ingeniería general; se relaciona con el SDLC.",
        ],
        sources: [G],
      },
    ],
  },
  {
    id: "claude-code",
    number: 3,
    title: "Claude Code",
    weight: 3.1,
    status: "completo",
    summary:
      "Claude Code es la herramienta de Anthropic para trabajar con Claude como agente de código. En el examen pesa poco (3.1%), pero las preguntas piden saber qué pieza usar para cada necesidad, así que conviene tener claro el mapa conceptual.\n\n" +
      "La guía lista estos temas: Rules, Skills, Commands, Agents, memoria, sesiones, slash commands, headless mode, streaming, auto mode y la jerarquía de CLAUDE.md y settings.json. Entre los huecos del roadmap destaca plugins, headless mode, auto mode y session hygiene, que son justamente los temas que más fácil se escapan al estudiar.\n\n" +
      "Para el examen alcanza con el nivel conceptual: qué resuelve cada pieza y cuándo conviene usarla. CLAUDE.md y settings.json tienen jerarquía, así que importa qué nivel prevalece. Skills, Commands y Agents son formas de reutilizar maneras de trabajar. \"Headless\" significa sin interfaz interactiva, lo que apunta a automatizaciones. La session hygiene es mantener cada sesión con el contexto que necesita y nada más, una idea que conecta con el context engineering del dominio 6.",
    keyPoints: [
      "Pesa 3.1%, con un solo subtema: Operation.",
      "Temas de la guía: Rules, Skills, Commands, Agents, memoria, sesiones, slash commands.",
      "CLAUDE.md y settings.json tienen jerarquía: importa qué nivel prevalece.",
      "Headless mode y auto mode entran en el examen (huecos del roadmap).",
      "Session hygiene: cada sesión con el contexto justo, sin arrastrar lo que no sirve.",
    ],
    subtopics: [
      {
        id: "operation",
        title: "Operation",
        weight: 3.1,
        status: "completo",
        summary:
          "Operar Claude Code: Rules, Skills, Commands, Agents, memoria, sesiones, slash commands, headless mode, streaming, auto mode y la jerarquía de CLAUDE.md y settings.json. La guía marca como huecos frecuentes plugins, headless mode, auto mode y session hygiene. Para el examen alcanza con el nivel conceptual: qué resuelve cada pieza y cuándo conviene usarla.",
        keyPoints: [
          "Saber para qué sirve cada pieza: Rules, Skills, Commands, Agents, plugins.",
          "Jerarquía de CLAUDE.md y settings.json: saber qué nivel prevalece.",
          "Huecos frecuentes según la guía: plugins, headless mode, auto mode, session hygiene.",
        ],
        sources: [G],
      },
    ],
  },
  {
    id: "eval-testing-debugging",
    number: 4,
    title: "Eval, Testing & Debugging",
    weight: 2.6,
    status: "completo",
    summary:
      "Este dominio pesa poco, pero los errores típicos de la API aparecen en preguntas de todos los demás. La guía pide identificar el tipo de error, elegir cómo recuperarse, analizar trazas y aislar si la falla viene de la integración o del output del modelo.\n\n" +
      "El primer lugar donde mirar es `stop_reason`. `end_turn` es un final normal; `max_tokens` significa que la respuesta está truncada y no hay que tratarla como completa; `tool_use` pide ejecutar una tool; `pause_turn` aparece en turnos largos con server tools y se reenvía la respuesta tal cual; `refusal` indica que el modelo se negó; `model_context_window_exceeded` dice que se llenó la ventana.\n\n" +
      "Después están los 400 que vienen de usar la API vieja: prefill (último turno `assistant`) en los modelos actuales, `budget_tokens` en Opus 5.5, Sonnet 5.5 y Fable, `temperature`/`top_p`/`top_k` con `anthropic-version: 2026-10-21`, y bloques `thinking` modificados al reenviarlos. Las recetas viejas del Cookbook usan varios de estos patrones, así que copiarlas sin actualizar es una fuente común de errores.\n\n" +
      "Por último, la ventana: si el input solo no entra, el error es 400 `invalid_request_error` \"prompt is too long\"; si input + `max_tokens` supera la ventana, en Claude 4.5+ el request se acepta y, si la generación llega al límite, corta con `model_context_window_exceeded`; en modelos anteriores da error de validación. Distinguir estos casos es aislar integración vs. modelo.",
    keyPoints: [
      "Primero mirá `stop_reason`: `max_tokens` = truncado, no completo.",
      "Prefill en modelos actuales → 400; usar `output_config.format` o instrucciones en `system`.",
      "`budget_tokens` en Opus 5.5 / Sonnet 5.5 / Fable → 400; usar `thinking: {type: \"adaptive\"}` + `effort`.",
      "`temperature` / `top_p` / `top_k` con `anthropic-version: 2026-10-21` → 400 en todos los modelos.",
      "Input solo > ventana → 400 \"prompt is too long\"; ventana llena al generar (Claude 4.5+) → `model_context_window_exceeded`.",
      "Recetas viejas del Cookbook = API vieja: leer la idea, implementar con la API actual.",
    ],
    examples: [
      {
        title: "Reaccionar según cómo terminó (TS)",
        code: `const res = await client.messages.create({ ...params, max_tokens: 16_000 });
switch (res.stop_reason) {
  case "max_tokens": /* se terminó MI presupuesto de salida: subir max_tokens o continuar */ break;
  case "model_context_window_exceeded": /* se llenó la VENTANA: recortar o compactar */ break;
  case "tool_use": /* ejecutar la tool y devolver tool_result */ break;
}`,
        source: W,
      },
    ],
    subtopics: [
      {
        id: "debugging-error-handling",
        title: "Debugging & Error Handling",
        weight: 2.6,
        status: "completo",
        summary:
          "Identificar el tipo de error, elegir cómo recuperarse, analizar trazas y aislar si la falla es de la integración o del output del modelo. En la API, `stop_reason` dice cómo terminó cada respuesta y qué hacer. Los 400 más frecuentes vienen de patrones viejos: prefill, `budget_tokens` en Opus 5.5, Sonnet 5.5 y Fable, `temperature` con la versión nueva de la API, o bloques `thinking` editados. Un input que no entra en la ventana da 400 \"prompt is too long\".",
        keyPoints: [
          "`stop_reason` es el primer diagnóstico: `end_turn`, `max_tokens`, `tool_use`, `pause_turn`, `refusal`, `model_context_window_exceeded`.",
          "Un 400 suele ser de integración (request inválido), no del modelo.",
          "Los bloques `thinking` se reenvían sin modificar (con `signature`), o da 400.",
        ],
        sources: [G, M, W, C],
      },
    ],
  },
  {
    id: "model-selection-optimization",
    number: 5,
    title: "Model Selection & Optimization",
    weight: 16.8,
    status: "completo",
    summary:
      "El segundo dominio más pesado. Junta los fundamentos de cómo funciona un LLM, cómo se usa desde los SDKs, cómo se controla el costo y cómo se elige el modelo.\n\n" +
      "Fundamentos: el modelo genera el siguiente token, hay sampling y no-determinismo, y todo lo que ve en un request vive en la ventana de contexto, que es input + output, thinking incluido. Más contexto no siempre es mejor: cuanto más se llena, peor recuerda (context rot). En los modelos actuales el razonamiento se controla con `thinking: {type: \"adaptive\"}` y `output_config.effort`; `budget_tokens` quedó para modelos viejos y `temperature`/`top_p`/`top_k` fueron removidos en los nuevos. La guía también nombra fast mode como tema.\n\n" +
      "En lo técnico, el SDK de TypeScript (`@anthropic-ai/sdk`) toma la key de `ANTHROPIC_API_KEY` y ofrece `messages.create`, `messages.stream` y `messages.parse`, además de `countTokens` para medir antes de mandar.\n\n" +
      "Costo: prompt caching con `cache_control` (el prefijo va tools → system → messages, hasta 4 breakpoints) y se verifica con `cache_read_input_tokens`. La caché baja el costo pero no el espacio en la ventana. Para volumen sin urgencia, Batch es más barato.\n\n" +
      "Selección: Opus, Sonnet o Haiku según calidad, latencia y costo, y atención a los cambios que rompen compatibilidad entre versiones. Casi todos los modelos actuales tienen ventana de 1M y `max_tokens` de hasta 128k.",
    keyPoints: [
      "Ventana = input + output (thinking incluido). Context rot: más contexto no es automáticamente mejor.",
      "Modelos actuales: `thinking: {type: \"adaptive\"}` + `output_config.effort` (`low`…`max`).",
      "SDK TS: `messages.create`, `messages.stream`, `messages.parse`, `countTokens`; key desde `ANTHROPIC_API_KEY`.",
      "Caching: `cache_control`, prefijo tools → system → messages, máx. 4 breakpoints, verificar con `cache_read_input_tokens`.",
      "La caché baja el costo, no el espacio que ocupa en la ventana.",
      "Breaking changes: prefill → 400 en modelos actuales; `budget_tokens` y `tool_choice` `any`/`tool` → 400 en Opus 5.5, Sonnet 5.5 y Fable (5.1+ para `tool_choice`); `temperature` → 400 con `anthropic-version: 2026-10-21`.",
    ],
    examples: [
      {
        title: "Medir antes de mandar (TS)",
        code: `const WINDOW = 1_000_000; // Sonnet 5.5
const MAX_OUT = 16_000;
const params = { model: "claude-sonnet-5-5", system, tools, messages: history };

const { input_tokens } = await client.messages.countTokens(params);
if (input_tokens + MAX_OUT > WINDOW) {
  // recortar historial, limpiar tool results viejos, o usar compaction
}`,
        source: W,
      },
      {
        title: "Cachear un system largo",
        text: "Se marca el bloque del `system` con `cache_control`. Si en el request siguiente `usage.cache_read_input_tokens` es mayor que 0, la caché funcionó.",
        code: `system: [{ type: "text", text: systemLargo, cache_control: { type: "ephemeral" } }]`,
        source: M,
      },
    ],
    subtopics: [
      {
        id: "technical-fundamentals",
        title: "Technical Fundamentals",
        weight: 6.1,
        status: "completo",
        summary:
          "Los SDKs envuelven la API REST (y websockets, según la guía). En TypeScript, `@anthropic-ai/sdk` toma la key de `ANTHROPIC_API_KEY` y expone `messages.create` (respuesta completa), `messages.stream` (eventos a medida que se genera, con `finalMessage()` para obtener el `Message` final con `usage` y `stop_reason`) y `messages.parse` (structured outputs con Zod). Streaming se recomienda para respuestas largas o `max_tokens` alto, porque evita timeouts HTTP.",
        keyPoints: [
          "`messages.create`: respuesta entera. `messages.stream`: eventos + `finalMessage()`.",
          "`messages.parse` + Zod: salida tipada y validada.",
          "Streaming para respuestas largas: evita timeouts HTTP.",
        ],
        sources: [G, M],
      },
      {
        id: "llm-fundamentals",
        title: "LLM Fundamentals",
        weight: 5.2,
        status: "completo",
        summary:
          "Tokens, ventana de contexto, sampling, no-determinismo, generación del siguiente token, fast mode, extended y adaptive thinking, effort, y zero-, one- y few-shot. La ventana es input + output, thinking incluido, y la API no guarda estado. En modelos actuales se usa `thinking: {type: \"adaptive\"}`; `enabled` con `budget_tokens` es de modelos viejos. `output_config.effort` va de `low` a `max`, con default `high` en la mayoría y `medium` en Opus 5.5 y Haiku 5.5. `temperature`, `top_p` y `top_k` fueron removidos en los modelos nuevos.",
        keyPoints: [
          "Thinking cuenta dentro de `max_tokens` y de `output_tokens`.",
          "`effort` va dentro de `output_config`, no top-level.",
          "Zero/one/few-shot: cuántos ejemplos le das en el prompt.",
          "Fast mode está en la lista de temas de la guía.",
        ],
        sources: [G, M, W],
      },
      {
        id: "cost-token-mgmt",
        title: "Cost & Token Mgmt",
        weight: 2.8,
        status: "completo",
        summary:
          "Presupuestos de tokens, seguimiento del uso, modelado de costos, prompt caching y cache checkpoints. `usage` trae `input_tokens`, `output_tokens` y los de caché. `cache_control` (`ephemeral`, TTL de 5 minutos o `ttl: \"1h\"`) marca hasta dónde cachear; cualquier byte distinto antes del breakpoint es cache miss. La caché cambia cuánto pagás, no cuánto lugar ocupa. `display: \"omitted\"` no ahorra: el thinking se cobra igual. Contexto largo a precio estándar, salvo Haiku 5.5 con prompts de más de 100k. Para volumen sin urgencia, Batch es más barato.",
        keyPoints: [
          "Input total = `input_tokens` + `cache_creation_input_tokens` + `cache_read_input_tokens`.",
          "Cambiar `tools` o `system` invalida la caché de todo lo que sigue.",
          "`countTokens` para medir antes de mandar.",
          "Thinking oculto (`display: \"omitted\"`) se cobra igual.",
        ],
        sources: [G, M, W],
      },
      {
        id: "model-selection",
        title: "Model Selection",
        weight: 2.7,
        status: "completo",
        summary:
          "Cuándo usar Opus, Sonnet o Haiku según el balance calidad/latencia/costo, y los cambios que rompen compatibilidad entre versiones. Breaking changes concretos: prefill da 400 en los modelos actuales; `budget_tokens` y `tool_choice` `any`/`tool` dan 400 en Opus 5.5, Sonnet 5.5 y Fable (5.1+ en el caso de `tool_choice`); `temperature` da 400 con `anthropic-version: 2026-10-21`. La mayoría de los modelos actuales tiene ventana de 1M (otros, 200k) y `max_tokens` de hasta 128k. Guía de `effort`: `low` para chat, clasificación y subagentes; `high`/`xhigh` para coding y agentes; `max` cuando importa más la corrección que el costo.",
        keyPoints: [
          "Migrar de modelo = revisar breaking changes (prefill, `budget_tokens`, `temperature`, `tool_choice`).",
          "Ventana: 1M en casi todos los actuales; 200k en otros como Haiku 4.5.",
          "`effort` bajo para tareas simples y subagentes; alto para coding y agentes.",
        ],
        sources: [G, M, C, W],
      },
    ],
  },
  {
    id: "prompt-context-engineering",
    number: 6,
    title: "Prompt & Context Engineering",
    weight: 11.0,
    status: "completo",
    summary:
      "Este dominio cubre tres momentos: qué le decís a Claude (prompt), qué información le dejás ver (contexto) y qué hacés con lo que devuelve (output).\n\n" +
      "Prompt engineering: instrucciones claras, ejemplos (few-shot), qué va en `system` y qué en `user`, restricciones de salida, dónde ubicar cada instrucción, iterar el prompt y sanitizar el input. En la API, `system` es top-level. El truco viejo de prefill (dejar un último turno `assistant` para forzar el formato) da 400 en los modelos actuales: se reemplaza por `output_config.format` o por instrucciones en `system`.\n\n" +
      "Context engineering: gestionar la ventana para que el contexto no se desvíe (drift) ni se infle (bloat). Las herramientas son recortar la salida de tools, compactar, aislar contexto con subagents y medir con token counting. La docs suma server-side compaction (beta), context editing (tool result clearing y thinking block clearing), achicar las definiciones de tools o usar el tool search tool. Algunos modelos reciben etiquetas de context awareness y otros usan task budgets (beta).\n\n" +
      "Output handling: structured outputs, validación, parseo defensivo y desconfiar de una respuesta aunque suene segura. `content` es un array, hay que chequear el `type` de cada bloque, y `stop_reason: \"max_tokens\"` significa que la salida está cortada.",
    keyPoints: [
      "`system` es top-level; few-shot y restricciones de salida claras.",
      "Prefill → 400 en modelos actuales: usar `output_config.format` o instrucciones en `system`.",
      "Drift y bloat: recortar salida de tools, compactar, aislar con subagents.",
      "Context editing: tool result clearing y thinking block clearing; server-side compaction (beta).",
      "Structured outputs con `output_config.format` (`json_schema`) o `messages.parse` + Zod.",
      "Parseo defensivo: `content` es array, chequear `type === \"text\"`, y `max_tokens` = truncado.",
    ],
    examples: [
      {
        title: "Structured outputs con Zod (TS)",
        code: `import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const Contacto = z.object({ name: z.string(), email: z.string() });
const r = await client.messages.parse({
  model: "claude-opus-5-5", max_tokens: 16000,
  messages: [{ role: "user", content: "Extraé: Jane Doe (jane@co.com)" }],
  output_config: { format: zodOutputFormat(Contacto) },
});
r.parsed_output?.name; // "Jane Doe"`,
        source: M,
      },
    ],
    subtopics: [
      {
        id: "prompt-eng",
        title: "Prompt Eng.",
        weight: 4.6,
        status: "completo",
        summary:
          "Instrucciones claras, few-shot, qué va en `system` y qué en `user`, restricciones de salida, dónde ubicar cada instrucción, iteración y sanitización del input. En la API, `system` es un parámetro top-level (string o array de bloques `text`), no un mensaje con rol. Para forzar formato ya no se usa prefill: en los modelos actuales un último turno `assistant` da 400; se usa `output_config.format` o instrucciones en `system`.",
        keyPoints: [
          "`system`: rol y reglas generales. `user`: la tarea y los datos concretos.",
          "Sin prefill en modelos actuales (400).",
          "Sanitizar el input antes de meterlo en el prompt.",
        ],
        sources: [G, M],
      },
      {
        id: "context-eng",
        title: "Context Eng.",
        weight: 3.8,
        status: "completo",
        summary:
          "Gestionar la ventana para evitar drift y bloat: recortar la salida de tools, compactar y aislar contexto con subagents. Más contexto no es automáticamente mejor (context rot). Herramientas: token counting, server-side compaction (beta, Claude 4.6+), context editing (tool result clearing, thinking block clearing), achicar las definiciones de tools o usar el tool search tool. Los modelos nuevos conservan el thinking de turnos anteriores y lo cobran como input. Algunos modelos reciben etiquetas de context awareness; Opus 4.7+, Sonnet 5.5 y Haiku 5.5 no, y usan task budgets (beta).",
        keyPoints: [
          "Context rot: elegir bien qué entra en la ventana.",
          "Compaction y context editing para agentes y conversaciones largas.",
          "Context awareness solo en algunos modelos; los más nuevos usan task budgets (beta).",
        ],
        sources: [G, W],
      },
      {
        id: "output-handling",
        title: "Output Handling",
        weight: 2.6,
        status: "completo",
        summary:
          "Structured outputs, validación, parseo defensivo y desconfiar de una respuesta aunque suene segura. `output_config.format` con `json_schema` (o `messages.parse` + Zod) garantiza JSON que valida contra el schema; el `output_format` top-level está deprecado y structured outputs es incompatible con citations. La respuesta trae `content` como array: hay que recorrerlo y chequear `type === \"text\"`. Si `stop_reason` es `max_tokens`, la salida está truncada.",
        keyPoints: [
          "`output_config.format`, no `output_format` (deprecado).",
          "Structured outputs no se combina con citations.",
          "Validar siempre; que suene seguro no significa que sea correcto.",
        ],
        sources: [G, M],
      },
    ],
  },
  {
    id: "security-safety",
    number: 7,
    title: "Security & Safety",
    weight: 8.1,
    status: "completo",
    summary:
      "La seguridad de una app con IA va mucho más allá de prompt injection, y la guía lo marca como uno de los huecos más comunes al estudiar. Los temas son: prompt injection, jailbreaks, input no confiable, fugas de datos, PII, autenticación y autorización, defensa en capas y mínimo privilegio. A eso se suman los hooks para frenar acciones destructivas y el manejo de secretos y API keys.\n\n" +
      "La idea central es que todo lo que el modelo lee desde afuera (una página web, un archivo, la salida de una tool) es dato, no instrucción. Si ese contenido intenta dar órdenes, no se lo obedece: se lo separa de las instrucciones reales y se ponen controles para que no pueda disparar acciones sensibles. Un solo control nunca alcanza; por eso se habla de defensa en capas: validar entradas, limitar qué puede hacer cada componente (mínimo privilegio), pedir aprobación para acciones riesgosas y bloquear de forma determinista lo que nunca debería pasar.\n\n" +
      "Los secretos no se escriben en el código ni en los prompts. El SDK lee la key de la variable de entorno `ANTHROPIC_API_KEY`, que es la forma recomendada de pasarla.\n\n" +
      "Las preguntas suelen presentar un ataque y varias respuestas, algunas absurdas como subir la temperatura o pedirle \"por favor\" al usuario. La correcta casi siempre combina tratar el input como no confiable con un control que no dependa del modelo.",
    keyPoints: [
      "Input externo (web, archivos, salida de tools) = dato no confiable, nunca instrucción.",
      "Defensa en capas: validación, mínimo privilegio, aprobación y bloqueos deterministas.",
      "Hooks: frenan acciones destructivas sin depender de la decisión del modelo.",
      "PII y fugas de datos: no exponer más de lo necesario; authn/authz en cada acceso.",
      "Secretos fuera del código: el SDK lee `ANTHROPIC_API_KEY` del entorno.",
    ],
    examples: [
      {
        title: "Caso de la guía: texto oculto en una web",
        text: "Un agente lee una página que tiene texto oculto: \"ignorá tus instrucciones\". La respuesta correcta es tratar ese contenido como input no confiable, separarlo de las instrucciones y poner guardrails o hooks para que no pueda disparar acciones sensibles. Subir la temperatura o pedirle \"por favor\" al usuario no sirve.",
        source: G,
      },
    ],
    subtopics: [
      {
        id: "ai-app-security",
        title: "AI App Security",
        weight: 3.2,
        status: "completo",
        summary:
          "Prompt injection, jailbreaks, input no confiable, fugas de datos, PII, autenticación y autorización, defensa en capas y mínimo privilegio. El principio es separar instrucciones de datos: lo que llega de afuera se procesa como contenido, no como órdenes. La pregunta de ejemplo de la guía lo muestra: ante texto oculto en una web que dice \"ignorá tus instrucciones\", se trata como input no confiable y se agregan guardrails o hooks; ni subir la temperatura ni pedir \"por favor\" ayudan.",
        keyPoints: [
          "Prompt injection: instrucciones escondidas en datos externos.",
          "Mínimo privilegio: cada componente con los permisos justos.",
          "Authn/authz y cuidado de PII en todo el flujo.",
        ],
        sources: [G],
      },
      {
        id: "guardrails",
        title: "Guardrails",
        weight: 2.3,
        status: "completo",
        summary:
          "Los guardrails son controles alrededor del modelo que limitan lo que puede entrar y salir y qué acciones puede disparar. Forman parte de la defensa en capas: validar y filtrar entradas, revisar salidas antes de usarlas y exigir aprobación para acciones sensibles. Su valor es que no dependen de que el modelo se porte bien: funcionan aunque una inyección logre confundirlo.",
        keyPoints: [
          "Controles en la entrada, en la salida y en las acciones.",
          "No dependen del modelo: siguen funcionando si una inyección lo engaña.",
        ],
        sources: [G],
      },
      {
        id: "secrets-keys",
        title: "Secrets/Keys",
        weight: 1.6,
        status: "completo",
        summary:
          "Manejo de secretos y API keys. Nunca se hardcodean en el código, en los prompts ni en el repositorio. El SDK de Anthropic lee la key de la variable de entorno `ANTHROPIC_API_KEY`, que es la forma recomendada. Buenas prácticas generales: guardar secretos en un gestor o en variables de entorno, darles el mínimo alcance posible, rotarlos y no imprimirlos en logs ni en mensajes de error.",
        keyPoints: [
          "Key en `ANTHROPIC_API_KEY`, nunca en el código ni en el prompt.",
          "Mínimo alcance, rotación y nada de secretos en logs.",
        ],
        sources: [G, M],
      },
      {
        id: "hooks",
        title: "Hooks",
        weight: 1.0,
        status: "completo",
        summary:
          "Los hooks son puntos donde tu código se ejecuta siempre, en forma determinista, alrededor de las acciones del agente. En seguridad sirven para frenar acciones destructivas antes de que ocurran; en Agent Construction, para acciones que tienen que pasar sí o sí. La clave es que no dependen de lo que el modelo decida, por eso son un control confiable dentro de la defensa en capas.",
        keyPoints: [
          "Deterministas: se ejecutan siempre, no según la decisión del modelo.",
          "Uso típico: bloquear acciones destructivas o sensibles.",
        ],
        sources: [G],
      },
    ],
  },
  {
    id: "tools-mcps",
    number: 8,
    title: "Tools & MCPs",
    weight: 10.6,
    status: "completo",
    summary:
      "Las tools son la forma en que Claude actúa sobre el mundo: vos las definís, Claude decide cuándo usarlas y tu código las ejecuta. Este dominio cubre cómo escribirlas bien, cuándo elegir cada tipo de extensión y cómo se arma un servidor MCP.\n\n" +
      "Una tool se define con `name`, `description` e `input_schema`. La descripción es clave: es lo que le dice a Claude cuándo usarla. Con `strict: true` (y `additionalProperties: false` en el schema) el input queda garantizado según el schema. `tool_choice` puede ser `auto`, `any`, `tool` o `none`, pero en Opus 5.5, Sonnet 5.5 y Fable 5.1+ `any` y `tool` dan 400, así que se usa `auto` + prompt + `strict` o structured outputs. `disable_parallel_tool_use: true` limita a una tool por turno. El flujo es `tool_use` → ejecutar → `tool_result`. Las server tools las ejecuta Anthropic y su resultado viene en la misma respuesta. Con thinking, junto al `tool_result` hay que reenviar el bloque de thinking completo con su `signature`.\n\n" +
      "La guía también pide saber manejar errores de tools, patrones de aprobación, armar un buen set de tools y decidir entre una tool built-in, una custom, una Skill o un MCP.\n\n" +
      "MCP (Model Context Protocol) expone resources, tools y prompts desde un servidor a un cliente, con transportes como stdio o sockets. El caso típico del examen: un servicio REST interno que varias apps quieren reutilizar se envuelve en un servidor MCP que lo expone como tools.",
    keyPoints: [
      "Tool = `name` + `description` + `input_schema`; la descripción decide cuándo se usa.",
      "`strict: true` va en la tool (requiere `additionalProperties: false`), no en `tool_choice`.",
      "`tool_choice` `any`/`tool` → 400 en Opus 5.5 / Sonnet 5.5 / Fable 5.1+: usar `auto` + `strict`.",
      "Con thinking: reenviar el bloque completo con `signature` junto al `tool_result`.",
      "MCP: resources, tools y prompts; transportes stdio o sockets; roles cliente y servidor.",
      "Servicio interno reutilizable por varias apps → servidor MCP que lo expone como tools.",
    ],
    examples: [
      {
        title: "Definición de tool con strict (TS)",
        code: `tools: [{
  name: "get_weather",
  description: "Clima actual de una ciudad",
  input_schema: {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
    additionalProperties: false,
  },
  strict: true,
}]`,
        source: M,
      },
    ],
    subtopics: [
      {
        id: "tool-implementation",
        title: "Tool Implementation",
        weight: 4.4,
        status: "completo",
        summary:
          "Escribir descripciones, manejar errores, distinguir tools del cliente y del servidor, patrones de aprobación y cómo armar un buen set de tools. En la API: `name`, `description`, `input_schema` y `strict: true`. `tool_choice` admite `auto`, `any`, `tool` y `none` (con `any`/`tool` dando 400 en Opus 5.5, Sonnet 5.5 y Fable 5.1+). `disable_parallel_tool_use` limita a una tool por turno. Las server tools (por ejemplo búsqueda web o ejecución de código) las corre Anthropic. Con thinking, el bloque se reenvía completo con su `signature`.",
        keyPoints: [
          "Client tools las ejecuta tu código; server tools, Anthropic.",
          "Flujo: `stop_reason: \"tool_use\"` → ejecutar → `tool_result` con el `tool_use_id`.",
          "Buenas descripciones y un set chico y claro de tools.",
        ],
        sources: [G, M, W],
      },
      {
        id: "agentic-customization",
        title: "Agentic Customization",
        weight: 4.1,
        status: "completo",
        summary:
          "Cuándo usar una tool built-in, una custom, una Skill o un MCP. Criterio general: si ya existe una tool que lo resuelve, usarla; si es lógica propia de tu app, una tool custom; si es una forma de trabajo o conocimiento empaquetado y reutilizable, una Skill (el Cookbook tiene una categoría dedicada); si es un servicio que varias apps o clientes tienen que reutilizar, un servidor MCP.",
        keyPoints: [
          "Built-in si ya existe; custom para lógica propia.",
          "Skill para empaquetar una forma de trabajo reutilizable.",
          "MCP para exponer un servicio a varios clientes.",
        ],
        sources: [G, C],
      },
      {
        id: "mcp-server-dev",
        title: "MCP Server Dev",
        weight: 2.1,
        status: "completo",
        summary:
          "Desarrollar servidores MCP: los tres tipos de capacidad que exponen (resources, tools y prompts), los transportes (stdio, sockets) y los roles de cliente y servidor. El servidor ofrece capacidades; el cliente las consume y se las presenta al modelo. La pregunta de ejemplo de la guía: un servicio REST interno que varias apps tienen que reutilizar se resuelve con un servidor MCP que lo expone como tools.",
        keyPoints: [
          "Capacidades: resources, tools, prompts.",
          "Transportes: stdio y sockets.",
          "Un servidor MCP evita reimplementar la integración en cada app.",
        ],
        sources: [G],
      },
    ],
  },
];
