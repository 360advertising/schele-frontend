-- CreateIndex
CREATE INDEX "clients_deletedAt_idx" ON "clients"("deletedAt");

-- CreateIndex
CREATE INDEX "clients_code_idx" ON "clients"("code");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "proforma_invoices_clientId_idx" ON "proforma_invoices"("clientId");

-- CreateIndex
CREATE INDEX "proforma_invoices_status_idx" ON "proforma_invoices"("status");

-- CreateIndex
CREATE INDEX "proforma_invoices_deletedAt_idx" ON "proforma_invoices"("deletedAt");

-- CreateIndex
CREATE INDEX "proforma_invoices_issueDate_idx" ON "proforma_invoices"("issueDate");

-- CreateIndex
CREATE INDEX "project_component_pricings_projectId_scaffoldComponentId_idx" ON "project_component_pricings"("projectId", "scaffoldComponentId");

-- CreateIndex
CREATE INDEX "project_component_pricings_deletedAt_idx" ON "project_component_pricings"("deletedAt");

-- CreateIndex
CREATE INDEX "project_component_pricings_validFrom_idx" ON "project_component_pricings"("validFrom");

-- CreateIndex
CREATE INDEX "project_component_pricings_validTo_idx" ON "project_component_pricings"("validTo");

-- CreateIndex
CREATE INDEX "projects_clientId_idx" ON "projects"("clientId");

-- CreateIndex
CREATE INDEX "projects_deletedAt_idx" ON "projects"("deletedAt");

-- CreateIndex
CREATE INDEX "projects_code_idx" ON "projects"("code");

-- CreateIndex
CREATE INDEX "scaffold_components_deletedAt_idx" ON "scaffold_components"("deletedAt");

-- CreateIndex
CREATE INDEX "scaffold_components_code_idx" ON "scaffold_components"("code");

-- CreateIndex
CREATE INDEX "scaffold_components_status_idx" ON "scaffold_components"("status");

-- CreateIndex
CREATE INDEX "scaffold_components_currentProjectId_idx" ON "scaffold_components"("currentProjectId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "work_reports_clientId_idx" ON "work_reports"("clientId");

-- CreateIndex
CREATE INDEX "work_reports_projectId_idx" ON "work_reports"("projectId");

-- CreateIndex
CREATE INDEX "work_reports_status_idx" ON "work_reports"("status");

-- CreateIndex
CREATE INDEX "work_reports_deletedAt_idx" ON "work_reports"("deletedAt");

-- CreateIndex
CREATE INDEX "work_reports_reportDate_idx" ON "work_reports"("reportDate");
