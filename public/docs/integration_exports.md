# Quote Kong Submissions Export Instructions

A dedicated export API has been created for downloading homeowner submissions as well as database schema maps from the running application. Once merged with your main application, you can use these endpoints to pull raw user answers into your CRM or data lakes.

## 1. Export Submissions Data (CSV)

**Endpoint:** `GET /api/admin/discovery-config/:companyId/submissions/export`

**Description:** Flattens the stored `PayloadJSON` answers from homeowners into a CSV format. This includes all step-by-step inputs (project type, pain points, timeline, budget, contact details, properties, etc.).

**Implementation note:** The CSV is generated dynamically based on the keys available in the submitted payloads so you will always capture all form steps even if configurations change.

## 2. Export Database Schema (CSV)

**Endpoint:** `GET /api/admin/database-schema/export`

**Description:** Downloads the live MySQL schema representations for the discovery system. Includes tables like `Submissions`, `DiscoveryConfig`, `DiscoveryProjectType`, `DiscoveryPainPoint` etc directly from `information_schema`. 

## 3. Initial Seed Data (SQL)

You can find the structural seed data generated in the root of the project:
* `quote_kong_discovery_tables.csv` -> Schema definitions 
* `quote_kong_discovery_data.sql` -> `INSERT INTO` statements to load initial default values for testing into your main MySQL database.
