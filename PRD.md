# Product Requirement Document (PRD)
## Project: NexusCore - White Label Coin Reseller SaaS

**Version:** 1.0.0  
**Status:** Draft / Conceptual  
**Author:** NexusCore CTO Office  

---

### 1. Product Vision
To become the "Shopify for Digital Goods," specifically targeting the gaming top-up and virtual currency market. NexusCore empowers agencies to launch their own branded reseller platforms in minutes, abstracting the complexity of supplier API integrations, multi-level pricing, and secure payment processing.

---

### 2. User Roles & Onboarding Systems

NexusCore implements a multi-tenant role model mapping platform access levels. Below are the definition matrix and the operational onboarding workflows designed to transition newly signed-up users to active statuses within the MVP.

#### 2.1 User Roles Matrix
| Role | Scope | Key Permissions & Data Boundaries | Primary MVP Activities |
| :--- | :--- | :--- | :--- |
| **Super Admin (Platform Owner)** | Global Cluster | Read-Write across all tenant spaces. Manage master connections. | System health metrics, tenant activation, circuit breakers. |
| **Agency (Tenant Admin)** | Tenant Space | Read-Write isolated by `tenant_id`. Custom CNAME. | Edit branding, config tiers, approve resellers, audit margins. |
| **Reseller**| Tiered Account | Isolated to user profile and downstream customers' orders. | Purchase discounted coins, pull api keys, generate links. |
| **End-Customer** | Order ID Session | Read-Only transient page, restricted checkouts. | Storefront browser, invoice lookup, credit card/crypto gateway. |

---

#### 2.2 User Flows for Agency Onboarding

The path to operational readiness for an Agency is serialized into a multi-step setup pipeline. The system enforces completion of these baseline inputs to hydrate the microservices database.

```
 [Sign Up & Verification] 
            │
            ▼
   [Tenant Setup Form]     ──► Inputs: Subdomain, Business Legal Name
            │
            ▼
  [Branding Customization]  ──► Uploads: Logo, Favicon; Choose Palette
            │
            ▼
 [Pricing Tier Baseline]   ──► Configure Standard, Gold, Platinum markups
            │
            ▼
    [DNS Config Mapping]   ──► Point CNAME -> cname.nexuscore.app
            │
            ▼
   [Ledger Activation]     ──► Fund initial buffer credit balance (SLA check)
```

##### Step 1: Authentication & Core Account Provisioning
*   **User Action:** Accesses platform landing portal `nexuscore.app/onboard`, inputs Name, Work Email, Strong Password, and Phone fields (optional WhatsApp notification consent).
*   **System Action:** Creates records in SaaS `users` table under transient role `AGENCY_PENDING_REGISTRATION`. Fires email validation link with high-entropy verification code.

##### Step 2: Tenant Workspace Provisioning (SaaS Boundary)
*   **User Action:** Inputs business metadata: Brand Label (used to auto-construct raw subdomain, e.g., `brandname.nexuscore.com`), Legal Entity Name, Corporate Country, and Target Currency Profile (USD, IDR, etc.).
*   **System Action:** Assesses subdomain availability against global namespace. Allocates unique `tenantId` and provisions standard sandbox storage paths inside the relational database.

##### Step 3: Brand Customization & Configuration
*   **User Action:** Uploads Primary Light Logo, Dark Landscape Logo, favicon asset (JPEG/PNG constraints), and chooses a base styling template. Selects primary and secondary hex values.
*   **System Action:** Re-encodes images to standardized formats and outputs optimized links. Hydrates the internal cache directory with custom CSS visual components.

##### Step 4: Margin Config & Tier Schema Definition
*   **User Action:** Enters the default shop MSRP markup percentage (e.g., 8%) and defines tier percentage compressions for standard user ranks.
*   **System Action:** Compiles dynamic pricing equations. Caches baseline price values.

##### Step 5: Domain CNAME Configuration & SSL Provisioning
*   **User Action:** Inputs custom domain (e.g., `topup.mybrand.com`). Receives DNS mapping instruction pointing their domain CNAME to `cname.nexuscore.app`.
*   **System Action:** Initiates async thread to monitor external DNS resolutions. Once DNS resolution matches, initiates ACME Let's Encrypt security request to bind the SSL.

##### Step 6: Initial Wallet Ledger Funding
*   **User Action:** Selects payment method (e.g., credit card, bank wire, USDT invoice) to fund the administrative balance pool.
*   **System Action:** Credits the Agency wallet ledger. Allocates master API request volume and moves the tenant status to `ACTIVE`.

---

#### 2.3 User Flows for Reseller Onboarding

Resellers register via an Agency's custom-branded storefront domain. Their onboarding pathway is optimized for mobile browser interfaces.

```
 [Branded Portal Registration] 
               │
               ▼
     [Tier Rank Assignment]    ──► Selected: System Standard or custom invite
               │
               ▼
    [KYC Verification Panel]   ──► Inputs: ID details, mobile number (Wholesalers)
               │
               ▼
     [Wallet Buffer Funding]   ──► Transfers initial topup amount to secure tier rates
               │
               ▼
     [API Credentials Keys]    ──► Generated HMAC endpoints active for bulk integrations
```

##### Step 1: Branded Store Registration
*   **User Action:** Accesses Agency's white-label landing portal, click "Register as Reseller", and inputs username, password, email, and localized messaging credential (WhatsApp ID/Telegram tag).
*   **System Action:** Creates user profile isolated under that specific `tenantId` (e.g., `tenant_id: "gold-diamonds-agency"`). Sets account status to `PENDING_APPROVAL`.

##### Step 2: KYC & Business Registration (Optional by Tenant Owner)
*   **User Action:** Fills out business information: target monthly distribution volumes, regional target audience, and optional verification document images (national ID, business registration).
*   **System Action:** Uploads attachments to isolated folders, notifies the Agency administrator dashboard via long-poll socket notifications and emails.

##### Step 3: Agency Approval & Tier Allocation
*   **Agency Action:** Reviews reseller profile inside their dashboard client view, accepts documents, and designates an initial user tier level (e.g., "Silver Reseller" or "Gold Reseller").
*   **System Action:** Binds `tier_id` to user record, activating specific category discounts. Outputs automatic notification email to the reseller.

##### Step 4: Core Ledger Integration
*   **User Action:** Accesses reseller panel, selects "Pre-fund Wallet Balance", selects payment options approved by the Agency (e.g., Direct bank wire, localized payment channels, crypto). Inputs receipt images.
*   **System Action:** Notifies Agency. Upon approval, credits reseller balance ledger. The calculated product catalog dynamically filters down to their designated discount margin.

##### Step 5: API Key Generation (For Programmatic Resellers)
*   **User Action:** For wholesale resellers integrating bulk setups, clicks "Generate API Key" inside dashboard. Output generates `Client_ID` and `Client_Secret_HMAC` credentials.
*   **System Action:** Hashes and stores credentials inside database using salted SHA-256 algorithms. Activates bulk JSON API endpoints for SKU searching and transaction submissions.

---

### 3. Core Features

This section breaks down the primary functionalities of the NexusCore platform, categorized into features empowering Agencies (the B2B operators) and Resellers (the B2B2C distributors).

#### 3.1 Agency Capabilities (Platform Operations)
*   **White-Label Website Creation:** Effortless generation of branded storefronts. Agencies can map custom domains (e.g., `shop.myagency.com`), upload logos/favicons, select visual themes (colors, typography), and manage localized SEO/CMS pages without touching code.
*   **Dynamic Pricing & Markup Engine:** Highly granular pricing controls allowing Agencies to set global markup percentages, category-specific exceptions, and define tiered pricing rules down to individual SKUs. Margins are automatically protected against upstream supplier volatility.
*   **Reseller Network Management (CRM):** A centralized dashboard to onboard, verify (KYC), and rank resellers into tiers (e.g., Bronze, Silver, Gold). Includes tools to adjust individual reseller wallet balances, track their sales performance, and manage support tickets.
*   **Wallet & Ledger Administration:** Tools to fund the master agency wallet for fulfilling downstream orders, monitor real-time gross transaction volumes, and audit immutable ledger history for transparent accounting.

#### 3.2 Reseller Capabilities (Fulfillment & Sales)
*   **High-Speed Coin Top-Up Interface:** A mobile-optimized, frictionless checkout portal enabling resellers to quickly input end-user IDs (e.g., Mobile Legends User ID) and process digital currency top-ups within seconds.
*   **Transaction Processing & Tracking:** Real-time visibility into order statuses (Pending, Success, Failed). Integrates webhook callbacks notifying resellers exactly when an upstream supplier completes the virtual delivery.
*   **Wallet Management & Automated Billing:** Resellers operate on a pre-funded credit wallet model. The system instantly deducts appropriate tier-discounted costs at the moment of transaction. Resellers can request wallet top-ups via integrated payment gateways or manual bank transfer uploads directly within their portal.
*   **Programmatic API Access:** Platinum/Wholesale rank resellers can generate secure HMAC API keys to connect their own custom websites or applications to the Agency's fulfillment engine.

---

### 4. Technical Architecture

NexusCore is designed as a high-throughput, latency-optimized transactional engine. To balance speed to market with long-term scalability, the system relies on a modular monolith architecture that can be naturally decomposed into microservices as volume dictates.

#### 4.1 Architecture Paradigm
*   **Modular Monolith Transitioning to Microservices:** The MVP operates as a well-structured "modular monolith" to simplify deployment and reduce latency overhead across domains (Tenants, Pricing, Suppliers). However, service boundaries are strictly enforced via code, permitting a seamless migration to a true microservice mesh (e.g., separating the Notification Engine and Supplier Poller into standalone containers) as scaling demands increase.
*   **API-First & Headless Approach:** The entire backend is designed headless. The frontend dashboards and storefronts consume the exact same REST/GraphQL endpoints that are exposed to wholesale API resellers, ensuring feature parity and robust testing.
*   **Event-Driven Operations:** Heavy processes (such as PDF invoice generation, async supplier catalog syncs, and webhook dispatches) avoid blocking the main server thread by leveraging event-driven background queues.

#### 4.2 Key Technologies & Stack
*   **Frontend (Agency Dashboards & Storefronts):** React.js initialized via Vite for lightning-fast HMR and optimal build sizes. Styled with Tailwind CSS for utility-first responsive designs and customized tenant CSS variables. Framer Motion handles micro-interactions.
*   **Backend (Core Engine):** Node.js utilizing Express (or Fastify) written in strict TypeScript. Node's non-blocking I/O is ideally suited for the highly concurrent, I/O-heavy nature of proxying thousands of upstream supplier API requests.
*   **Database (Persistence):** PostgreSQL. A relational database is strictly required to enforce ACID compliance for financial ledger integrity, wallet balances, and multi-tenant row-level isolation. 
*   **Caching & Concurrency (Memory):** Redis caching layer. Used for resolving custom domain Host headers instantly, caching high-frequency supplier pricing tiers (to prevent DB hammering), and handling distributed locks to prevent double-spend wallet race conditions.

#### 4.3 Cloud Provider & Infrastructure
*   **Hosting:** Containerized applications deployed on Google Cloud Platform (GCP) Cloud Run or AWS ECS/Fargate for serverless, horizontally auto-scaling computing without maintaining raw EC2 instances. 
*   **Edge Routing & CDN:** Cloudflare operates at the edge to provide DDoS protection, wildcard SSL certificate mapping for custom tenant domains, and dynamic asset caching (logos, banners).
*   **Background Jobs:** BullMQ (backed by Redis) manages persistent queuing for transaction retries, webhooks, and asynchronous email delivery.

---

### 5. Detailed Relational Database Schema

This section documents the enterprise-grade relational database schema for NexusCore, utilizing PostgreSQL as the primary ACID-compliant transactional registry. Schema isolation is achieved via multi-tenant column scoping, backed by row-level application security.

```
       +--------------------+          +---------------------------+
       |      Agencies      | <─────── | Whitelabel_Configurations |
       +--------------------+          +---------------------------+
                 │                                   ▲
                 ├───────────────────────────────────┤
                 ▼                                   ▼
       +--------------------+          +---------------------------+
       |       Users        | <─────── |      Wallet_Balances      |
       +--------------------+          +---------------------------+
                 │                                   │
                 ▼                                   ▼
       +--------------------+          +---------------------------+
       |       Orders       | ────────>|    Ledger_Transactions    |
       +--------------------+          +---------------------------+
         │                │
         ▼                ▼
+------------+   +------------+
|  Products  |   | Suppliers  |
+------------+   +------------+
```

---

#### 5.1 Tables Specification

##### 1. `agencies` (Tenants)
Stores master registration, white-label routing domains, and high-level tenant operational status variables.
*   **Columns:**
    *   `id` (`UUID`, Primary Key) — Unique tenant global identifier. Defaults to `gen_random_uuid()`.
    *   `business_name` (`VARCHAR(255)`, Not Null) — Legal corporate operating title.
    *   `slug_subdomain` (`VARCHAR(63)`, Unique, Not Null) — System-wide sub-URL namespace (e.g., `agency1`).
    *   `custom_domain` (`VARCHAR(253)`, Unique, Null) — Custom vanity host (e.g., `shop.myagency.com`).
    *   `status` (`VARCHAR(32)`, Default: `'PENDING_ONBOARDING'`) — Enums: `'PENDING_ONBOARDING'`, `'ACTIVE'`, `'RATELIMITED'`, `'SUSPENDED'`.
    *   `currency` (`CHAR(3)`, Default: `'USD'`) — Standard base pricing calculation currency code.
    *   `created_at` (`TIMESTAMP`, Default: `NOW()`)
    *   `updated_at` (`TIMESTAMP`, Default: `NOW()`)
*   **Foreign Keys / Constraints:**
    *   `slug_subdomain` must match regex pattern: `^[a-z0-9-]+$`.
*   **Indexes:**
    *   `idx_agencies_custom_domain` ON `custom_domain` (B-Tree, unique lookup for Tenant Routing Middleware).
    *   `idx_agencies_slug` ON `slug_subdomain` (B-Tree).

##### 2. `whitelabel_configurations` (Customize Options)
Holds the actual theme mapping, styling CSS constants, SEO guidelines, headers, and footers for the website builder.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Unique, Not Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
    *   `selected_template_tag` (`VARCHAR(64)`, Default: `'default_dark'`) — Branding template reference.
    *   `logo_primary_url` (`VARCHAR(2048)`, Not Null) — CDN link for primary visual headers.
    *   `logo_dark_url` (`VARCHAR(2048)`, Null) — Secondary logo optimized for dark contrast backgrounds.
    *   `favicon_url` (`VARCHAR(2048)`, Null) — Store browser shortcut icon.
    *   `color_theme_palette` (`JSONB`, Not Null) — JSON holding configuration variables:
        ```json
        {
          "primary": "#00ADB5",
          "secondary": "#393E46",
          "accent": "#EEEEEE",
          "background_dark": "#222831",
          "background_light": "#FFFFFF"
        }
        ```
    *   `header_navigation` (`JSONB`, Null) — Structure tree controlling dynamic menu anchor lists.
    *   `footer_content` (`JSONB`, Null) — Custom structural links, copyright terms, and WhatsApp anchors.
    *   `seo_meta_config` (`JSONB`, Null) — Page titles, open-graph parameters, and tracking identifiers.
*   **Indexes:**
    *   `idx_whitelabel_agency` ON `agency_id` (B-Tree).

##### 3. `users` (Core Accounts Registry)
Consolidated table for multi-tenant accounts mapping platform roles.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
        *   *Note: Platform Super Admins have `agency_id = NULL`.*
    *   `email` (`VARCHAR(255)`, Not Null) — Login credential.
    *   `password_hash` (`VARCHAR(255)`, Not Null) — Password encrypted with strong bcrypt algorithms.
    *   `role` (`VARCHAR(32)`, Not Null) — Enums: `'SUPER_ADMIN'`, `'AGENCY_ADMIN'`, `'RESELLER'`, `'RETAIL_CUSTOMER'`.
    *   `tier_level` (`VARCHAR(32)`, Default: `'STANDARD'`) — Enums: `'STANDARD'`, `'BRONZE'`, `'SILVER'`, `'GOLD'`, `'PLATINUM'`.
    *   `status` (`VARCHAR(32)`, Default: `'PENDING_VERIFICATION'`) — Enums: `'PENDING_VERIFICATION'`, `'ACTIVE'`, `'SUSPENDED'`.
    *   `telegram_handle` (`VARCHAR(64)`, Null)
    *   `whatsapp_number` (`VARCHAR(32)`, Null)
    *   `created_at` (`TIMESTAMP`, Default: `NOW()`)
*   **Foreign Keys / Constraints:**
    *   Unique constraint on `(agency_id, email)`. Allows same email to register on different white-label store instances safely.
*   **Indexes:**
    *   `idx_users_login` ON `(agency_id, email, status)`.

##### 4. `wallet_balances` (Wallets)
Isolated platform balance records representing safe virtual ledger accounting values.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `owner_id` (`UUID`, Unique, Not Null, FK &mdash;> `users.id` ON DELETE CASCADE)
    *   `balance_amount` (`DECIMAL(18, 4)`, Default: `0.0000`) — Stored with quad-precision decimals.
    *   `frozen_amount` (`DECIMAL(18, 4)`, Default: `0.0000`) — Escrowed credits during outstanding transaction fulfillments.
    *   `version_lock` (`INT`, Default: `0`) — Optimistic concurrency mapping field to prevent double-spend race conditions.
    *   `updated_at` (`TIMESTAMP`, Default: `NOW()`)
*   **Foreign Keys / Constraints:**
    *   `balance_amount` must always stay >= 0.0000.

##### 5. `suppliers` (Raw Vendor Hubs)
Addresses raw API parameters and structural metadata details of upstream digital suppliers.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `supplier_name` (`VARCHAR(100)`, Not Null) — E.g., `'Digiflazz'`, `'API Games'`.
    *   `api_endpoint_url` (`VARCHAR(2048)`, Not Null)
    *   `api_credentials` (`JSONB`, Not Null) — AES-256 encrypted fields holding vendor secrets, client keys, and webhook hashes.
    *   `connection_status` (`VARCHAR(32)`, Default: `'HEALTHY'`) — Enums: `'HEALTHY'`, `'LATENCY_SPIKE'`, `'CIRCUIT_OPEN'`, `'SYSTEM_OUTAGE'`.
    *   `latency_ms` (`INT`, Default: `0`) — Real-time performance query output statistics.
    *   `created_at` (`TIMESTAMP`, Default: `NOW()`)

##### 6. `product_categories`
Groupings of game modules (e.g., "Mobile Legends Diamonds", "Steam Vouchers").
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
        *   *If `agency_id` is null, it represents a global standard category template.*
    *   `category_name` (`VARCHAR(100)`, Not Null)
    *   `icon_resource_url` (`VARCHAR(2048)`, Null)
    *   `is_visible` (`BOOLEAN`, Default: `TRUE`)

##### 7. `products` (SKU Catalog)
Actual system-wide game currency voucher items mapping raw costs against retail properties.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `tenant_id` (`UUID`, Not Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
    *   `category_id` (`UUID`, Not Null, FK &mdash;> `product_categories.id`)
    *   `supplier_id` (`UUID`, Not Null, FK &mdash;> `suppliers.id`)
    *   `supplier_sku` (`VARCHAR(128)`, Not Null) — Real key mapping SKU inside supplier network.
    *   `product_title` (`VARCHAR(150)`, Not Null) — Label showed to shoppers (e.g., `'1000 Diamonds'`).
    *   `supplier_cost` (`DECIMAL(18, 4)`, Not Null) — Volatile raw cost units received from supplier pricing sync.
    *   `base_retail_price` (`DECIMAL(18, 4)`, Not Null) — Standard base retail pricing computed for end-customers.
    *   `inventory_status` (`VARCHAR(32)`, Default: `'INSTOCK'`) — Enums: `'INSTOCK'`, `'OUTOFSTOCK'`, `'PAUSED'`.
    *   `last_pricing_sync` (`TIMESTAMP`, Default: `NOW()`)
*   **Indexes:**
    *   `idx_products_lookup` ON `(tenant_id, category_id, inventory_status)`.

##### 8. `pricing_rules_and_markups` (Dynamic Pricing Rules)
Fine-grained calculations adjusting pricing cascading models based on categories or individual items.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Not Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
    *   `rule_scope` (`VARCHAR(32)`, Not Null) — Enums: `'GLOBAL'`, `'CATEGORY'`, `'PRODUCT_SKU'`.
    *   `target_tier` (`VARCHAR(32)`, Null) — Specific user tier target (`'BRONZE'`, `'GOLD'`, etc.). NULL means global audience.
    *   `category_id` (`UUID`, Null, FK &mdash;> `product_categories.id`)
    *   `product_id` (`UUID`, Null, FK &mdash;> `products.id`)
    *   `percentage_markup` (`DECIMAL(5, 4)`, Default: `0.0000`) — Percent markup (e.g., `0.1200` represents `12%`).
    *   `flat_adjustment_fee` (`DECIMAL(10, 4)`, Default: `0.0000`) — Fixed flat additions.
*   **Indexes:**
    *   `idx_pricing_markup_resolutions` ON `(agency_id, rule_scope, target_tier)`.

##### 9. `orders` (Fulfillment Log)
Main operational transactional records logging exact status changes and serial output strings.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Not Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
    *   `user_id` (`UUID`, Not Null, FK &mdash;> `users.id`) — Shopper account.
    *   `product_id` (`UUID`, Not Null, FK &mdash;> `products.id`)
    *   `supplier_id` (`UUID`, Not Null, FK &mdash;> `suppliers.id`)
    *   `target_account_id` (`VARCHAR(128)`, Not Null) — Game customer identifier (e.g., MLBB ID `18247294 (2083)`).
    *   `price_charged` (`DECIMAL(18, 4)`, Not Null) — Real wallet cost deducted.
    *   `original_cost` (`DECIMAL(18, 4)`, Not Null) — Supplier cost at the time of order placement.
    *   `net_margin_profit` (`DECIMAL(18, 4)`, Not Null) — Real-time profit calculated: `(price_charged - original_cost)`.
    *   `order_status` (`VARCHAR(32)`, Default: `'QUEUED'`) — Enums: `'QUEUED'`, `'SUPPLIER_SUBMITTED'`, `'SUCCESS'`, `'FAILED'`, `'REFUNDED'`.
    *   `fulfillment_serial_token` (`TEXT`, Null) — Decrypted serial codes/vouchers delivered to customer.
    *   `raw_supplier_response` (`JSONB`, Null) — Response payloads stored for diagnostics.
    *   `created_at` (`TIMESTAMP`, Default: `NOW()`)
*   **Indexes:**
    *   `idx_orders_status` ON `(agency_id, order_status, created_at DESC)`.
    *   `idx_orders_user` ON `(user_id)`.

##### 10. `ledger_transactions` (Immutability Logs)
Double-entry accounting log capturing each ledger adjustment to defend against manipulation or DB injections.
*   **Columns:**
    *   `id` (`UUID`, Primary Key)
    *   `agency_id` (`UUID`, Not Null, FK &mdash;> `agencies.id` ON DELETE CASCADE)
    *   `wallet_id` (`UUID`, Not Null, FK &mdash;> `wallet_balances.id` ON DELETE CASCADE)
    *   `amount_delta` (`DECIMAL(18, 4)`, Not Null) — Positive for credits, negative for debits.
    *   `transaction_type` (`VARCHAR(32)`, Not Null) — Enums: `'TOPUP'`, `'PURCHASE_DEBIT'`, `'REFUND_CREDIT'`, `'ADJUSTMENT_MANUAL'`.
    *   `reference_order_id` (`UUID`, Null, FK &mdash;> `orders.id` ON DELETE SET NULL)
    *   `audit_meta` (`JSONB`, Null) — IP address origins, action details, admin identities.
    *   `logged_at` (`TIMESTAMP`, Default: `NOW()`)
*   **Indexes:**
    *   `idx_ledger_auditing` ON `(wallet_id, transaction_type, logged_at DESC)`.

---

### 6. API Architecture
*   **Internal API:** RESTful routes for the dashboard and storefront logic.
*   **Supplier Bridge:** A standard interface to normalize different supplier APIs into a single internal format.
*   **Partner API:** (Future) Allows Agency's resellers to integrate their own systems via API.

---

### 7. The White Label System & Customizable Storefront Engine

NexusCore's Whitelabel Engine is structured as a tenant-isolated rendering platform. It isolates UI state visually via on-the-fly injection of configuration structures. The platform's global routing layers parse the inbound standard HTTP requests, hydrate parameters using Redis caching tiers, and dynamically style layouts.

```
+---------------------------------------------------------------------------------------------------------------+
| INCOMING HTTP REQUEST: Host Header matching "shop.myagency.com" or "agency-slug.nexuscore.com"                |
+---------------------------------------------------------------------------------------------------------------+
                                                       │
                                                       ▼
+---------------------------------------------------------------------------------------------------------------+
| TENANT ROUTING MIDDLEWARE: Extracts Host -> Resolves Tenant ID via Redis (Fallback: PostgreSQL lookup)       |
+---------------------------------------------------------------------------------------------------------------+
                                                       │
                                                       ▼
+---------------------------------------------------------------------------------------------------------------+
| CONFIGURATION HYDRATION: Hydrates custom styles, asset URLs, dynamic catalogs, and currency definitions       |
+---------------------------------------------------------------------------------------------------------------+
                                                       │
                                                       ▼
+---------------------------------------------------------------------------------------------------------------+
| PROGRAMMATIC FRONTEND RENDERING: Injects custom CSS Variables, applies custom themes, and loads localized HTML|
+---------------------------------------------------------------------------------------------------------------+
```

---

#### 7.1 White-Label Customization Dashboard Panel
Agencies customize their storefront instances within a dedicated Whitelabel Configuration Dashboard. The UI compiles inputs and saves updates to the `whitelabel_configurations` database table.

##### 1. Brand Asset Upload & Management Pipeline
*   **Primary Light Logo:** Used in standard navigation menus matching high-contrast white boundaries.
    *   *Constraints:* Accepts `.png`, `.svg` (preferred), or `.jpeg`. Maximum file size limit: 3MB. Suggested dimensions: `320px x 80px`.
*   **Secondary Dark Logo:** Optimizes design layout against dark canvas themes.
    *   *Constraints:* Must match same dimensional scaling as primary logo.
*   **Favicon Asset:**
    *   *Constraints:* Square format standard. Accepts `.ico` or `.png`. Sized at `32px x 32px` or `16px x 16px`.
*   **Asset Processing Heuristics:**
    *   All uploaded files undergo server-side optimization pipelines. Images are resized to match design specifications, scrubbed of metadata payload strings, and saved into an isolated bucket under custom relative paths (e.g., `/cdn/tenants/{tenant_id}/assets/logo_light.png`).

##### 2. Dynamic Color Theme & Color Scheme Customizer
Agencies manipulate a real-time responsive color picker to adjust the UI aesthetic. Changes inject custom styling variables into the base stylesheet dynamically:
*   **Color Variable Mapping Matrix:**
    *   `--primary-color`: Accents buttons, loading bars, checkouts, and selection states (e.g., `#00ADB5`).
    *   `--secondary-color`: Controls cards, containers, input regions, and secondary action selectors.
    *   `--accent-color`: Handles visual outlines, status indicators, and micro-animations highlights.
    *   `--bg-color-canvas`: Absolute background color of the storefront canvas. Enables light and dark templates.
*   **Vite/Tailwind Injection Setup:**
    ```html
    <style id="custom-tenant-variables">
      :root {
        --color-primary: {tenant_color_primary};
        --color-secondary: {tenant_color_secondary};
        --color-accent: {tenant_color_accent};
        --color-bg-canvas: {tenant_color_bg_canvas};
      }
    </style>
    ```

##### 3. Layout Templates Configuration Options
Agencies switch the look-and-feel of their storefront without losing data:
*   *Template A (Gamer Dark Mode):* Default design with dark charcoal backdrops, customized glowing neon gradients, and a compact visual grid.
*   *Template B (Clean Minimalist):* Modern white spaces, light borders, subtle shadow variables, and clean list-based layout containers.
*   *Template C (Esports Grid):* Bold display fonts tracking margins, high-density elements, and large category cards.

---

#### 7.2 Core Header & Footer CMS Builders
To ensure full operational freedom, the system integrates a visual Drag-and-Drop Navigation Tree editor to override header and footer configurations.

##### 1. Header Navigation Manager
*   **Menu Link Architect:** Agencies define active navbar links (e.g., "Home", "Topup Diamonds", "About Us", "Contact Us", "Voucher Tracker").
*   **Dynamic Links:** External links support target routing tags (e.g., open in a new tab `_blank` or same frame).
*   **Social Widgets Integration:** Direct toggles to render floating social links across the top margin (e.g., Telegram channels, TikTok page link, Discord invitations).

##### 2. Footer Section CMS
*   **Legal Policy Links:** Built-in builders to define custom text pages or route standard templates for Privacy Guidelines, Dispute Guidelines, and Terms of Use (Terms of Service uses auto-replace tag: `{agency_business_name}`).
*   **Copyright Content Editor:** Customized rich text area accepting localized inputs to display corporate info:
    *   *System standard input profile:* `Copyright © 2026 {AgencyLegalName}. Powered by NexusCore Technologies.`
*   **Live Support Badges & Chat Overlays:** Constant layout floating actions (such as high-converting sticky floating WhatsApp buttons or Telegram chat bubbles with configurable localized direct-call mobile numbers).

---

#### 7.3 Domain & Subdomain SSL Resolution Infrastructure

NexusCore resolves white-label tenants using a dynamic edge parsing strategy. This approach enables instant subdomain provisioning and custom domain mapping without redeploying frontend assets.

##### 1. Subdomain Assignment Protocol (Zero-Configuration Staging)
*   Agencies automatically receive a default staging URL upon account activation: `{agency-slug}.nexuscore.com`.
*   System maps request paths instantly. The Tenant Routing Middleware looks up the subdomain portion of the `Host` header. If matched in DB records, assets hydrate with that tenant's options.

##### 2. Custom Domain Mapping & DNS Provisioning
Agencies can bind their primary custom host names (e.g., `shop.mybrand.com` or `mybrandtopup.co.id`):
*   **Step 1: Admin Record Binding:** Agency inputs the domain URL in the settings console dashboard.
*   **Step 2: DNS Instruction Set:** The platform shows explicit configuration guidelines:
    *   *Record Type:* `CNAME`
    *   *Host/Name:* `shop` (or `@` for apex domain)
    *   *Points To:* `cname.nexuscore.com`
*   **Step 3: Verification Handshake:** System issues a light checking query verifying that `shop.mybrand.com` resolves back to the platform IP addresses.

##### 3. Automated SSL Certificate Management Engine
To ensure secure transactions and satisfy browser requirements for HTTPS checkout, the platform manages an automated TLS chain:
*   **ACME Protocol Hook:** System triggers a Let's Encrypt certificate challenge asynchronously once CNAME verification passes.
*   **Reverse-Proxy Integration:** Certificates are written directly to Edge Server SSL cache directories (Nginx/Cloudflare dynamic routing blocks).
*   **Auto-Renewal Loop:** Background cron schedulers running every 24 hours monitor certificate expiry dates. Once remaining lifetime falls below 30 days, certificates auto-renew without manual intervention.

---

### 8. Dynamic Pricing Engine & Margin Architecture

#### 8.1 Core Architecture & Calculation Precedence
The NexusCore Pricing Engine is structured as a real-time cascading pipeline that calculates customer-facing retail prices starting from volatile upstream supplier costs. The engine evaluates multiple variables—such as supplier catalog price feeds, agency global rules, category-specific exceptions, and individual-reseller rank tiers—to resolve final transaction amounts. 

The system enforces a strict, deterministic **Precedence Chain** to resolve the final selling price of any digital product SKU:
1. **Specific VIP SKU Override:** Direct manual pricing overrides set by an Agency for a specific Reseller or Tier.
2. **Category-Specific Markup:** Tier/Rank configurations applied to an entire product category (e.g., "Mobile Legends Diamonds" or "Steam Wallet Codes").
3. **Global Tier Markup:** Baseline tier settings applied universally across all products for a specific user role rank (e.g., "Gold Reseller" gets 3% lower markup than "Standard Reseller").
4. **Global Shop Markup:** Agency-level default markup on the raw supplier base cost.

```
       +-------------------------------------------------+
       |             Supplier API Base Cost              |
       |               (e.g., Digiflazz)                 |
       +-----------------------+-------------------------+
                               |
                               v
       +-----------------------+-------------------------+
       |             Global Agency Base Markup           |
       |                (Global Shop MSRP)               |
       +-----------------------+-------------------------+
                               |
                               v
       +-----------------------+-------------------------+
       |               Tier/Rank Group Rules             |
       |          (Bronze, Silver, Gold, Platinum)       |
       +-----------------------+-------------------------+
                               |
                               v
       +-----------------------+-------------------------+
       |           Category/SKU-Specific Exceptions      |
       +-----------------------+-------------------------+
                               |
                               v
       +-----------------------+-------------------------+
       |        User Override / Flash Promotion Price    |
       |                (Absolute Overrides)             |
       +-------------------------------------------------+
```

#### 8.2 Calculation Formulas
Prices are computed on-the-fly or cached via high-performance pipelines. The formula adapts based on whether the shopper is an unauthenticated end-customer, a standard registered account, or a tiered wholesale reseller.

##### 1. Baseline Retail Price (End-Customer / Unauthenticated Shop Visitor)
$\text{Baseline Retail Price} = (\text{Supplier API Base Cost} \times (1 + \text{Agency Base Markup \%})) + \text{Agency Flat Service Fee}$
*This serves as the "MSRP" on the white-label site.*

##### 2. Tiered Reseller Price (Bronze, Silver, Gold, Platinum)
Tiered reseller accounts purchase items using a custom commission structure or absolute discount percentage applied either directly to the base cost or off the retail baseline.
$\text{Reseller Price} = \text{Supplier API Base Cost} \times (1 + \text{Tier Markup \%}) + \text{Tier Flat Booking Fee}$
*Where standard Tier Markup % represents a controlled compression of the agency's baseline retail margin:*
$\text{Tier Markup \%} = \text{Agency Base Markup \%} - \text{Tier Direct Discount \%}$

##### 3. Combined Fixed & Percentage Multi-Tier Calculation Example
Assume a Free Fire 1000 Diamond package has an raw Indonesian supplier base cost of **$10.00** USD:
* **Agency Default Markup:** 12% percentage-based margin + $0.20 flat fee.
  * *End-Customer Retail Price:* $(\$10.00 \times 1.12) + \$0.20 = \$11.40$ (Agency Gross Profit Margin: $14.03\%$ or $1.40 USD).
* **Gold Reseller Tier Modifier:** Enjoys a discounted tier rate (e.g., 5% system-calculated margin reduction off the default markup):
  * *Gold Tier Markup percentage applied to base:* $12\% - 5\% = 7\%$ markup.
  * *Gold Reseller Price:* $(\$10.00 \times 1.07) + \$0.20 = \$10.90$.
* **Specific VIP Reseller SKU Override:** Under special agreements, the agency overrides the Gold margin on this item to a flat promotion price of **$10.50**.
  * *Final VIP Order Price:* $10.50 (Overrides all cascade pricing rules).

#### 8.3 Real-Time Margin Safeguards & Performance Engineering
Upstream game vouchers and topup prices can shift micro-seconds before checkouts occur. The Dynamic Pricing Engine implements several guardrails:
* **Cached Price Indexes (Redis):** Supplier API queries are throttled. Core base costs are cached in Redis for 60 seconds (customizable TTL per supplier) to prevent rate-limiting downstream nodes.
* **Marginal Drift Threshold & Circuit Breakers (Protection Lock):** When a user enters checkout, the price is guaranteed for **120 seconds**. If the supplier's price fluctuates by more than an Agency-defined threshold (e.g., $>2\%$ change) during this checkout window, the system halts auto-fulfillment, notifies the client of the drift, and prompts them to accept the updated price rather than processing at a negative margin.
* **Failover Pricing Bridge:** If the cheapest supplier disconnects, the engine switches to the backup supplier and instantly recomputes prices on the storefront, adding visual indicators of the routing change.


---

### 9. Security
*   **Encryption:** AES-256 for supplier API keys.
*   **Rate Limiting:** Protect against brute-force on login and transaction endpoints.
*   **Audit Logs:** Every balance change is logged with a source IP and timestamp.
*   **Isolation:** Row-level security (RLS) to ensure Agencies never see each other's data.

---

### 10. Scaling Strategy
1.  **Read Replicas:** Scale database reads as customer traffic increases.
2.  **Worker Nodes:** Separate order processing from the web UI to keep dashboards snappy.
3.  **Edge Caching:** Cache product prices and availability at the edge using Cloudflare.

---

### 11. MVP Roadmap & Onboarding Flight Plan

The NexusCore product trajectory is organized into structured phases, ensuring that core infrastructural integrity is established before introducing advanced cosmetic features.

#### Phase 1: Core Foundation & Tenant Hydration (Month 1 - Initial Release)
**Objective:** Deliver the fundamental white-label infrastructure, user authentication, and manual ledger accounting.
*   **Features:**
    *   PostgreSQL multi-tenant database schema deployment with Row-Level Security (RLS).
    *   Core Authentication (JWT) and User Role definitions (Super Admin, Agency, Reseller).
    *   Subdomain dynamic mapping middleware (e.g., `agency1.nexuscore.app`).
    *   Basic Agency dashboard: Profile setup, tenant metadata collection.
    *   Immutable Wallet Ledger: Manual debits/credits via Super Admin intervention.
*   **Milestone:** A functioning portal where an Agency can register, access an isolated dashboard, and view a staging storefront URL.

#### Phase 2: Supplier Bridges & Pricing Engines (Month 2)
**Objective:** Connect the platform to reality by integrating external game publishers/suppliers and computing dynamic pricing.
*   **Features:**
    *   Implementation of the first Master Supplier API Adapter (e.g., Digiflazz).
    *   Catalog sync pipelines running asynchronous CRON jobs to update raw SKUs.
    *   The Dynamic Pricing Resolver: Implementing the mathematical cascade (Global Markup -> Tier Markup -> SKU Exception).
    *   Reseller Registration flow inside the Agency's storefront.
    *   Frictionless Top-Up Checkout screen for manual transaction submissions.
*   **Milestone:** A reseller can log into an Agency's staging site, select a product, and successfully execute a top-up transaction against a live supplier API using pre-funded virtual credits.

#### Phase 3: Operational Go-Live & Scaling (Month 3)
**Objective:** Finalize customization tools, automate operations, and prepare for production public launch.
*   **Features:**
    *   White-Label Customization Dashboard (Upload logos, pick Hex colors, configure footers).
    *   Automated DNS mapping instructions and Let's Encrypt automated wildcard SSL generation.
    *   Aggregated Reporting Dashboard (Visual charts representing revenue, profit margins, active resellers).
    *   Automated webhook listeners for real-time order status updates to resellers.
    *   Automated payment gateway integrations (e.g., Stripe, local fiat routers) for Reseller wallet top-ups.
*   **Milestone:** Commercial MVP Launch. Agencies can point their custom domains to the platform, brand it completely, onboard real downstream resellers, and process automated scale revenue without manual intervention.

#### Phase 4: Expansion & Enterprise Tier (Post-MVP)
**Objective:** Evolve the product to capture large-scale enterprise distributors.
*   **Features:**
    *   Programmatic HMAC API Key generation for Wholesale Resellers.
    *   AI Smart Routing: Automatically querying multiple supplier nodes and routing orders to the one with the cheapest real-time cost.
    *   Crypto Payments natively for Agency-level fulfillment buffering.
    *   "One-Click" Android APK wrapper generation for Agencies.

---

### 12. UI/UX Concept
*   **Clean & Technical:** Use a dark-mode first dashboard with high-contrast data visualizations.
*   **Mobile-Optimized:** 80% of resellers will use mobile phones to place orders.
*   **Frictionless:** "1-Click Top Up" flow for end-customers.

---

### 13. Monetization Strategy
1.  **Subscription Tier:** $29/mo (Starter), $99/mo (Pro with custom domain).
2.  **Platform Fee:** 0.5% per transaction volume.
3.  **Enterprise:** Custom setup for high-volume aggregators.

---

### 14. Future Expansion
*   **AI Smart Routing:** Automatically pick the cheapest supplier in real-time.
*   **Crypto Payments:** Native support for USDT/BTC balance top-ups.
*   **Mobile App Wrapper:** One-click APK generation for Agencies.

---

### 15. Supplier Integration and Management Specification (SaaS Core Architecture)

The Supplier Integration engine is designed as a modular **Supplier Connection Bus** to abstract different vendor APIs into a standardized internal schema. This orchestration layer manages how NexusCore registers new API suppliers, performs credential health audits, synchronizes product databases, routes orders, and handles errors or latency spikes without impacting tenant operations.

#### 15.1 Integration & Onboarding Lifecycle
NexusCore employs a strict, sandboxed onboarding pipeline for new digital fulfillment suppliers:
1. **Sandbox Registration:** Admin registers the supplier adapter in the console, providing a sandbox URL, API credentials, and required custom header structures.
2. **Network Handshake & Whitelisting:** The platform assigns clean microservice egress static IPs to the supplier configuration, enabling the supplier to configure firewalls or IP whitelisting rules.
3. **Health & Connection Handshake Validation:** The system runs a programmatic API check verifying active balance queries, endpoint latencies, and capability support checklists (e.g., balance query, product pricing list query, order placement, order status query).
4. **Draft Catalog Synchronization Test:** The catalog service requests a catalog feed, normalization parses the payload against the adapter, and verifies category tagging accuracy.
5. **Simulated Fulfillment Test:** Programmatic orders are submitted to sandbox endpoints to examine callback/webhook response handling and serial number decoding.
6. **Promotion to Active Cluster Routing:** Once validation steps are successful, the supplier adapter is flagged as `ACTIVE` and becomes available inside the real-time dynamic routing pool.

```
+------------+     +-------------------+     +------------------+     +--------------------+     +-------------+
| 1. Adapter | --> |  2. IP Egress     | --> | 3. Programmatic  | --> | 4. Sandbox Dry-run | --> |  5. Active  |
| Registered |     | Whitelist Handshake|     | Health Verification|     | Fulfillment Test   |     | Product Pool|
+------------+     +-------------------+     +------------------+     +--------------------+     +-------------+
```

#### 15.2 Strategic Service Level Agreements (SLA) & Dynamic Monitoring
To ensure overall platform reliability, suppliers must meet specified thresholds. The system monitors endpoints continuously against these standards:
* **Service Latency Floor:** Response latency must remain under 1200ms for pricing audits, and under 5000ms for critical transaction fulfillment queries.
* **Uptime Standard:** Supplier nodes must maintain a minimum of 98.5% uptime calculated on a 24H sliding window.
* **Failure Ratio Ceilings:** If any single supplier endpoint encounters successive failures exceeding 10% inside a 5-minute interval, the API gateway restricts outbound routing and switches to hot failover channels.

---

#### 15.3 Authentication Protocols Matrix
The Gateway Adapter Registry supports standard authentication primitives natively:
* **HTTP Bearer / Static Token API Keys:** Standard authorization header injection (`Authorization: Bearer <API_KEY>`) or custom-scoped vendor header values (e.g., `X-API-KEY: <SECRET>`).
* **Basic Auth with Base64 Encoding:** Standard HTTP Basic authorization headers.
* **Signed HMAC Signatures:** For high-security suppliers, payloads are hashed and signed with standard SHA-256 keys, combining dynamic timestamps, client secret keys, and payload hashes.
  * *Calculation Formula:* $\text{HMAC-SHA256}(\text{Secret_Key}, \text{ClientID} + \text{Timestamp} + \text{EndpointPath} + \text{RequestBody})$
* **Dynamic OAuth 2.0 Credentials Cache:** For high-volume enterprise platforms, the connection bus authenticates with client credential flows dynamically, caches tokens locally in Redis under encrypted values, and refreshes the token before the expiration window expires.

---

#### 15.4 Product Catalog Synchronization Architecture
NexusCore avoids long-duration database locking by implementing **Differential Catalog Normalization Pools**:
* **The Unified Catalog Schema:** Incoming provider price feeds represent varied names and nested JSON items. The connection bus decodes raw formats into a simplified, flattened JSON schema:
  ```json
  {
    "supplier_sku": "FF-1000D",
    "normalized_product_name": "Free Fire 1000 Diamonds",
    "raw_cost_units": 102500,
    "currency": "IDR",
    "usd_equivalent": 6.84,
    "is_available": true
  }
  ```
* **Differential Sync Rules & Scheduler Patterns:** 
  * **Volatile SKU Price Audit (Real-time caching):** Raw supplier costs are audited up to once per minute via cron workers. Changes inside the supplier system update the Redis cached pricing grid instantly, triggering dynamic downstream updates to tenant margins without postgres locks.
  * **Static Metadata Sync (Daily cron):** SKU metadata fields (game icons, titles, localized text translations) sync during low-traffic windows (e.g., UTC 03:00) using bulk-upsert database pipelines.

---

#### 15.5 Failures & Circuit Breaker Logic
Standard error fallback loops are detailed below to handle API timeouts and network disruptions:

| Trigger Severity | Failure Trigger Condition | Immediate Programmatic Response Workflow |
| :--- | :--- | :--- |
| **Transient Retries** | API responds with `429 Too Many Requests` or connection resets under 3000ms. | Execute up to 3 retry attempts using **Exponential Backoff with Jitter** (Backoff initial: 200ms, Multiplier: 1.5, Jitter: $\pm50\text{ms}$). |
| **Timeout Caps**| Supplier fails to respond to transaction requests within a strict **25,000ms** ceiling. | The transaction is instantly marked as `STUCK_IN_QUEUE`, and the gateway triggers a parallel status-check query rather than keeping the customer session locked. |
| **Gateways Breaker** | A single supplier node accounts for $>10\%$ API failures inside a rolling 5-minute sliding window. | The **Circuit Breaker** status changes from `CLOSED` to `OPEN`. Outbound orders redirect automatically to alternate predefined supplier adapters based on cost rankings. |
| **System Outage**| Primary supplier fails to process orders, and no alternate supplier carries the requested SKU. | Order is marked as `PENDING_MANUAL_REFUND`, local ledger returns credit values automatically into the reseller's wallet, and a high-priority system telemetry alarm is routed to the on-call engineer. |

---

### 16. White Label Website Builder Specification

The White Label Website Builder enables Agencies to launch fully functional, branded coin reseller storefronts instantly without developer intervention. The system generates SSR-optimized (Server-Side Rendered) or static frontend instances uniquely associated with the Agency's tenant ID, providing extensive visual and structural customization.

#### 16.1 Theming & Visual Customization Engine
The application injects custom styling variables into the globally served CSS and UI components.
*   **Template Selection:** Agencies can select from a curated library of pre-built, conversion-optimized storefront templates (e.g., "Gamer Dark Mode", "Minimalist SaaS", "Esports Neon"). Switching templates cascades seamlessly without losing underlying data.
*   **Logo & Branding Assets:** Upload fields for a Primary Logo, Dark-Mode Logo, and Favicon. Assets are optimized, resized, and stored in an edge CDN bucket.
*   **Dynamic Color Scheme Editor:** Real-time visual color picker allowing Agencies to define primary, secondary, accent, and background hexadecimal codes. These compile into CSS variables (e.g., `--color-primary`, `--color-background`) rendering across buttons, navigation boundaries, and hover states.
*   **Typography Overrides:** Selection of premium web-safe and Google Fonts to style headings and body text dynamically.

#### 16.2 Headless Content Management System (CMS)
A localized headless CMS enables Agencies to construct static content pages without code adjustments.
*   **Page Architect:** Agencies can enable/disable default pages or create new rich-text pages.
*   **About Us Editor:** WYSIWYG rich text editor with markdown injection capabilities to embed company mission, operational history, and embedded team imagery.
*   **Contact Information & Form Routing:** Admin portal module defining customer support operating hours, WhatsApp live-chat overlay phone numbers, email anchors, and custom fields for the support intake form.
*   **Dynamic Policies:** Templated configurations for standard Terms of Service (ToS), Privacy Policies, and Refund guidelines with automated platform replacement variables (e.g., `{AgencyName}`).
*   **Custom Banners & Sliders:** Dedicated component builder to insert promo banners, rotating carousel images, and discount announcements directly onto the public landing page.

#### 16.3 Domain & Subdomain Resolution (Tenant Identification)
NexusCore utilizes edge-level reverse proxies (e.g., Nginx or Cloudflare Workers) to dynamically route traffic from vanity URLs directly to isolated tenant configurations.
*   **Instant Subdomain Provisioning:** Every Agency receives an immediate staging URL out-of-the-box (e.g., `agencyname.nexuscore.app`).
*   **Custom Vanity Domain Mapping:** Agencies point their primary domain's CNAME or A-records directly to the NexusCore edge infrastructure (e.g., `shop.myagency.com` $\rightarrow$ `cname.nexuscore.app`).
*   **Automated SSL/TLS Certificates:** The platform automatically issues and auto-renews Let's Encrypt Wildcard SSL certificates for all bound custom domains without agency intervention.
*   **Tenant Resolution Middleware:** Incoming HTTP requests are intercepted by a global middleware that parses the `Host` header, looks up the corresponding `tenantId` in the database or Redis cache, and hydrates the application context purely with that Agency's specific products, prices, and branding.

#### 16.4 SEO & Analytics Integrations
*   **Global Meta Tagging:** Interface to inject custom page `<title>` formats, Open Graph meta descriptions, and default thumbnail preview images for social sharing.
*   **Tracking Pixels & Analytics Pipelines:** Zero-code text areas allowing Agencies to paste Google Analytics (GA4) measurement IDs, Meta/Facebook Tracking Pixels, or custom script tags (e.g., Intercom, Crisp Chat) which are automatically rendered in the `<head>` of their storefront.
