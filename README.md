# PODHUNALAM (பொதுநலம்) — Public Grievance Management and District Accountability Platform

> **“One District. One Platform. Every Problem Accounted For.”**  
> *“ஒரு மாவட்டம். ஒரே தளம். ஒவ்வொரு பிரச்சனைக்கும் பொறுப்புக்கூறல்.”*

PODHUNALAM is a full-stack, bilingual (Tamil & English) civic technology platform built for district administrative accountability in Tiruchirappalli District & City Corporation. It connects citizens directly with taluk, divisional, corporation, and district-level officers, enforcing a strict evidence-based resolution and supervisory verification lifecycle.

---

## 1. System Architecture & Grievance Lifecycle

PODHUNALAM implements a verified 8-stage administrative grievance lifecycle:

$$\text{REPORT} \longrightarrow \text{VALIDATE} \longrightarrow \text{ASSIGN} \longrightarrow \text{INVESTIGATE} \longrightarrow \text{COORDINATE} \longrightarrow \text{RESOLVE} \longrightarrow \text{VERIFY} \longrightarrow \text{CLOSE}$$

### Core Invariant
**No grievance is ever marked "Closed" merely because an officer changed its status.**  
A field officer must submit a **Resolution Evidence Dossier** containing:
1. Field action summary
2. Work Order / Government Order (GO) reference number
3. Before & After field photographs
4. Physical site coordinates
5. Formal Supervisory Inspection Review (by RDO, DRO, or District Collector) before the petition is officially closed.

---

## 2. Multi-Role Permissions & Chain of Command

| Tier | Role | Responsibilities | Jurisdiction |
| :--- | :--- | :--- | :--- |
| **1** | **Citizen (பொதுமக்கள்)** | Lodge public complaints, track status, view evidence, submit appeal/reopening request. | Individual petitions |
| **2** | **Camp Operator (முகாம் அலுவலர்)** | Lodge offline petitions received at Jamabandi / Petition Day Camps. | Taluk Camp / Center |
| **3** | **AO / Tahsildar (வட்டார நிர்வாக அலுவலர்)** | Local taluk-level field investigation, engineer mobilization, evidence upload. | Taluk Level |
| **4** | **RDO (வருவாய் கோட்ட அலுவலர்)** | Divisional coordination, interdepartmental review, resolution verification. | Revenue Division |
| **5** | **DRO (மாவட்ட வருவாய் அலுவலர்)** | District-level coordination, monitoring > 7 days pending cases, dispute review. | District Wide |
| **6** | **District Collector (மாவட்ட ஆட்சித் தலைவர்)** | Apex executive monitoring, SLA analytics, escalation interventions, CSV export. | Whole District |
| **7** | **System Admin (கணினி நிர்வாகி)** | Manage departments, target SLAs, officer accounts, and audit log inspection. | System Wide |

---

## 3. Dedicated Supabase Relational Database Setup

The database schema is located in `/supabase/schema.sql`. It defines all 14 required relational tables:

1. `departments` — Civic departments, target resolution SLAs, and lead titles
2. `administrative_units` — Geographic hierarchy (District → Division → Taluk → Locality)
3. `profiles` — User directory linked with Supabase Auth
4. `officer_assignments` — Jurisdiction & department bindings
5. `grievances` — Core petition entity with unique reference `TN-CGL-YYYY-XXXX`
6. `grievance_assignments` — Assignment history
7. `grievance_status_history` — Immutable audit trail of state transitions
8. `grievance_comments` — Separated internal officer notes from citizen-visible updates
9. `grievance_departments` — Multi-department joint accountability tasks
10. `resolution_evidence` — Before/After photos and completion vouchers
11. `verification_records` — Supervisory approval/rejection orders
12. `escalation_records` — AO → RDO → DRO → Collector escalation trail
13. `notifications` — In-app updates & SMS/Email delivery logs
14. `audit_logs` — Tamper-evident system activity log

### How to Run Migrations in Supabase:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy the contents of `/supabase/schema.sql` (or click **Copy SQL Schema** in the app's Database modal).
4. Run the script. Row Level Security (RLS) policies and indexes will be applied automatically.

---

## 4. Environment Variables

Create or update your `.env` file based on `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

> Note: The app automatically detects if Supabase credentials are configured. In addition, you can input or test your Supabase credentials directly through the interactive **Supabase Connection Modal** in the top navigation bar. When unconfigured, the app runs in an offline-resilient local sandbox mode with reactive local persistence.

---

## 5. Development & Testing Workflow

```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Run TypeScript type check and build
npm run build
```

### Demonstration & Testing Mode
The top bar features an **Active Role Selector Strip** allowing instant switching between all 7 roles:
- **Citizen** (`S. Meenakshi`)
- **Camp Operator** (`M. Arumugam`)
- **AO / Tahsildar** (`K. Saravanan, Trichy West`)
- **RDO Division** (`Dr. M. Anandhan, Trichy Division`)
- **DRO District** (`Tmt. R. Rajalakshmi`)
- **Collector (IAS)** (`Thiru Pratik Tayal, IAS, District Collector`)
- **System Admin** (`Platform Admin / DIO`)

---

## 6. GitHub Pages Deployment & Workflow Setup

The repository is configured for automated deployment to **GitHub Pages** via GitHub Actions:
- **Repository URL**: `https://github.com/kavincoding18/PODHUNALAM`
- **Live GitHub Pages URL**: `https://kavincoding18.github.io/PODHUNALAM/`
- **Vite Base Path**: Configured as `/PODHUNALAM/` in `vite.config.ts`.
- **Workflow File**: `.github/workflows/deploy.yml`

### Step-by-Step GitHub Pages Setup
1. Push your changes to the `main` branch of `https://github.com/kavincoding18/PODHUNALAM`.
2. Open your repository on GitHub: `https://github.com/kavincoding18/PODHUNALAM`.
3. Navigate to **Settings** → **Pages** (in the left sidebar).
4. Under **Build and deployment** → **Source**, select **GitHub Actions**.
5. Once selected, pushing any commit or manually triggering the workflow (**Actions** tab → **Deploy to GitHub Pages** → **Run workflow**) will install dependencies, build the application, and publish the `dist` bundle.

---

## 7. Verification and Security Controls

- **Bilingual Interface**: Seamless 1-click toggle between தமிழ் and English with authentic translations for every label, status, and department.
- **Zero-Pill Typography**: Strict compliance with design rules using unboxed text and typographic separators (`·`).
- **Interactive GIS Map**: Leaflet map centered at Tiruchirappalli City Corporation displaying geo-tagged complaints.
- **Collector Analytics**: Real-time KPI cards, department workload distribution, and 1-click CSV report export.
- **Independent Prototype Status**: Clearly labeled as a demonstration prototype for district administration review.
