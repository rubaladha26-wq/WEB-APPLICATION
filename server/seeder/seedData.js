const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const { generateQRCode } = require('../services/qrService');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old collections...');
    await User.deleteMany();
    await Customer.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Invoice.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await Setting.deleteMany();

    console.log('[Seeder] Creating Default Company Settings...');
    const settings = await Setting.create({
      companyName: 'Nexus Global Billing & Solutions Inc.',
      companyEmail: 'finance@nexusbilling.com',
      companyPhone: '+1 (415) 890-1234',
      companyWebsite: 'https://nexusbilling.example.com',
      companyAddress: {
        street: '750 Market Street, Suite 500',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
      },
      taxId: 'US-EIN-948271032',
      defaultCurrency: 'USD',
      currencySymbol: '$',
      defaultTaxRate: 10,
      invoicePrefix: 'INV',
      invoiceFooterNotes: 'Thank you for your business! Please send payment within terms.',
      invoiceTermsAndConditions: 'All invoices are payable within the terms specified on receipt. Overdue invoices accrue a 1.5% monthly late fee.',
      enableQR: true,
      enableOverdueAlerts: true,
    });

    console.log('[Seeder] Creating System Users...');
    const adminUser = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@nexusbill.com',
      password: 'password123',
      role: 'Admin',
      phone: '+1 (555) 100-0001',
      company: {
        name: 'Nexus Global Solutions',
        taxId: 'US-EIN-948271032',
      },
    });

    const accountantUser = await User.create({
      name: 'Marcus Vance (Accountant)',
      email: 'accountant@nexusbill.com',
      password: 'password123',
      role: 'Accountant',
      phone: '+1 (555) 200-0002',
    });

    const staffUser = await User.create({
      name: 'Elena Rostova (Staff)',
      email: 'staff@nexusbill.com',
      password: 'password123',
      role: 'Staff',
      phone: '+1 (555) 300-0003',
    });

    console.log('[Seeder] Creating Categories...');
    const catDev = await Category.create({ name: 'Web Development', description: 'Custom frontend & backend software engineering', createdBy: adminUser._id });
    const catCloud = await Category.create({ name: 'Cloud & DevOps', description: 'AWS, GCP, Docker, and Kubernetes infrastructure', createdBy: adminUser._id });
    const catDesign = await Category.create({ name: 'UI/UX Design', description: 'Wireframing, prototypes, design systems and assets', createdBy: adminUser._id });
    const catSupport = await Category.create({ name: 'Consulting & Maintenance', description: 'SLA support, database optimization, audits', createdBy: adminUser._id });

    console.log('[Seeder] Creating Products & Services...');
    const prod1 = await Product.create({
      name: 'Full-Stack Web Application Architecture',
      sku: 'DEV-FSTACK-01',
      description: 'End-to-end full stack architecture design and implementation',
      category: catDev._id,
      price: 3500.0,
      costPrice: 1500.0,
      taxRate: 10,
      stockQuantity: 100,
      isService: true,
      unit: 'hrs',
      createdBy: adminUser._id,
    });

    const prod2 = await Product.create({
      name: 'Cloud Infrastructure & DevOps Pipeline',
      sku: 'OPS-KUBE-02',
      description: 'Automated CI/CD setup, containerization, and Kubernetes cluster configuration',
      category: catCloud._id,
      price: 2400.0,
      costPrice: 900.0,
      taxRate: 10,
      stockQuantity: 50,
      isService: true,
      unit: 'project',
      createdBy: adminUser._id,
    });

    const prod3 = await Product.create({
      name: 'Enterprise UI/UX Design System',
      sku: 'DES-DSYS-03',
      description: 'Figma component library, responsive design tokens and style guide',
      category: catDesign._id,
      price: 1800.0,
      costPrice: 700.0,
      taxRate: 8,
      stockQuantity: 10,
      isService: true,
      unit: 'project',
      createdBy: adminUser._id,
    });

    const prod4 = await Product.create({
      name: 'Hardware Server Rack 1U Xeon',
      sku: 'HW-SRV-1U',
      description: 'Enterprise rackmount server hardware unit with redundant power supply',
      category: catCloud._id,
      price: 1200.0,
      costPrice: 850.0,
      taxRate: 10,
      stockQuantity: 4,
      lowStockThreshold: 5,
      isService: false,
      unit: 'unit',
      createdBy: adminUser._id,
    });

    const prod5 = await Product.create({
      name: 'Quarterly Maintenance & Security SLA',
      sku: 'SLA-SEC-05',
      description: '24/7 uptime monitoring, security patching, and vulnerability auditing',
      category: catSupport._id,
      price: 950.0,
      costPrice: 300.0,
      taxRate: 10,
      stockQuantity: 200,
      isService: true,
      unit: 'quarter',
      createdBy: adminUser._id,
    });

    console.log('[Seeder] Creating Customers...');
    const cust1 = await Customer.create({
      name: 'TechCorp International',
      email: 'billing@techcorp.io',
      phone: '+1 (415) 555-9012',
      companyName: 'TechCorp Solutions LLC',
      gstNumber: 'GST-US-991283',
      billingAddress: { street: '1200 Silicon Blvd', city: 'San Jose', state: 'CA', postalCode: '95110', country: 'USA' },
      currency: 'USD',
      notes: 'Key enterprise account. Net 30 payment terms.',
      createdBy: adminUser._id,
    });

    const cust2 = await Customer.create({
      name: 'Starlight Media Studios',
      email: 'finance@starlightmedia.com',
      phone: '+1 (310) 444-1234',
      companyName: 'Starlight Media Entertainment Inc.',
      gstNumber: 'VAT-MEDIA-88219',
      billingAddress: { street: '450 Sunset Blvd', city: 'Los Angeles', state: 'CA', postalCode: '90028', country: 'USA' },
      currency: 'USD',
      notes: 'Design & branding partner.',
      createdBy: adminUser._id,
    });

    const cust3 = await Customer.create({
      name: 'Quantum BioLabs',
      email: 'accounts@quantumbio.org',
      phone: '+1 (617) 777-8899',
      companyName: 'Quantum Biotech Research Corp',
      gstNumber: 'TAX-BIO-44102',
      billingAddress: { street: '88 Cambridge Science Park', city: 'Boston', state: 'MA', postalCode: '02142', country: 'USA' },
      currency: 'USD',
      notes: 'Medical analytics cloud infrastructure client.',
      createdBy: adminUser._id,
    });

    console.log('[Seeder] Generating Invoices...');
    const currentYear = new Date().getFullYear();

    // Invoice 1: Fully Paid
    const qr1 = await generateQRCode(JSON.stringify({ invoice: `INV-${currentYear}-0001`, amount: 5390, status: 'Paid' }));
    const inv1 = new Invoice({
      invoiceNumber: `INV-${currentYear}-0001`,
      customer: cust1._id,
      user: adminUser._id,
      issueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'Paid',
      items: [
        {
          product: prod1._id,
          name: prod1.name,
          description: 'Frontend & backend microservices architecture',
          quantity: 1,
          unitPrice: 3500,
          taxRate: 10,
        },
        {
          product: prod3._id,
          name: prod3.name,
          description: 'Design system components in Figma',
          quantity: 1,
          unitPrice: 1800,
          taxRate: 10,
        },
      ],
      discountType: 'percentage',
      discountValue: 5,
      taxType: 'percentage',
      taxRate: 10,
      currency: 'USD',
      notes: 'Thank you for your prompt partnership!',
      qrCodeDataUrl: qr1,
      totalPaid: 5538.5,
    });
    await inv1.save();

    // Record Payment for Invoice 1
    await Payment.create({
      invoice: inv1._id,
      customer: cust1._id,
      amount: inv1.grandTotal,
      paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-WIRE-9823104',
      receiptNumber: `REC-${currentYear}-00001`,
      notes: 'Wire transfer payment received in full.',
      recordedBy: accountantUser._id,
      status: 'Completed',
    });

    // Invoice 2: Partially Paid
    const qr2 = await generateQRCode(JSON.stringify({ invoice: `INV-${currentYear}-0002`, amount: 2640, status: 'Partially Paid' }));
    const inv2 = new Invoice({
      invoiceNumber: `INV-${currentYear}-0002`,
      customer: cust2._id,
      user: adminUser._id,
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Partially Paid',
      items: [
        {
          product: prod2._id,
          name: prod2.name,
          description: 'AWS ECS & Terraform automation',
          quantity: 1,
          unitPrice: 2400,
          taxRate: 10,
        },
      ],
      taxType: 'percentage',
      taxRate: 10,
      currency: 'USD',
      qrCodeDataUrl: qr2,
      totalPaid: 1500,
    });
    await inv2.save();

    await Payment.create({
      invoice: inv2._id,
      customer: cust2._id,
      amount: 1500,
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Credit Card',
      transactionId: 'STRIPE-CH-3391024',
      receiptNumber: `REC-${currentYear}-00002`,
      notes: 'First milestone 50% advance payment.',
      recordedBy: adminUser._id,
      status: 'Completed',
    });

    // Invoice 3: Overdue
    const qr3 = await generateQRCode(JSON.stringify({ invoice: `INV-${currentYear}-0003`, amount: 2145, status: 'Overdue' }));
    const inv3 = new Invoice({
      invoiceNumber: `INV-${currentYear}-0003`,
      customer: cust3._id,
      user: accountantUser._id,
      issueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Overdue',
      items: [
        {
          product: prod4._id,
          name: prod4.name,
          description: '1U Rackmount Server Hardware',
          quantity: 1,
          unitPrice: 1200,
          taxRate: 10,
        },
        {
          product: prod5._id,
          name: prod5.name,
          description: 'Q1 Security Audit & Maintenance',
          quantity: 1,
          unitPrice: 950,
          taxRate: 10,
        },
      ],
      taxType: 'percentage',
      taxRate: 10,
      currency: 'USD',
      qrCodeDataUrl: qr3,
      totalPaid: 0,
    });
    await inv3.save();

    // Invoice 4: Sent / Pending
    const qr4 = await generateQRCode(JSON.stringify({ invoice: `INV-${currentYear}-0004`, amount: 1980, status: 'Sent' }));
    const inv4 = new Invoice({
      invoiceNumber: `INV-${currentYear}-0004`,
      customer: cust1._id,
      user: staffUser._id,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      items: [
        {
          product: prod3._id,
          name: prod3.name,
          description: 'Design revisions and iconography expansion',
          quantity: 1,
          unitPrice: 1800,
          taxRate: 10,
        },
      ],
      taxType: 'percentage',
      taxRate: 10,
      currency: 'USD',
      qrCodeDataUrl: qr4,
      totalPaid: 0,
    });
    await inv4.save();

    // Invoice 5: Draft
    const qr5 = await generateQRCode(JSON.stringify({ invoice: `INV-${currentYear}-0005`, amount: 3850, status: 'Draft' }));
    const inv5 = new Invoice({
      invoiceNumber: `INV-${currentYear}-0005`,
      customer: cust2._id,
      user: adminUser._id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Draft',
      items: [
        {
          product: prod1._id,
          name: prod1.name,
          description: 'Draft phase for upcoming project sprint',
          quantity: 1,
          unitPrice: 3500,
          taxRate: 10,
        },
      ],
      taxType: 'percentage',
      taxRate: 10,
      currency: 'USD',
      qrCodeDataUrl: qr5,
      totalPaid: 0,
    });
    await inv5.save();

    console.log('[Seeder] Updating Customer Balance Aggregates...');
    for (const cust of [cust1, cust2, cust3]) {
      const customerInvoices = await Invoice.find({ customer: cust._id });
      cust.totalBilled = customerInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
      cust.totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
      cust.balance = Math.max(0, cust.totalBilled - cust.totalPaid);
      await cust.save();
    }

    console.log('[Seeder] Creating Notifications...');
    await Notification.create([
      {
        user: null,
        title: 'Overdue Invoice Alert',
        message: `Invoice ${inv3.invoiceNumber} for Quantum BioLabs is overdue. Amount due: $${inv3.balanceDue.toFixed(2)}.`,
        type: 'invoice_overdue',
        referenceId: inv3._id.toString(),
        referenceModel: 'Invoice',
      },
      {
        user: null,
        title: 'Payment Received',
        message: 'Payment of $1,500.00 recorded for Starlight Media Studios via Credit Card.',
        type: 'payment_received',
        referenceId: inv2._id.toString(),
        referenceModel: 'Payment',
      },
      {
        user: null,
        title: 'Low Stock Notification',
        message: `Product "${prod4.name}" is low on stock (${prod4.stockQuantity} remaining).`,
        type: 'low_stock',
        referenceId: prod4._id.toString(),
        referenceModel: 'Product',
      },
      {
        user: adminUser._id,
        title: 'System Initialization Complete',
        message: 'Your production billing workspace has been successfully seeded with realistic sample data.',
        type: 'system',
      },
    ]);

    console.log('[Seeder] ✅ Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Admin:      admin@nexusbill.com       / password123');
    console.log('Accountant: accountant@nexusbill.com  / password123');
    console.log('Staff:      staff@nexusbill.com       / password123');
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] ❌ Error seeding database:', err);
    process.exit(1);
  }
};

seedData();

