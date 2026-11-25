/* ============================================================
   CAPA DE DATOS: PORTAFOLIO DE STEFANI SÁNCHEZ
   Técnica en Desarrollo de Software
   ============================================================ */

var SECTIONS = [
  {
    k: 'Quién soy',
    title: 'Hola, soy Stefani Sánchez.',
    html: '<p>Soy <strong>Técnica en Desarrollo de Software</strong> enfocada en construir aplicaciones sólidas, escalables y con atención a la arquitectura de datos y la interactividad.</p>' +
          '<p>Combino habilidades en lógica de programación, bases de datos relacionales y diseño de sistemas con experiencias interactivas y gamificadas (EdTech).</p>' +
          '<dl class="facts">' +
          '<div><dt>Nombre</dt><dd>Stefani Sánchez</dd></div>' +
          '<div><dt>Título</dt><dd>Técnica en Desarrollo de Software</dd></div>' +
          '<div><dt>Enfoque</dt><dd>Backend, APIs REST, Bases de Datos & EdTech</dd></div>' +
          '<div><dt>Core Stack</dt><dd>Node.js, PostgreSQL, TypeScript, Docker, Express</dd></div>' +
          '<div><dt>Disponibilidad</dt><dd>Remoto / Proyectos de impacto</dd></div></dl>'
  },
  {
    k: 'Habilidades',
    title: 'Arsenal técnico y herramientas',
    html: '<ul class="list">' +
          '<li><strong>Desarrollo Backend & APIs REST</strong>Diseño e implementación de servicios con Node.js y Express, tipado con TypeScript, autenticación segura con JWT y arquitectura modular en capas.</li>' +
          '<li><strong>Bases de Datos & SQL Avanzado</strong>PostgreSQL: modelado relacional, consultas optimizadas, índices para alto rendimiento, triggers y funciones almacenadas.</li>' +
          '<li><strong>DevOps & Infraestructura</strong>Contenedores con Docker y Docker Compose para crear entornos reproducibles y aislados; integración con Supabase.</li>' +
          '<li><strong>Testing & Calidad de Código</strong>Pruebas unitarias y de integración con Jest asegurando estabilidad en cada release.</li>' +
          '<li><strong>Frontend & Gamificación</strong>HTML5 Canvas nativo, JavaScript moderno (ES6+) y CSS3 para crear interfaces dinámicas y experiencias gamificadas.</li>' +
          '<li><strong>Control de Versiones</strong>Git y GitHub con flujos estructurados de entrega rama por rama.</li></ul>'
  },
  {
    k: 'Proyectos',
    title: 'Proyectos destacados',
    html: '<ul class="list">' +
          '<li><strong>Escape Room Programación<a class="badge link" href="https://steff-360.github.io/escape-room-programacion/" target="_blank">Demo Live ↗</a></strong>Videojuego educativo en HTML5 Canvas nativo y JavaScript. Puzzles de lógica y estructuras de control con mecánicas interactivas.</li>' +
          '<li><strong>Job Listings API<a class="badge link" href="https://github.com/steff-360" target="_blank">GitHub ↗</a></strong>API REST con Node.js, Express y PostgreSQL para gestión de ofertas laborales, con autenticación segura por tokens JWT.</li>' +
          '<li><strong>TechZone PostgreSQL<a class="badge link" href="https://github.com/steff-360" target="_blank">GitHub ↗</a></strong>Diseño de base de datos relacional para e-commerce tecnológico con optimización de consultas y procedimientos almacenados.</li>' +
          '<li><strong>Algodones Maravilla CLI<a class="badge link" href="https://github.com/steff-360" target="_blank">GitHub ↗</a></strong>Sistema de inventario en terminal desarrollado en TypeScript con principios de Clean Code y POO.</li>' +
          '<li><strong>CampusLands CLI<a class="badge link" href="https://github.com/steff-360" target="_blank">GitHub ↗</a></strong>Herramienta en línea de comandos para control académico de notas y asistencias.</li>' +
          '<li><strong>Docker + Supabase Infra<a class="badge link" href="https://github.com/steff-360" target="_blank">GitHub ↗</a></strong>Orquestación de microservicios reproducibles en Docker Compose con persistencia de base de datos.</li></ul>'
  },
  {
    k: 'Contacto',
    title: '¿Construimos algo increíble?',
    html: '<p>Estoy disponible para sumarme a equipos de tecnología, proyectos de desarrollo de software y retos donde el código limpio y la arquitectura en capas marquen la diferencia.</p>' +
          '<dl class="facts">' +
          '<div><dt>Email</dt><dd><strong>steff.18random@gmail.com</strong></dd></div>' +
          '<div><dt>LinkedIn</dt><dd><a class="badge link" href="https://www.linkedin.com/in/stefani-s%C3%A1nchez-b35b65279" target="_blank">Stefani Sánchez ↗</a></dd></div>' +
          '<div><dt>GitHub</dt><dd><a class="badge link" href="https://github.com/steff-360" target="_blank">@steff-360 ↗</a></dd></div>' +
          '<div><dt>Rol</dt><dd>Técnica en Desarrollo de Software</dd></div></dl>' +
          '<p style="margin-top:16px"><a class="btn primary" href="mailto:steff.18random@gmail.com" style="display:inline-block;padding:10px 20px;text-decoration:none;border-radius:6px">Enviar correo directo</a></p>'
  }
];

function finaleHtml() {
  return '<p>¡Excelente recorrido! Desbloqueaste todas las estaciones de mi portafolio.</p>' +
    '<dl class="facts"><div><dt>Puntos</dt><dd>' + (typeof score === 'function' ? score() : 0) + '</dd></div><div><dt>Distancia</dt><dd>' + Math.floor(typeof dist !== 'undefined' ? dist : 0) + ' m</dd></div><div><dt>Monedas</dt><dd>' + (typeof coins !== 'undefined' ? coins : 0) + '</dd></div></dl>' +
    '<p>Soy Stefani Sánchez, Técnica en Desarrollo de Software. Contáctame a <strong>steff.18random@gmail.com</strong> para colaborar en nuevos proyectos.</p>';
}
