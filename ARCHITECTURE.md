# WattWise AI — System Architecture & Telemetry Integration

This document describes the technical architecture of **WattWise AI**, an enterprise-ready smart campus energy monitoring platform built with a hybrid decoupled data strategy.

---

## 1. Overview & Hybrid Architecture Paradigm

WattWise AI relies on a **Hybrid Data Architecture**:
- **Persistent Business Layer (Database)**: High-integrity entity records (classrooms, buildings, capacities, alert logs, AI recommendation definitions, user profiles) originate from **Supabase PostgreSQL**.
- **Real-Time Telemetry Layer (IoT Provider)**: High-frequency sensor values (current power draw, ambient temperature, relative humidity, live occupancy, carbon offset, AI health score) originate from a modular **Telemetry Engine Service**.

```
                           +--------------------------------+
                           |       WattWise AI Client       |
                           |   (React 18 + AppContext UI)   |
                           +---------------+----------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
        +----------v----------+                         +----------v----------+
        |   Supabase Database |                         |   Telemetry Engine  |
        |  (PostgreSQL + RLS) |                         | (TelemetryProvider) |
        +----------+----------+                         +----------+----------+
                   |                                               |
     - Room Metadata (Code/Building/Floor)            - Live Power Draw (kW)
     - Alert Definitions                              - Ambient Temp & Humidity
     - AI Recommendation Templates                    - Real-Time Occupancy
     - User Profiles & Auth                           - Gradual Drift Simulation
```

---

## 2. Authentication & Authorization

WattWise AI uses **Supabase Auth** for identity management and access controls:
- **Authentication Modes**: Supports Email/Password credentials and OAuth Providers (Google, GitHub).
- **Row Level Security (RLS)**: PostgreSQL tables (`classrooms`, `alerts`, `ai_recommendations`, `reports`) strictly enforce public read policies and authenticated user update permissions.
- **Client Session Management**: `useAuth` hook tracks real-time auth states (`onAuthStateChange`) and user profile synchronization with the `public.profiles` table.
- **Mock Bypass Fallback**: In offline development mode without active Supabase credentials, a local dev session fallback allows full evaluation without breaking UI components.

---

## 3. Persistent Supabase Database Schema

The database layer structures all core campus records:

### Key Tables
1. **`classrooms`**: Stores persistent metadata (`id`, `room_code`, `building`, `floor`, `capacity`, `status`).
2. **`alerts`**: Tracks logged security, thermal, and electrical anomaly definitions (`id`, `classroom_id`, `severity`, `title`, `description`, `resolved`).
3. **`ai_recommendations`**: Stores structured AI energy optimization actions (`id`, `classroom_id`, `priority`, `recommendation`, `estimated_savings`, `status`).
4. **`reports`**: Stores generated compliance audits and carbon footprint executive summaries.

---

## 4. Telemetry Layer & Simulator Engine

Live sensor telemetry is isolated behind a strict TypeScript interface (`TelemetryProvider`), keeping UI components completely decoupled from data source mechanics.

### Interface Abstraction (`TelemetryProvider`)
```ts
export interface TelemetryProvider {
  getRoomTelemetry(roomId: string, dbMeta?: { capacity?: number; status?: string }): RoomTelemetry;
  getAllTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): Map<string, RoomTelemetry>;
  stepTelemetry(dbRooms?: Array<{ id: string; capacity?: number; status?: string }>): void;
  getSummaryMetrics(): TelemetryMetrics;
  getChartTelemetry(): ChartData;
  updateDeviceState(roomId: string, device: "lightsOn" | "fansOn", newState?: boolean): RoomTelemetry;
}
```

### Realistic Gradual Evolution Algorithm
Unlike simple `Math.random()` randomizers that jump wildly between readings, the default `SimulatorProvider`:
1. **Stateful Telemetry Maps**: Maintains per-room state across rendering cycles.
2. **Smooth Thermal Drift**: Temperature evolves gradually (e.g. `24.5°C → 24.7°C → 24.8°C → 24.6°C`), clamped within comfortable campus ranges (`21.0°C - 32.0°C`).
3. **Dynamic Electrical Load**: Power draw is calculated from base load + active lighting + ceiling fans + current occupancy count + minor noise deltas.
4. **Data Isolation**: Manual or automated user refreshes execute `stepTelemetry()`, updating live sensor metrics in memory without sending mutating writes to Supabase PostgreSQL.

---

## 5. Future ESP32 & Hardware Integration Roadmap

Because telemetry functionality is encapsulated behind the `TelemetryProvider` interface, swapping the simulated provider for physical microcontrollers or cloud IoT brokers requires zero modifications to UI components or database schemas.

```
                    ┌────────────────────────┐
                    │   TelemetryProvider    │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Simulator   │        │     MQTT     │        │    ESP32     │
│   Provider   │        │   Provider   │        │ REST Gateway │
└──────────────┘        └──────────────┘        └──────────────┘
```

### Swapping to Physical ESP32 Hardware:
1. **ESP32 Microcontroller Setup**: ESP32 units with DHT22 (temp/humidity), ACS712 (current sensor), and PIR (occupancy) post payload over MQTT or HTTP to an API endpoint.
2. **Create `ESP32Provider`**: Implement `TelemetryProvider` connecting via WebSockets or MQTT-over-WebSockets (e.g., `mqtt.js` or WebSocket client).
3. **Provider Injection**: Change the single exported provider in `frontend/src/services/telemetrySimulator.ts`:
   ```ts
   // Switch from SimulatorProvider to ESP32Provider
   export const telemetrySimulator: TelemetryProvider = new ESP32Provider({ brokerUrl: "wss://iot.wattwise.ai" });
   ```
4. **Zero UI Impact**: The entire dashboard, charts, alerts, and classroom views remain 100% compatible without code changes.
