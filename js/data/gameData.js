/* ============================================================
   CAPA DE DATOS: SUBWAY DEV GAME DATA
   Personajes, Outfits, Patinetas, Mejoras, Colecciones y Paletas
   ============================================================ */

var CHARACTERS = [
  {
    id: 'stefani',
    name: 'Stefani',
    sub: 'Técnica en Desarrollo de Software',
    badge: 'PRO',
    icon: '⚡',
    fav: true,
    unlocked: true,
    outfits: [
      {
        id: 'star',
        name: 'Star Outfit',
        sub: 'Atuendo Oficial Estrella',
        desc: 'Sudadera roja, chaleco denim azul con estrella dorada, pantalones marrones y auriculares de DJ.',
        b: '#dc2626',      // Sudadera roja
        h: '#facc15',      // Gorra con visera verde y corona amarilla
        s: '#dc2626',      // Zapatillas rojas con ribetes dorados
        hair: '#2c1810',
        pants: '#854d0e',  // Pantalones marrones clásicos de corredor
        star: true,
        headphones: true,
        coinsNeed: 0,
        keysNeed: 0,
        unlocked: true
      },
      {
        id: 'classic',
        name: 'Classic Runner',
        sub: 'Edición Urbana Original',
        desc: 'Chaqueta azul marino, gorra clásica turquesa y zapatillas rojas de skater.',
        b: '#0077cc',
        h: '#00d2b4',
        s: '#ff3b30',
        hair: '#2c1810',
        pants: '#1e293b',
        star: false,
        headphones: false,
        coinsNeed: 0,
        keysNeed: 0,
        unlocked: true
      },
      {
        id: 'cyber',
        name: 'Cyberpunk Neon',
        sub: 'Neón de la Línea Nocturna',
        desc: 'Visor cibernético holográfico, chaleco púrpura de fibra óptica y zapatillas neón.',
        b: '#7928ca',
        h: '#00f0d0',
        s: '#00f0d0',
        hair: '#0f172a',
        pants: '#090d16',
        visor: '#00f0d0',
        star: false,
        headphones: false,
        coinsNeed: 250,
        keysNeed: 0,
        unlocked: false
      },
      {
        id: 'terminal',
        name: 'Terminal Hacker',
        sub: 'Matrix Hacker Edition',
        desc: 'Gorra negra mate, sudadera esmeralda con visor monocromático verde.',
        b: '#064e3b',
        h: '#022c22',
        s: '#10b981',
        hair: '#111827',
        pants: '#022c22',
        visor: '#10b981',
        star: false,
        headphones: false,
        coinsNeed: 500,
        keysNeed: 0,
        unlocked: false
      }
    ]
  },
  {
    id: 'jake',
    name: 'Jake',
    sub: 'Corredor Urbano Original',
    badge: 'LEGEND',
    icon: '🧢',
    fav: false,
    unlocked: true,
    outfits: [
      {
        id: 'jake-star',
        name: 'Star Outfit',
        sub: 'Edición Estrella Clásica',
        desc: 'El atuendo legendario de Jake con chaleco de mezclilla y auriculares dorados.',
        b: '#dc2626',
        h: '#facc15',
        s: '#dc2626',
        hair: '#854d0e',
        pants: '#78350f',
        star: true,
        headphones: true,
        coinsNeed: 0,
        keysNeed: 0,
        unlocked: true
      },
      {
        id: 'jake-classic',
        name: 'Classic Jake',
        sub: 'Gorra Blanca Clásica',
        desc: 'Chaqueta blanca y azul con gorra blanca hacia atrás.',
        b: '#f8fafc',
        h: '#f8fafc',
        s: '#2563eb',
        hair: '#854d0e',
        pants: '#1e3a8a',
        star: false,
        headphones: false,
        coinsNeed: 150,
        keysNeed: 0,
        unlocked: false
      }
    ]
  },
  {
    id: 'tricky',
    name: 'Tricky',
    sub: 'Skater Acrobática',
    badge: 'ICON',
    icon: '🎀',
    fav: false,
    unlocked: false,
    outfits: [
      {
        id: 'tricky-cam',
        name: 'Camper Outfit',
        sub: 'Gorro de Lana y Gafas',
        desc: 'Gorro tejido rosa, gafas de pasta y peto vaquero.',
        b: '#ec4899',
        h: '#db2777',
        s: '#f43f5e',
        hair: '#facc15',
        pants: '#1d4ed8',
        star: false,
        headphones: false,
        coinsNeed: 400,
        keysNeed: 0,
        unlocked: false
      }
    ]
  },
  {
    id: 'fresh',
    name: 'Fresh',
    sub: 'DJ del Metro',
    badge: 'BEATS',
    icon: '📻',
    fav: false,
    unlocked: false,
    outfits: [
      {
        id: 'fresh-funk',
        name: 'Funk Outfit',
        sub: 'Boombox Beats',
        desc: 'Gafas de pasta roja, camisa hawaiana y radio boombox retro.',
        b: '#16a34a',
        h: '#dc2626',
        s: '#ca8a04',
        hair: '#171717',
        pants: '#15803d',
        star: false,
        headphones: true,
        coinsNeed: 0,
        keysNeed: 15,
        unlocked: false
      }
    ]
  },
  {
    id: 'yutani',
    name: 'Yutani',
    sub: 'Genio Científica',
    badge: 'SPECIAL',
    icon: '👽',
    fav: false,
    unlocked: false,
    outfits: [
      {
        id: 'yutani-alien',
        name: 'Alien Disguise',
        sub: 'Traje Extraterrestre',
        desc: 'Disfraz verde de alienígena con cuatro ojos y mochila propulsora.',
        b: '#84cc16',
        h: '#4d7c0f',
        s: '#65a30d',
        hair: '#4d7c0f',
        pants: '#365314',
        star: false,
        headphones: false,
        coinsNeed: 0,
        keysNeed: 30,
        unlocked: false
      }
    ]
  }
];

var BOARDS_DATA = [
  { id: 'freestyler', name: 'Freestyler', desc: 'Patineta clásica con punta redondeada y protección antichoque.', col: '#00d2b4', col2: '#ff3b30', icon: '🛹', coinsNeed: 0 },
  { id: 'starboard', name: 'Star Board', desc: 'Edición dorada con propulsores iónicos y estrella grabada.', col: '#ffd23f', col2: '#f59e0b', icon: '⭐', coinsNeed: 300 },
  { id: 'bouncer', name: 'Bouncer', desc: 'Equipada con Super Sneakers permanentes que te elevan sobre trenes.', col: '#3b82f6', col2: '#1d4ed8', icon: '🦘', coinsNeed: 600 },
  { id: 'cyber', name: 'Cyber Glide', desc: 'Patineta holográfica con estela de partículas de neón.', col: '#a855f7', col2: '#ec4899', icon: '⚡', coinsNeed: 1000 }
];

var UPGRADES_DATA = [
  { id: 'jetpack', name: 'Jetpack', desc: 'Extiende el tiempo de vuelo por encima del metro recogiendo monedas.', icon: '🚀', max: 5 },
  { id: 'sneakers', name: 'Super Sneakers', desc: 'Aumenta la duración del supersalto para brincar sobre los trenes.', icon: '👟', max: 5 },
  { id: 'magnet', name: 'Imán de Monedas', desc: 'Incrementa el tiempo que el imán atrae todas las monedas de los 3 carriles.', icon: '🧲', max: 5 },
  { id: 'x2', name: 'Multiplicador x2', desc: 'Duplica los puntos obtenidos por metro y moneda durante más tiempo.', icon: '⭐', max: 5 }
];

var COLLECTIONS_DATA = [
  { id: 'col1', name: 'Estación 1: Quién Soy', desc: 'Desbloquea el perfil profesional de Stefani Sánchez.', rCoins: 100, rKeys: 2 },
  { id: 'col2', name: 'Estación 2: Habilidades', desc: 'Domina el stack técnico de bases de datos y backend.', rCoins: 150, rKeys: 3 },
  { id: 'col3', name: 'Estación 3: Proyectos', desc: 'Inspecciona los 6 proyectos destacados del portafolio.', rCoins: 250, rKeys: 5 },
  { id: 'col4', name: 'Estación 4: Contacto', desc: 'Llega a la última parada y desbloquea el canal directo.', rCoins: 500, rKeys: 10 }
];

var TRAINCOL = [
  { f: '#e8503a', s: '#a6331f', t: '#ff7b62' },
  { f: '#e0a82e', s: '#9a7314', t: '#f7c95a' },
  { f: '#2fb8a6', s: '#1b7c6f', t: '#5fe0cd' }
];

var PALETTES = {
  day: {
    id: 'day', name: '☀️ Día',
    sky0: '#0d1923', sky1: '#2a3a4d', hor: '#f08a4b',
    bld: '#142029', bld2: '#22323f',
    g0: '#5b4b46', g1: '#2e3238',
    sun: 0.7, lamp: 0.35, star: 0.4,
    trainCol: '#e8503a',
    hor_: [240, 138, 75],
    stationName: 'Central Tech · Atardecer Urbano'
  },
  sunset: {
    id: 'sunset', name: '🌇 Ocaso',
    sky0: '#16213f', sky1: '#6a5a86', hor: '#ffc27a',
    bld: '#171f33', bld2: '#2a3350',
    g0: '#6a5a58', g1: '#323640',
    sun: 0.65, lamp: 0.55, star: 0.55,
    trainCol: '#e0a82e',
    hor_: [255, 194, 122],
    stationName: 'Sunset Valley · Horizonte Dorado'
  },
  night: {
    id: 'night', name: '🌙 Noche',
    sky0: '#050a12', sky1: '#13293a', hor: '#2f8f9a',
    bld: '#0a121a', bld2: '#13212c',
    g0: '#1f3d47', g1: '#1a2a33',
    sun: 0.0, lamp: 1.0, star: 1.0,
    trainCol: '#2fb8a6',
    hor_: [47, 143, 154],
    stationName: 'Cyber Track · Noche Neón'
  },
  dawn: {
    id: 'dawn', name: '🌅 Alba',
    sky0: '#102538', sky1: '#3a6a8a', hor: '#ffb884',
    bld: '#132638', bld2: '#213d54',
    g0: '#5c524f', g1: '#2b3238',
    sun: 0.85, lamp: 0.25, star: 0.2,
    trainCol: '#e8503a',
    hor_: [255, 184, 132],
    stationName: 'Dawn Horizon · Alba Fresca'
  }
};

var CITY_DATA = [
  ['STEFANI SÁNCHEZ', 'TÉCNICA EN DESARROLLO DE SOFTWARE'],
  ['SUBWAY DEV', 'SURFEA LAS VÍAS DEL CÓDIGO'],
  ['PROYECTOS LIVE', 'ESCAPE ROOM · POSTGRESQL · DOCKER'],
  ['GITHUB @STEFF-360', 'ARQUITECTURA MODULAR EN CAPAS']
];

var PWCOL = {
  magnet: '#ff6b4a',
  x2: '#ffd23f',
  jetpack: '#a855f7',
  sneakers: '#ff9100'
};

var PWDUR = {
  magnet: 9.0,
  x2: 10.0,
  jetpack: 7.5,
  sneakers: 9.0
};
