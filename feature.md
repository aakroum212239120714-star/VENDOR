# Feature Specification: Multi-Tenant WhatsApp AI Sales Agent

## 1. Feature Overview & Objectives
A competitive multi-tenant feature allowing SaaS vendors to link their personal or business WhatsApp accounts to the platform. An AI agent (powered by Google Gemini) acts as an expert local Algerian sales assistant, responding to customer inquiries in Algerian Darja. When a customer decides to buy, the AI extracts their shipping details and order preferences, and the system automatically creates a secure order in the database and updates stock.

## 2. Technical Stack & Constraints
- **Backend:** Node.js with Express.js (v5).
- **Database:** MySQL accessed via raw parameterized queries (`mysql2/promise` connection pool). **Strictly NO ORMs.**
- **Frontend:** React 19 (Vite) with a unified state/context system.
- **Security:** Vendor routes protected by JWT-based `protect` middleware.
- **AI:** Google Gemini API (`gemini-1.5-flash`).
- **WhatsApp Integration:** Socket-based library like `Baileys` (highly recommended over Puppeteer-based solutions like `whatsapp-web.js` to minimize server RAM and CPU overhead).

## 3. Core Architectural Workflows

### 3.1 WhatsApp Session Setup (Handshake)
1. **Activation:** The Vendor clicks "Activate WhatsApp AI" on their dashboard.
2. **Initialization:** The Express backend initializes a WhatsApp client instance mapped to the vendor's `store_id`.
3. **QR Code Delivery:** The backend generates a QR code and streams it in real-time to the vendor's React UI using `socket.io`. The socket connection must be authenticated and scoped to a specific room (e.g., `store_${store_id}`) to ensure privacy.
4. **Session Persistence:** Upon successful scan, session credentials must be saved securely (to the database or a persistent file system) so the connection can survive server restarts without requiring re-scanning.

### 3.2 AI Conversation Flow
1. **Inbound Message:** A customer sends a WhatsApp message. The backend listener for the corresponding `store_id` intercepts it.
2. **Context Retrieval:** The backend queries the database for the active product catalog:
   ```sql
   SELECT id, name, price, stock FROM products WHERE store_id = ? AND is_active = 1;
   ```
3. **Gemini Query:** The backend sends the system instruction, catalog, customer message, and recent conversation history to the Gemini API.
4. **Structured JSON Output:** Gemini is strictly configured to output JSON containing:
   - `reply_message`: The conversational response in Algerian Darja.
   - `is_ready_to_order`: A boolean flag indicating if shipping and product details are fully collected.
   - `order_details`: An object containing extracted entities (`customer_name`, `wilaya`, `phone`, `items: [{product_id, quantity}]`).
5. **Outbound Message:** The backend parses the JSON and dispatches the `reply_message` back to the customer via WhatsApp.

### 3.3 Automated Order Fulfillment (Concurrency Control)
When `is_ready_to_order` is `true`, the system must securely process the order using strict database transactions to prevent race conditions (e.g., overselling a product when multiple customers order simultaneously).

1. **Transaction Start:** `connection.beginTransaction()`
2. **Row-Level Locking:**
   ```sql
   SELECT stock, price FROM products WHERE id = ? AND store_id = ? FOR UPDATE;
   ```
3. **Validation:** Check if `stock >= requested_quantity`. If not, `connection.rollback()` and notify the customer.
4. **Execution:**
   - Update stock: `UPDATE products SET stock = stock - ? WHERE id = ?`
   - Insert into `orders` (with a new source indicator, e.g., `'whatsapp'`).
   - Insert into `order_items`.
5. **Commit:** `connection.commit()`
6. **Real-time Sync:** Emit a `socket.io` event to the vendor's dashboard to display the new order instantly.

## 4. Required Database Schema Additions
To support this feature flawlessly, the following schema updates will be necessary:

1. **WhatsApp Sessions Table:**
   To persist client connections across server restarts.
   - `store_id` (Foreign Key)
   - `session_data` (JSON/Text)

2. **Conversation History Table:**
   To maintain the context window for Gemini without exceeding token limits or sending massive payloads on every message.
   - `phone_number` (String)
   - `store_id` (Foreign Key)
   - `context_json` (JSON - stores the last 10-15 messages)
   - `last_updated` (Timestamp - allows pruning of stale chats)

3. **Orders Table modification:**
   - Add a `source` column (e.g., `ENUM('web', 'whatsapp') DEFAULT 'web'`) to differentiate order origins.

## 5. Potential Bottlenecks & Mitigation Strategies
- **Memory Consumption:** Running multiple WhatsApp web clients on a single server is expensive. **Mitigation:** Use `Baileys` (which communicates via WebSockets) instead of launching headless Chromium instances. Implement connection pooling or idle timeouts if necessary.
- **Gemini Rate Limits:** High message volume could hit API rate limits. **Mitigation:** Ensure conversation history is strictly truncated to the last few relevant messages.
- **Orphaned DB Locks:** If the Node process crashes mid-transaction, locks might persist. **Mitigation:** Ensure strict `try...catch...finally` blocks in the transaction logic, guaranteeing `connection.release()` is always called.

## 6. Development Stages & Progress (Implementation Guide)

This section outlines the step-by-step roadmap for the AI to complete the project.

### Phase 1: WhatsApp Handshake & Linking [COMPLETED]
**Goal:** Enable vendors to securely link their WhatsApp accounts via a QR code.
- **Implementation:** 
  - Integrated `socket.io` for real-time QR code streaming to the frontend.
  - Implemented the Baileys client (`whatsappService.js`) initialized per `store_id`.
  - Built the `WhatsappAIPage.jsx` React component to handle QR scanning and connection status via `ToastContext`.
- **Critical Improvements & Fixes Applied:**
  - **Aggressive 401 Rejections Fix:** Set `browser: ["Ubuntu", "Chrome", "20.0.04"]` in the Baileys configuration to bypass WhatsApp's strict anti-bot filters during QR scanning.
  - **Passive Flag Bug Fix:** Added `markOnlineOnConnect: false` to bypass the `passive: true` status payload bug present in recent Baileys versions that causes immediate 401 disconnects.
  - **Offline Resilience:** Wrapped `fetchLatestBaileysVersion()` in a try-catch block with a hardcoded fallback version to prevent backend crashes if the server temporarily loses internet connectivity.
  - **Corrupted Session Handling:** Enhanced the connection closure logic to detect `DisconnectReason.badSession` (HTTP 500) and automatically purge corrupted state directories, preventing infinite reconnection loops.

### Phase 2: Gemini AI Integration & Conversation Management [PENDING]
**Goal:** Intercept incoming WhatsApp messages, manage conversation history, and generate context-aware AI replies in Algerian Darja.
- **Tasks:**
  1. Add the `conversation_history` table to the MySQL database to track ongoing chats.
  2. Implement the `messages.upsert` event listener in `whatsappService.js` to catch inbound customer messages.
  3. Create a `geminiService.js` to interface with the Google Gemini API.
  4. Build the context prompt: fetch active products (`stock > 0`) for the current `store_id` and inject them into Gemini's system instructions.
  5. Format Gemini's output to strictly return JSON (reply message, order readiness, order details).
  6. Send Gemini's `reply_message` back to the customer via Baileys.

### Phase 3: Automated Order Extraction & Concurrency [PENDING]
**Goal:** Create secure orders and update stock automatically when the AI determines the customer is ready to buy.
- **Tasks:**
  1. Add the `source` column to the `orders` table to distinguish WhatsApp orders.
  2. When Gemini returns `is_ready_to_order: true`, trigger the order fulfillment service.
  3. Implement the rigorous transactional logic (Row-Level Locking with `FOR UPDATE`) to prevent overselling.
  4. Emit a real-time `socket.io` event to the vendor's dashboard when a WhatsApp order is successfully placed, providing an instant "wow" factor.
  5. Reply to the customer confirming their order and total price.

### Phase 4: Error Handling, Rate Limiting & Polish [PENDING]
**Goal:** Ensure the system is production-ready.
- **Tasks:**
  1. Truncate conversation history sent to Gemini to the last 10 messages to save tokens.
  2. Add logic to ignore messages from groups or broadcast lists (only handle direct messages).
  3. Final UI polish on the frontend (e.g., displaying the active phone number linked, a toggle to turn the AI on/off for specific stores).
