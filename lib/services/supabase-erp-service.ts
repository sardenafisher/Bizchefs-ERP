import { getSupabaseClient } from '../supabase/client';
import {
  Tenant,
  Account,
  JournalEntry,
  JournalLine,
  Customer,
  SalesInvoice,
  SalesLineItem,
  PaymentReceipt,
  Warehouse,
  Item,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Project,
  ProjectTask,
  Timesheet,
  AuditLog,
  DocumentSequence,
  Quotation,
  SalesOrder
} from '../types/erp';
import { roundCurrency, validateJournalEntryBalance } from '../erp/accounting-rules';
import { formatDocumentNumber } from '../erp/numbering-rules';

export class SupabaseERPService {
  private get client() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }
    return supabase;
  }

  // ==================== TENANTS & MEMBERSHIPS ====================
  async getUserTenants(): Promise<Tenant[]> {
    const { data: userMemberships, error: memError } = await this.client
      .from('tenant_users')
      .select('tenant_id, role, tenants (*)')
      .eq('is_active', true);

    if (memError) throw memError;
    if (!userMemberships) return [];

    return userMemberships
      .map((m: any) => {
        const t = m.tenants;
        if (!t) return null;
        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          industry: t.industry || 'General',
          settings: {
            baseCurrency: t.base_currency || 'USD',
            dateFormat: 'YYYY-MM-DD',
            timezone: t.timezone || 'UTC',
            fiscalYearStartMonth: t.fiscal_year_start_month || 1,
            taxNumber: t.tax_number,
            address: t.address,
            city: t.city,
            country: t.country,
            phone: t.phone,
            email: t.email,
            website: t.website,
            logoUrl: t.logo_url
          },
          subscription: {
            plan: (t.subscription_plan as any) || 'growth',
            status: (t.subscription_status as any) || 'active',
            validUntil: t.subscription_valid_until || new Date(Date.now() + 365 * 86400000).toISOString(),
            maxUsers: 25,
            maxInvoicesPerMonth: 2000
          },
          createdAt: t.created_at
        };
      })
      .filter(Boolean) as Tenant[];
  }

  async createTenantOnboarding(
    name: string,
    slug: string,
    currency: string = 'USD',
    timezone: string = 'UTC',
    taxNumber?: string,
    industry: string = 'Services'
  ): Promise<string> {
    const { data: tenantId, error } = await this.client.rpc('create_tenant_onboarding', {
      p_name: name,
      p_slug: slug,
      p_currency: currency,
      p_timezone: timezone,
      p_tax_number: taxNumber || null,
      p_industry: industry
    });

    if (error) throw error;
    return tenantId;
  }

  // ==================== DOCUMENT SEQUENCES ====================
  async getNextDocumentNumber(tenantId: string, docType: string): Promise<string> {
    const { data, error } = await this.client.rpc('get_next_document_number', {
      p_tenant_id: tenantId,
      p_doc_type: docType
    });
    if (error) {
      throw new Error(`Document sequence error (${docType}): ${error.message}`);
    }
    return data;
  }

  // ==================== ACCOUNTING ====================
  async getAccounts(tenantId: string): Promise<Account[]> {
    const { data, error } = await this.client
      .from('accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: true });

    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      tenantId: a.tenant_id,
      code: a.code,
      name: a.name,
      type: a.type,
      parentCode: a.parent_code,
      currency: a.currency || 'USD',
      balance: Number(a.balance) || 0,
      isHeader: Boolean(a.is_header)
    }));
  }

  async getJournalEntries(tenantId: string): Promise<JournalEntry[]> {
    const { data, error } = await this.client
      .from('journal_entries')
      .select('*, journal_lines (*)')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((j: any) => ({
      id: j.id,
      tenantId: j.tenant_id,
      entryNumber: j.entry_number,
      date: j.date,
      reference: j.reference,
      memo: j.memo,
      totalDebit: Number(j.total_debit) || 0,
      totalCredit: Number(j.total_credit) || 0,
      status: j.status,
      createdAt: j.created_at,
      postedAt: j.posted_at,
      lines: (j.journal_lines || []).map((l: any) => ({
        id: l.id,
        accountId: l.account_id,
        accountCode: l.account_code,
        accountName: l.account_name,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo
      }))
    }));
  }

  async postJournalEntry(
    tenantId: string,
    entry: {
      entryNumber?: string;
      date: string;
      reference?: string;
      memo: string;
      lines: {
        accountId: string;
        accountCode: string;
        accountName: string;
        debit: number;
        credit: number;
        memo?: string;
      }[];
    }
  ): Promise<string> {
    const validation = validateJournalEntryBalance(entry.lines);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Out of balance journal entry.');
    }

    const docNumber = entry.entryNumber || await this.getNextDocumentNumber(tenantId, 'journal_entry');

    const { data, error } = await this.client.rpc('post_journal_entry', {
      p_tenant_id: tenantId,
      p_entry_number: docNumber,
      p_date: entry.date,
      p_reference: entry.reference || '',
      p_memo: entry.memo,
      p_lines: entry.lines.map(l => ({
        account_id: l.accountId,
        account_code: l.accountCode,
        account_name: l.accountName,
        debit: l.debit,
        credit: l.credit,
        memo: l.memo || ''
      }))
    });

    if (error) {
      throw new Error(`Financial journal posting failed: ${error.message}`);
    }

    return data;
  }

  // ==================== CUSTOMERS & SALES ====================
  async getCustomers(tenantId: string): Promise<Customer[]> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      tenantId: c.tenant_id,
      code: c.code,
      name: c.name,
      contactPerson: c.contact_person,
      email: c.email,
      phone: c.phone,
      address: c.address,
      taxNumber: c.tax_number,
      creditLimit: Number(c.credit_limit) || 0,
      paymentTermsDays: c.payment_terms_days || 30,
      outstandingBalance: Number(c.outstanding_balance) || 0,
      createdAt: c.created_at
    }));
  }

  async createCustomer(tenantId: string, cust: Omit<Customer, 'id' | 'tenantId' | 'outstandingBalance' | 'createdAt'>): Promise<Customer> {
    const { data, error } = await this.client
      .from('customers')
      .insert({
        tenant_id: tenantId,
        code: cust.code,
        name: cust.name,
        contact_person: cust.contactPerson,
        email: cust.email,
        phone: cust.phone,
        address: cust.address,
        tax_number: cust.taxNumber,
        credit_limit: cust.creditLimit,
        payment_terms_days: cust.paymentTermsDays,
        outstanding_balance: 0.00
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      creditLimit: Number(data.credit_limit),
      paymentTermsDays: data.payment_terms_days,
      outstandingBalance: 0,
      createdAt: data.created_at
    };
  }

  async getSalesInvoices(tenantId: string): Promise<SalesInvoice[]> {
    const { data, error } = await this.client
      .from('sales_invoices')
      .select('*, sales_invoice_lines (*)')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((inv: any) => ({
      id: inv.id,
      tenantId: inv.tenant_id,
      invoiceNumber: inv.invoice_number,
      orderId: inv.order_id,
      customerId: inv.customer_id,
      customerName: inv.customer_name,
      date: inv.date,
      dueDate: inv.due_date,
      subtotal: Number(inv.subtotal) || 0,
      taxTotal: Number(inv.tax_total) || 0,
      grandTotal: Number(inv.grand_total) || 0,
      amountPaid: Number(inv.amount_paid) || 0,
      balanceDue: Number(inv.balance_due) || 0,
      status: inv.status,
      notes: inv.notes,
      createdAt: inv.created_at,
      items: (inv.sales_invoice_lines || []).map((l: any) => ({
        id: l.id,
        itemId: l.item_id,
        itemSku: l.item_sku,
        itemName: l.item_name,
        uom: l.uom || 'pcs',
        quantity: Number(l.quantity),
        unitPrice: Number(l.unit_price),
        taxRate: Number(l.tax_rate),
        taxAmount: Number(l.tax_amount),
        lineTotal: Number(l.line_total)
      }))
    }));
  }

  async createSalesInvoice(
    tenantId: string,
    invoiceData: Omit<SalesInvoice, 'id' | 'tenantId' | 'invoiceNumber' | 'createdAt' | 'amountPaid' | 'balanceDue' | 'status'>
  ): Promise<SalesInvoice> {
    const docNumber = await this.getNextDocumentNumber(tenantId, 'sales_invoice');

    const { data: inv, error: invError } = await this.client
      .from('sales_invoices')
      .insert({
        tenant_id: tenantId,
        invoice_number: docNumber,
        customer_id: invoiceData.customerId,
        customer_name: invoiceData.customerName,
        date: invoiceData.date,
        due_date: invoiceData.dueDate,
        subtotal: invoiceData.subtotal,
        tax_total: invoiceData.taxTotal,
        grand_total: invoiceData.grandTotal,
        amount_paid: 0.00,
        balance_due: invoiceData.grandTotal,
        status: 'posted',
        notes: invoiceData.notes
      })
      .select()
      .single();

    if (invError) throw invError;

    // Insert line items
    if (invoiceData.items.length > 0) {
      const lines = invoiceData.items.map(l => ({
        tenant_id: tenantId,
        invoice_id: inv.id,
        item_id: l.itemId || null,
        item_sku: l.itemSku,
        item_name: l.itemName,
        uom: l.uom,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        tax_rate: l.taxRate,
        tax_amount: l.taxAmount,
        line_total: l.lineTotal
      }));
      await this.client.from('sales_invoice_lines').insert(lines);
    }

    // Update customer outstanding balance
    const { data: cust } = await this.client
      .from('customers')
      .select('id, outstanding_balance')
      .eq('id', invoiceData.customerId)
      .single();

    if (cust) {
      await this.client
        .from('customers')
        .update({
          outstanding_balance: roundCurrency(Number(cust.outstanding_balance) + invoiceData.grandTotal)
        })
        .eq('id', cust.id);
    }

    // Automatically post balanced journal entry
    const accounts = await this.getAccounts(tenantId);
    const arAcc = accounts.find(a => a.code === '1200') || accounts.find(a => a.type === 'asset');
    const revAcc = accounts.find(a => a.code === '4010') || accounts.find(a => a.type === 'income');
    const taxAcc = accounts.find(a => a.code === '2100') || accounts.find(a => a.type === 'liability');

    if (arAcc && revAcc) {
      const jvLines = [
        {
          accountId: arAcc.id,
          accountCode: arAcc.code,
          accountName: arAcc.name,
          debit: invoiceData.grandTotal,
          credit: 0,
          memo: `Receivable from ${invoiceData.customerName}`
        },
        {
          accountId: revAcc.id,
          accountCode: revAcc.code,
          accountName: revAcc.name,
          debit: 0,
          credit: invoiceData.subtotal,
          memo: `Sales revenue on ${docNumber}`
        }
      ];

      if (invoiceData.taxTotal > 0 && taxAcc) {
        jvLines.push({
          accountId: taxAcc.id,
          accountCode: taxAcc.code,
          accountName: taxAcc.name,
          debit: 0,
          credit: invoiceData.taxTotal,
          memo: `Output VAT on ${docNumber}`
        });
      }

      await this.postJournalEntry(tenantId, {
        date: invoiceData.date,
        reference: docNumber,
        memo: `Auto-posting for Sales Invoice ${docNumber}`,
        lines: jvLines
      });
    }

    return {
      ...invoiceData,
      id: inv.id,
      tenantId,
      invoiceNumber: docNumber,
      amountPaid: 0,
      balanceDue: invoiceData.grandTotal,
      status: 'posted',
      createdAt: inv.created_at
    };
  }

  async recordInvoicePayment(
    tenantId: string,
    invoiceId: string,
    amount: number,
    paymentMethod: PaymentReceipt['paymentMethod'],
    reference?: string
  ): Promise<PaymentReceipt> {
    const { data: inv, error: invFetchError } = await this.client
      .from('sales_invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('tenant_id', tenantId)
      .single();

    if (invFetchError || !inv) throw new Error('Invoice not found');

    const paymentNumber = await this.getNextDocumentNumber(tenantId, 'payment');
    const actualAmount = Math.min(amount, Number(inv.balance_due));
    const newAmountPaid = roundCurrency(Number(inv.amount_paid) + actualAmount);
    const newBalanceDue = roundCurrency(Math.max(0, Number(inv.grand_total) - newAmountPaid));
    const newStatus = newBalanceDue === 0 ? 'paid' : 'partially_paid';

    // Update Invoice
    await this.client
      .from('sales_invoices')
      .update({
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus
      })
      .eq('id', invoiceId);

    // Update Customer
    const { data: cust } = await this.client
      .from('customers')
      .select('id, outstanding_balance')
      .eq('id', inv.customer_id)
      .single();

    if (cust) {
      await this.client
        .from('customers')
        .update({
          outstanding_balance: roundCurrency(Math.max(0, Number(cust.outstanding_balance) - actualAmount))
        })
        .eq('id', cust.id);
    }

    // Insert Payment Receipt
    const paymentDate = new Date().toISOString().split('T')[0];
    const { data: pay, error: payError } = await this.client
      .from('payments')
      .insert({
        tenant_id: tenantId,
        payment_number: paymentNumber,
        date: paymentDate,
        type: 'incoming',
        customer_id: inv.customer_id,
        customer_name: inv.customer_name,
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        amount: actualAmount,
        payment_method: paymentMethod,
        reference: reference || null,
        memo: `Receipt for ${inv.invoice_number}`
      })
      .select()
      .single();

    if (payError) throw payError;

    // Post to Cash Ledger (Debit Operating Bank 1010, Credit AR 1200)
    const accounts = await this.getAccounts(tenantId);
    const bankAcc = accounts.find(a => a.code === '1010');
    const arAcc = accounts.find(a => a.code === '1200');

    if (bankAcc && arAcc) {
      await this.postJournalEntry(tenantId, {
        date: paymentDate,
        reference: paymentNumber,
        memo: `Payment collection for ${inv.invoice_number} (${paymentMethod})`,
        lines: [
          {
            accountId: bankAcc.id,
            accountCode: bankAcc.code,
            accountName: bankAcc.name,
            debit: actualAmount,
            credit: 0,
            memo: 'Bank cash receipt'
          },
          {
            accountId: arAcc.id,
            accountCode: arAcc.code,
            accountName: arAcc.name,
            debit: 0,
            credit: actualAmount,
            memo: `Clear AR for ${inv.customer_name}`
          }
        ]
      });
    }

    return {
      id: pay.id,
      tenantId,
      paymentNumber,
      date: paymentDate,
      customerId: inv.customer_id,
      customerName: inv.customer_name,
      type: 'incoming',
      invoiceId: inv.id,
      invoiceNumber: inv.invoice_number,
      amount: actualAmount,
      paymentMethod,
      reference,
      createdAt: pay.created_at
    };
  }

  // ==================== INVENTORY & WAREHOUSES ====================
  async getWarehouses(tenantId: string): Promise<Warehouse[]> {
    const { data, error } = await this.client
      .from('warehouses')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return (data || []).map((w: any) => ({
      id: w.id,
      tenantId: w.tenant_id,
      code: w.code,
      name: w.name,
      location: w.location,
      isDefault: Boolean(w.is_default)
    }));
  }

  async getItems(tenantId: string): Promise<Item[]> {
    const { data, error } = await this.client
      .from('items')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sku');

    if (error) throw error;
    return (data || []).map((i: any) => ({
      id: i.id,
      tenantId: i.tenant_id,
      sku: i.sku,
      name: i.name,
      category: i.category || 'General',
      uom: i.uom || 'pcs',
      unitPrice: Number(i.unit_price) || 0,
      costPrice: Number(i.cost_price) || 0,
      taxRate: Number(i.tax_rate) || 0,
      reorderPoint: Number(i.reorder_point) || 0,
      barcode: i.barcode,
      description: i.description
    }));
  }

  async createItem(tenantId: string, item: Omit<Item, 'id' | 'tenantId'>): Promise<Item> {
    const { data, error } = await this.client
      .from('items')
      .insert({
        tenant_id: tenantId,
        sku: item.sku,
        name: item.name,
        category: item.category,
        uom: item.uom,
        unit_price: item.unitPrice,
        cost_price: item.costPrice,
        tax_rate: item.taxRate,
        reorder_point: item.reorderPoint,
        barcode: item.barcode,
        description: item.description
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...item,
      id: data.id,
      tenantId: data.tenant_id
    };
  }

  async getStockMovements(tenantId: string): Promise<StockMovement[]> {
    const { data, error } = await this.client
      .from('stock_movements')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      tenantId: m.tenant_id,
      date: m.date,
      itemId: m.item_id,
      itemSku: m.item_sku,
      itemName: m.item_name,
      warehouseId: m.warehouse_id,
      warehouseName: m.warehouse_name,
      toWarehouseId: m.to_warehouse_id,
      toWarehouseName: m.to_warehouse_name,
      movementType: m.movement_type,
      quantity: Number(m.quantity),
      unitCost: Number(m.unit_cost) || 0,
      totalValue: Number(m.total_value) || 0,
      referenceType: m.reference_type,
      referenceId: m.reference_id,
      notes: m.notes,
      createdAt: m.created_at
    }));
  }

  // ==================== PURCHASING & SUPPLIERS ====================
  async getSuppliers(tenantId: string): Promise<Supplier[]> {
    const { data, error } = await this.client
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      tenantId: s.tenant_id,
      code: s.code,
      name: s.name,
      contactPerson: s.contact_person,
      email: s.email,
      phone: s.phone,
      address: s.address,
      taxNumber: s.tax_number,
      paymentTermsDays: s.payment_terms_days || 30,
      outstandingBalance: Number(s.outstanding_balance) || 0,
      createdAt: s.created_at
    }));
  }

  async createSupplier(tenantId: string, sup: Omit<Supplier, 'id' | 'tenantId' | 'outstandingBalance' | 'createdAt'>): Promise<Supplier> {
    const { data, error } = await this.client
      .from('suppliers')
      .insert({
        tenant_id: tenantId,
        code: sup.code,
        name: sup.name,
        contact_person: sup.contactPerson,
        email: sup.email,
        phone: sup.phone,
        address: sup.address,
        tax_number: sup.taxNumber,
        payment_terms_days: sup.paymentTermsDays,
        outstanding_balance: 0.00
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      tenantId: data.tenant_id,
      code: data.code,
      name: data.name,
      contactPerson: data.contact_person,
      email: data.email,
      phone: data.phone,
      paymentTermsDays: data.payment_terms_days,
      outstandingBalance: 0,
      createdAt: data.created_at
    };
  }

  async getPurchaseOrders(tenantId: string): Promise<PurchaseOrder[]> {
    const { data, error } = await this.client
      .from('purchase_orders')
      .select('*, purchase_order_lines (*)')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      tenantId: p.tenant_id,
      orderNumber: p.order_number,
      supplierId: p.supplier_id,
      supplierName: p.supplier_name,
      date: p.date,
      expectedDate: p.expected_date,
      warehouseId: p.warehouse_id,
      warehouseName: p.warehouse_name,
      subtotal: Number(p.subtotal) || 0,
      taxTotal: Number(p.tax_total) || 0,
      grandTotal: Number(p.grand_total) || 0,
      status: p.status,
      createdAt: p.created_at,
      items: (p.purchase_order_lines || []).map((l: any) => ({
        id: l.id,
        itemId: l.item_id,
        itemSku: l.item_sku,
        itemName: l.item_name,
        uom: l.uom || 'pcs',
        quantity: Number(l.quantity),
        unitPrice: Number(l.unit_price),
        taxRate: Number(l.tax_rate),
        taxAmount: Number(l.tax_amount),
        lineTotal: Number(l.line_total)
      }))
    }));
  }

  // ==================== HR & PERSONNEL ====================
  async getEmployees(tenantId: string): Promise<Employee[]> {
    const { data, error } = await this.client
      .from('employees')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('full_name');

    if (error) throw error;
    return (data || []).map((e: any) => ({
      id: e.id,
      tenantId: e.tenant_id,
      employeeCode: e.employee_code,
      fullName: e.full_name,
      email: e.email,
      phone: e.phone,
      department: e.department,
      position: e.position,
      joiningDate: e.joining_date,
      salary: Number(e.salary) || 0,
      status: e.status
    }));
  }

  async getAttendance(tenantId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await this.client
      .from('attendance')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      tenantId: a.tenant_id,
      employeeId: a.employee_id,
      employeeName: a.employee_name,
      date: a.date,
      status: a.status,
      checkIn: a.check_in,
      checkOut: a.check_out
    }));
  }

  async getLeaveRequests(tenantId: string): Promise<LeaveRequest[]> {
    const { data, error } = await this.client
      .from('leave_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      tenantId: l.tenant_id,
      employeeId: l.employee_id,
      employeeName: l.employee_name,
      leaveType: l.leave_type,
      startDate: l.start_date,
      endDate: l.end_date,
      days: Number(l.days),
      reason: l.reason,
      status: l.status,
      appliedAt: l.applied_at
    }));
  }

  // ==================== PROJECTS ====================
  async getProjects(tenantId: string): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      tenantId: p.tenant_id,
      code: p.code,
      name: p.name,
      customerId: p.customer_id,
      customerName: p.customer_name,
      status: p.status,
      startDate: p.start_date,
      deadline: p.deadline,
      budget: Number(p.budget) || 0,
      actualCost: Number(p.actual_cost) || 0
    }));
  }

  async getTasks(tenantId: string): Promise<ProjectTask[]> {
    const { data, error } = await this.client
      .from('project_tasks')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      tenantId: t.tenant_id,
      projectId: t.project_id,
      title: t.title,
      assignedTo: t.assigned_to,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date
    }));
  }

  async getTimesheets(tenantId: string): Promise<Timesheet[]> {
    const { data, error } = await this.client
      .from('timesheets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((ts: any) => ({
      id: ts.id,
      tenantId: ts.tenant_id,
      projectId: ts.project_id,
      projectName: ts.project_name,
      employeeName: ts.employee_name,
      date: ts.date,
      hours: Number(ts.hours),
      activity: ts.activity,
      billable: Boolean(ts.billable),
      ratePerHour: Number(ts.rate_per_hour) || 0
    }));
  }

  // ==================== AUDIT LOGS ====================
  async getAuditLogs(tenantId: string): Promise<AuditLog[]> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      tenantId: l.tenant_id,
      userId: l.user_id,
      userEmail: l.user_email,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      details: l.details,
      createdAt: l.created_at
    }));
  }
}

export const supabaseERP = new SupabaseERPService();
