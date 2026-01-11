# ⚽ Futbolero

Ranking anual de **Fútbol 5** para jugar con amigos: **tabla de posiciones**, **historial de partidos** y **head-to-head** (en contra / jugando juntos).  
Incluye un **panel de Admin** para cargar jugadores y partidos.

---

## 🚀 Live

| Entorno    | URL                                      |
| ---------- | ---------------------------------------- |
| Producción | https://futbolero-alfin.vercel.app/      |

---

## ✨ Features

### 📊 Público (sin login)

- **Tabla de posiciones**
  - Puntos, PJ, G/E/P
  - Racha actual
  - Últimos resultados
- **Partidos**
  - Historial por día/fecha
  - Filtros por jugador y resultado
- **Head-to-Head**
  - Comparación **A vs B** (stats para ambos)
  - "Jugando juntos" (stats del dúo y últimos partidos)

### 🔐 Admin (requiere login)

- Login por **Google** (Firebase Auth) y opcional por **Email/Password**
- **Alta/Baja** de jugadores + activar/desactivar
- **Carga de partido** (5v5):
  - Fecha y hora
  - Ganador (A / Empate / B) + diferencia de gol
  - Actualización automática de standings

---

## 🧠 Reglas de Puntuación

| Resultado | Puntos |
| --------- | ------ |
| Victoria  | 2 pts  |
| Empate    | 1 pt   |
| Derrota   | 0 pts  |

---

## 🧱 Tech Stack

| Categoría       | Tecnología                          |
| --------------- | ----------------------------------- |
| Framework       | Next.js (App Router)                |
| Lenguaje        | TypeScript                          |
| Estilos         | TailwindCSS                         |
| Base de datos   | Firebase Firestore                  |
| Autenticación   | Firebase Auth (Google / Email-Pass) |
| Deploy          | Vercel                              |

---

## � Estructura del Proyecto

```
futbolero-alfin/
├── 📂 public/                    # Archivos estáticos
├── 📂 src/
│   ├── 📂 app/                   # App Router de Next.js
│   │   ├── 📂 admin/
│   │   │   └── 📂 [seasonId]/
│   │   │       ├── AdminClient.tsx    # Panel de administración
│   │   │       └── page.tsx
│   │   ├── 📂 season/
│   │   │   └── 📂 [seasonId]/
│   │   │       ├── 📂 tabs/
│   │   │       │   ├── HeadToHeadTab.tsx   # Comparación entre jugadores
│   │   │       │   ├── MatchesTab.tsx      # Historial de partidos
│   │   │       │   └── StandingsTab.tsx    # Tabla de posiciones
│   │   │       ├── SeasonClient.tsx
│   │   │       └── page.tsx
│   │   ├── globals.css           # Estilos globales
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Página de inicio
│   └── 📂 lib/                   # Lógica de negocio
│       ├── 📂 hooks/
│       │   ├── useMatches.ts     # Hook para partidos
│       │   ├── usePlayers.ts     # Hook para jugadores
│       │   └── useStandings.ts   # Hook para standings
│       ├── 📂 utils/
│       │   ├── date.ts           # Utilidades de fecha
│       │   ├── h2h.ts            # Lógica head-to-head
│       │   └── match.ts          # Utilidades de partidos
│       ├── admin.ts              # Funciones de admin
│       ├── firebase.ts           # Configuración Firebase
│       ├── matches.ts            # Operaciones de partidos
│       ├── matchesRead.ts        # Lectura de partidos
│       ├── players.ts            # Operaciones de jugadores
│       └── seasonTable.ts        # Tabla de temporada
├── .env.local                    # Variables de entorno
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.js            # Configuración de Tailwind
├── tsconfig.json                 # Configuración de TypeScript
└── package.json                  # Dependencias
```

---

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/futbolero-alfin.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

# Ejecutar en desarrollo
npm run dev
```

---

## 📝 Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
