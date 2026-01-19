# Sistema de Análisis Financiero "Estados de Resultados"
## Contexto del Sistema y Arquitectura

Este documento define el contexto del sistema, los hallazgos de la investigación de mercado en Chile y la arquitectura técnica basada en el patrón **Directivas-Orquestación-Ejecución**.

---

### 1. Investigación de Mercado (Chile)
**Objetivo**: Validar la necesidad de una herramienta de análisis financiero automatizado para personas y PYMEs en Chile.

#### Hallazgos Clave:
*   **Ecosistema Actual**: Existen soluciones contables robustas como **Chipax**, **Nubox**, y **Clay** que automatizan la contabilidad tributaria (conexión SII) y bancaria.
*   **La Brecha (The Gap)**: Estas herramientas son excelentes para "mantener los libros", pero a menudo carecen de un análisis financiero estratégico profundo y personalizado que vaya más allá del cumplimiento. Muchos usuarios exportan datos de estos sistemas a **Excel** para modelar, proyectar y analizar "qué pasaría si".
*   **Normativa**: El formato estándar se rige por **IFRS** y la **FECU** (Ficha Estadística Codificada Uniforme), utilizando el "Método de la Función de los Gastos" (Costos de Ventas, Gastos de Administración, etc.).
*   **Oportunidad**: Crear una capa de "Inteligencia de Negocios" que se sitúe *encima* de la contabilidad. No competir en "llevar la contabilidad", sino en "entender la contabilidad". Una herramienta que ingeste esos Excels y entregue **Insights** y **Mejoramientos**.

---

### 2. Arquitectura del Sistema: Directivas, Orquestación, Ejecución
Para garantizar escalabilidad y claridad, separaremos el sistema en tres capas distintivas.

#### A. Directives (El Cerebro / Las Reglas)
*Define QUÉ se debe hacer y las reglas del juego. No toca código de infraestructura.*

*   **Financial Directives**: Reglas de negocio y fórmulas financieras.
    *   *Ejemplo*: "Si el Ratio de Liquidez < 1.0, emitir alerta de riesgo de caja".
    *   *Ejemplo*: "Para industria Retail en Chile, el margen bruto saludable es > 30%".
*   **Optimization Directives**: Lógica para sugerir mejoras.
    *   *Ejemplo*: "Si Gastos Admin > 15% de Ventas -> Sugerir revisión de proveedores de servicios o automatización".
*   **UI Directives**: Reglas de presentación (temas, formatos de moneda CLP).

#### B. Orchestration (El Gerente / El Flujo)
*Coordina los procesos. Conecta las entradas del usuario con las reglas y los ejecutores.*

*   **Workflow Manager**:
    1.  Recibe el archivo Excel del usuario.
    2.  Invoca al *Executor* de Parsing para normalizar los datos.
    3.  Consulta las *Directives* para saber qué análisis aplicar.
    4.  Invoca al *Executor* de Análisis para calcular ratios y detectar anomalías.
    5.  Compila los resultados y los envía al Frontend.
*   **State Management**: Mantiene el estado de la sesión del usuario y el progreso del análisis.

#### C. Execution (El Músculo / La Implementación)
*Realiza las tareas concretas. Es donde vive el código "duro".*

*   **Frontend (Web Application)**:
    *   Tecnología: **Next.js**, **TailwindCSS**, **Framer Motion**.
    *   Responsabilidad: Renderizar la "Bonita Web", gráficos interactivos, dashboards y animaciones.
    *   Estilo: Glassmorphism, Premium, Limpio.
*   **Data Parsing Engine**:
    *   Tecnología: **Python (Pandas)** o **Node.js**.
    *   Responsabilidad: Leer Excel (`.xlsx`, `.csv`), limpiar datos, manejar errores de formato.
*   **Analysis Engine**:
    *   Responsabilidad: Ejecutar las fórmulas matemáticas definidas en las Directivas.

---

### 3. Flujo de Usuario (User Journey)
1.  **Landing**: Usuario llega a una web impactante ("Wow effect").
2.  **Upload**: Usuario sube su "Estado de Resultados" (Excel).
3.  **Processing**: El sistema analiza los datos vs. Directivas de mercado chileno.
4.  **Dashboard**: Se presenta el diagnóstico visual.
5.  **Action**: El sistema lista "Mejoramientos" concretos (e.g., "Reducir días calle de inventario para liberar $X CLP").

---

### 4. Próximos Pasos (Skills)
Crearemos "Skills" (capacidades modulares) para el Agente AI para facilitar el desarrollo:
*   `skill_financial_analysis`: Fórmulas y ratios financieros estándar.
*   `skill_chile_tax`: Normas básicas del SII y formatos IFRS.
*   `skill_ui_design`: Componentes y estilos de Tailwind pre-aprobados.
