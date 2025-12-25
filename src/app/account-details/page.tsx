"use client";

import React, { useState, useRef } from 'react';
import { getUserByMobile } from '../agentConfigs/chatSupervisor/sampleData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '../components/ui/button';
import { Download } from 'lucide-react';

const AccountDetailsPage = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [accountData, setAccountData] = useState<any>(null);
    const [error, setError] = useState('');
    const accountDetailsRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setAccountData(null);

        try {
            const data = getUserByMobile(mobileNumber);
            setAccountData(data);
        } catch (err: any) {
            setError(err.message || 'User not found');
        }
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );

    const InfoItem = ({ label, value, pdfExport = false }: { label: string; value: any, pdfExport?: boolean }) => (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-base text-gray-900 font-semibold">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
            </span>
        </div>
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const formatCurrency = (currencyObj: { value: number; currency: string } | null | undefined) => {
        if (!currencyObj || currencyObj.value === undefined) return 'N/A';
        // Format as Malaysian Ringgit with thousand separators
        const formattedValue = currencyObj.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `RM ${formattedValue}`;
    };

    const exportToPDF = () => {
        if (!accountData) return;

        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        let startY = 30;
        
        // Add header with logo and title
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text('Account Details', 14, 20);
        
        // Add date and time
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${currentDate} at ${time}`, 14, startY);
        startY += 10;

        // Function to add a section to the PDF
        const addSection = (title: string, data: any[][]) => {
            if (data.length === 0) return;
            
            // Add new page if needed (leaving 50 units at bottom for footer)
            if (startY > doc.internal.pageSize.height - 50) {
                doc.addPage();
                startY = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text(title, 14, startY + 5);
            
            autoTable(doc, {
                startY: startY + 10,
                head: [['Field', 'Value']],
                body: data,
                theme: 'grid',
                headStyles: { 
                    fillColor: [15, 23, 42], 
                    textColor: 255,
                    fontSize: 9,
                    cellPadding: 3
                },
                styles: { 
                    fontSize: 9, 
                    cellPadding: 3,
                    overflow: 'linebreak',
                    cellWidth: 'wrap',
                    minCellHeight: 8,
                    lineColor: [220, 220, 220],
                    lineWidth: 0.1
                },
                margin: { left: 14, right: 14 },
                columnStyles: {
                    0: { cellWidth: 70, fontStyle: 'bold' },
                    1: { cellWidth: 'auto' }
                }
            });
            
            // @ts-ignore
            startY = doc.lastAutoTable.finalY + 10;
        };

        // Account Information
        const accountInfoData = [
            ['Account ID', accountData.account?.accountId || 'N/A'],
            ['Master Account ID', accountData.account?.masterAccountId || 'N/A'],
            ['Registration Type', accountData.account?.registrationType || 'N/A'],
            ['Activation Source', accountData.account?.activationSource || 'N/A'],
            ['Status', accountData.account?.status || 'N/A'],
            ['Credit Limit', formatCurrency(accountData.account?.creditLimit)]
        ];
        addSection('Account Information', accountInfoData);

        // Customer Information
        const customerInfoData = [
            ['Name', accountData.customer?.name || 'N/A'],
            ['NRIC', accountData.customer?.nric || 'N/A'],
            ['Email', accountData.customer?.email || 'N/A'],
            ['Phone', accountData.customer?.phone || 'N/A'],
            ['Phone Model', accountData.customer?.phoneModel || 'N/A']
        ];
        addSection('Customer Information', customerInfoData);

        // Plan Information
        if (accountData.plan) {
            const planInfoData = [
                ['Plan Name', accountData.plan.planName || 'N/A'],
                ['Plan Amount', formatCurrency(accountData.plan.planAmount)]
            ];
            
            addSection('Plan Information', planInfoData);
        }

        // Contract Information
        if (accountData.contract) {
            const contractData = [
                ['Commencement Date', formatDate(accountData.contract.commencementDate)],
                ['Contract Start', formatDate(accountData.contract.contractStart)],
                ['Contract End', formatDate(accountData.contract.contractEnd)],
                ['Suspension Date', formatDate(accountData.contract.suspensionDate)],
                ['Barring Date', formatDate(accountData.contract.barringDate)],
                ['Days Remaining', accountData.contract.daysRemaining || 'N/A']
            ];
            addSection('Contract Information', contractData);
        }

        // Service Status
        if (accountData.service) {
            const serviceData = [
                ['Roaming', accountData.service.roaming ? 'Enabled' : 'Disabled'],
                ['IDD Call', accountData.service.iddCall ? 'Enabled' : 'Disabled'],
                ['All Divert', accountData.service.allDivert ? 'Enabled' : 'Disabled'],
                ['Voice Mail', accountData.service.voiceMail ? 'Enabled' : 'Disabled']
            ];
            
            addSection('Service Status', serviceData);
        }

        // Billing Information
        if (accountData.billing) {
            const billingData = [
                ['Last Bill Date', formatDate(accountData.billing.lastBillDate)],
                ['Last Bill Amount', formatCurrency(accountData.billing.lastBillAmount)],
                ['Next Bill Date', formatDate(accountData.billing.nextBillDate)],
                ['Outstanding Balance', formatCurrency(accountData.billing.outstanding)]
            ];
            addSection('Billing Information', billingData);
            
            // Invoices
            if (accountData.billing.invoices?.length > 0) {
                // Add section header before the table
                doc.setFontSize(12);
                doc.setTextColor(15, 23, 42);
                doc.text('Invoices', 14, startY + 10);
                startY += 15;
                
                const invoiceData = accountData.billing.invoices.map((invoice: any) => ({
                    invoiceNumber: invoice.invoiceNumber || 'N/A',
                    date: formatDate(invoice.date),
                    status: invoice.status || 'N/A',
                    amount: formatCurrency(invoice.amount)
                }));
                
                autoTable(doc, {
                    startY: startY,
                    head: [['Invoice #', 'Date', 'Status', 'Amount']],
                    body: invoiceData.map((inv: any) => [
                        inv.invoiceNumber,
                        inv.date,
                        inv.status,
                        inv.amount
                    ]),
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [15, 23, 42], 
                        textColor: 255,
                        fontSize: 9,
                        cellPadding: 3
                    },
                    styles: { 
                        fontSize: 9, 
                        cellPadding: 3,
                        overflow: 'linebreak',
                        lineColor: [220, 220, 220],
                        lineWidth: 0.1
                    },
                    margin: { left: 14, right: 14 },
                    columnStyles: {
                        0: { cellWidth: 30 },
                        1: { cellWidth: 40 },
                        2: { cellWidth: 30 },
                        3: { cellWidth: 30 }
                    },
                    didDrawPage: (data: any) => {
                        startY = data.cursor?.y || startY;
                    }
                });
                
                // Add some space after the table
                startY += 10;
            }
        }

        // Support Tickets - Enhanced with all details
        if (accountData.support?.tickets?.length > 0) {
            // Check if we need a new page
            if (startY > doc.internal.pageSize.height - 60) {
                doc.addPage();
                startY = 20;
            }
            
            // Add section header
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`Support Tickets (${accountData.support.tickets.length})`, 14, startY);
            startY += 8;
            
            // Process each ticket individually
            accountData.support.tickets.forEach((ticket: any, index: number) => {
                // Check if we need a new page before adding a ticket
                if (startY > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    startY = 20;
                }
                
                // Find related logs for this ticket
                const relatedLogs = accountData.support?.logs?.filter((log: any) => 
                    log.relatedTickets === ticket.id
                ) || [];
                
                const ticketData = [
                    ['Ticket ID', `#${ticket.id}`],
                    ['Title', ticket.title || 'N/A'],
                    ['Status', (ticket.status || 'N/A').toUpperCase()],
                    ['Category', ticket.category || 'General'],
                    ['Created', formatDate(ticket.createdAt)],
                    ['Last Updated', formatDate(ticket.updatedAt)],
                    ['Summary', ticket.summary || 'N/A']
                ];
                
                if (ticket.pendingFor) {
                    ticketData.push(['Pending For', ticket.pendingFor]);
                }
                
                if (ticket.nextAction) {
                    ticketData.push(['Next Action', ticket.nextAction]);
                }
                
                if (relatedLogs.length > 0) {
                    const logIds = relatedLogs.map((log: any) => `#${log.id}`).join(', ');
                    ticketData.push(['Related Logs', logIds]);
                }
                
                // Add ticket as a mini-table
                autoTable(doc, {
                    startY: startY,
                    body: ticketData,
                    theme: 'striped',
                    styles: { 
                        fontSize: 8,
                        cellPadding: 3,
                        lineColor: [220, 220, 220],
                        lineWidth: 0.2,
                        valign: 'top'
                    },
                    columnStyles: {
                        0: { 
                            cellWidth: 35,
                            fontStyle: 'bold',
                            fillColor: [245, 245, 245],
                            textColor: [60, 60, 60]
                        },
                        1: { 
                            cellWidth: 'auto',
                            minCellHeight: 8
                        }
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: (data: any) => {
                        startY = data.cursor?.y || startY;
                    }
                });
                
                // Add some space between tickets
                startY += 8;
                
                // Add a separator line between tickets (except after the last one)
                if (index < accountData.support.tickets.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.3);
                    doc.line(14, startY, doc.internal.pageSize.width - 14, startY);
                    startY += 8;
                }
            });
            
            // Add some space after the section
            startY += 10;
        }

        // Customer Service Logs - New comprehensive section
        if (accountData.support?.logs?.length > 0) {
            // Check if we need a new page
            if (startY > doc.internal.pageSize.height - 60) {
                doc.addPage();
                startY = 20;
            }
            
            // Add section header
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`Customer Service Logs (${accountData.support.logs.length})`, 14, startY);
            startY += 8;
            
            // Process each log individually
            accountData.support.logs.forEach((log: any, index: number) => {
                // Check if we need a new page before adding a log
                if (startY > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    startY = 20;
                }
                
                const logData = [
                    ['Log ID', `#${log.id}`],
                    ['Category', (log.category || 'General').toUpperCase()],
                    ['Timestamp', formatDate(log.timestamp)],
                    ['Summary', log.summary || 'N/A']
                ];
                
                if (log.agent) {
                    logData.push(['Agent', log.agent]);
                }
                
                if (log.duration) {
                    logData.push(['Duration', `${log.duration} minutes`]);
                }
                
                if (log.actions && log.actions.length > 0) {
                    logData.push(['Actions Taken', log.actions.join(', ')]);
                }
                
                if (log.followUpRequired) {
                    const followUpText = log.followUpDate 
                        ? `Yes (Due: ${formatDate(log.followUpDate)})`
                        : 'Yes';
                    logData.push(['Follow-up Required', followUpText]);
                }
                
                if (log.relatedTickets) {
                    logData.push(['Related Ticket', `#${log.relatedTickets}`]);
                }
                
                // Add log as a mini-table
                autoTable(doc, {
                    startY: startY,
                    body: logData,
                    theme: 'striped',
                    styles: { 
                        fontSize: 8,
                        cellPadding: 3,
                        lineColor: [220, 220, 220],
                        lineWidth: 0.2,
                        valign: 'top'
                    },
                    columnStyles: {
                        0: { 
                            cellWidth: 35,
                            fontStyle: 'bold',
                            fillColor: [245, 245, 245],
                            textColor: [60, 60, 60]
                        },
                        1: { 
                            cellWidth: 'auto',
                            minCellHeight: 8
                        }
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: (data: any) => {
                        startY = data.cursor?.y || startY;
                    }
                });
                
                // Add some space between logs
                startY += 8;
                
                // Add a separator line between logs (except after the last one)
                if (index < accountData.support.logs.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.3);
                    doc.line(14, startY, doc.internal.pageSize.width - 14, startY);
                    startY += 8;
                }
            });
            
            // Add some space after the section
            startY += 10;
        }
        
        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width - 20,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }
        
        // Save the PDF
        doc.save(`account-details-${accountData.personalInfo?.phone || 'unknown'}-${currentDate}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Account Details</h1>
                    <p className="text-lg text-gray-600">Search for a user by mobile number to view their full profile.</p>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-4 max-w-md mx-auto">
                        <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Enter Mobile Number (e.g. 0198831359)"
                            className="flex-1 min-w-0 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-red-500 focus:border-red-500 text-gray-900 shadow-sm transition-all"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                        >
                            Search
                        </button>
                    </div>
                    {error && <p className="mt-2 text-center text-red-600 font-medium">{error}</p>}
                </form>

                {accountData && (
                    <div className="flex justify-end mb-6">
                        <Button 
                            onClick={exportToPDF}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export to PDF
                        </Button>
                    </div>
                )}
                
                <div ref={accountDetailsRef}>
                {accountData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Section title="Account Information">
                            <InfoItem label="Account ID" value={accountData.account.accountId} />
                            <InfoItem label="Master Account ID" value={accountData.account.masterAccountId} />
                            <InfoItem label="Registration Type" value={accountData.account.registrationType} />
                            <InfoItem label="Activation Source" value={accountData.account.activationSource} />
                            <InfoItem label="Status" value={accountData.account.status} />
                            <InfoItem label="Credit Limit" value={formatCurrency(accountData.account.creditLimit)} />
                        </Section>

                        <Section title="Customer Information">
                            <InfoItem label="Name" value={accountData.customer.name} />
                            <InfoItem label="NRIC" value={accountData.customer.nric} />
                            <InfoItem label="Email" value={accountData.customer.email} />
                            <InfoItem label="Phone" value={accountData.customer.phone} />
                            <InfoItem label="Phone Model" value={accountData.customer.phoneModel} />
                        </Section>

                        <Section title="Plan Information">
                            <InfoItem label="Plan Name" value={accountData.plan.planName} />
                            <InfoItem label="Plan Amount" value={formatCurrency(accountData.plan.planAmount)} />
                            
                            <div className="col-span-full">
                                <div className="space-y-4">
                                    {/* Default Subscribed Services */}
                                    {accountData.plan.defaultSubscribedServices?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Default Services</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {accountData.plan.defaultSubscribedServices.map((service: any, i: number) => (
                                                    <span key={`default-${i}`} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                                                        {service.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Services */}
                                    {accountData.plan.additionalSubscribedServices?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Services</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {accountData.plan.additionalSubscribedServices.map((service: any, i: number) => (
                                                    <span key={`additional-${i}`} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                                                        {service.name} ({formatCurrency(service.amount)})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Section>

                        <Section title="Contract Information">
                            <InfoItem label="Commencement Date" value={formatDate(accountData.contract.commencementDate)} />
                            <InfoItem label="Contract Start" value={formatDate(accountData.contract.contractStart)} />
                            <InfoItem label="Contract End" value={formatDate(accountData.contract.contractEnd)} />
                            <InfoItem label="Suspension Date" value={formatDate(accountData.contract.suspensionDate)} />
                            <InfoItem label="Barring Date" value={formatDate(accountData.contract.barringDate)} />
                            <InfoItem label="Days Remaining" value={accountData.contract.daysRemaining} />
                        </Section>

                        <Section title="Service Status">
                            <InfoItem label="Roaming" value={accountData.service.roaming} />
                            <InfoItem label="IDD Call" value={accountData.service.iddCall} />
                            <InfoItem label="All Divert" value={accountData.service.allDivert} />
                            <InfoItem label="Voice Mail" value={accountData.service.voiceMail} />
                        </Section>

                        <Section title="Billing Information">
                            <InfoItem label="Last Bill Date" value={formatDate(accountData.billing.lastBillDate)} />
                            <InfoItem label="Last Bill Amount" value={formatCurrency(accountData.billing.lastBillAmount)} />
                            <InfoItem label="Next Bill Date" value={formatDate(accountData.billing.nextBillDate)} />
                            <InfoItem label="Outstanding Balance" value={formatCurrency(accountData.billing.outstanding)} />
                        </Section>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Recent Payments</h2>
                            <div className="space-y-3">
                                {accountData.billing?.payments && accountData.billing.payments.length > 0 ? (
                                    accountData.billing.payments.map((payment: any, i: number) => (
                                        <div key={i} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{payment.method}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">{formatDate(payment.date)}</div>
                                                    <div className="text-xs text-gray-500">{payment.reference}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        No recent payments found
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Barring History</h2>
                            <div className="space-y-3">
                                {accountData.barring && accountData.barring.length > 0 ? (
                                    accountData.barring.map((barring: any, i: number) => (
                                        <div key={i} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-block w-2 h-2 rounded-full ${barring.status === 'BARRED' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                        <span className="font-medium text-gray-900 capitalize">{barring.status.toLowerCase()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{barring.reason}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">{formatDate(barring.date)}</div>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                        {barring.action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        No barring history available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Additional Information</h2>
                            <div className="space-y-4">
                                {accountData.additionalInfo?.notes && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-start">
                                            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-blue-800">{accountData.additionalInfo.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {accountData.additionalInfo?.activationNotes && (
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-sm text-gray-600">{accountData.additionalInfo.activationNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Invoices</h2>
                            <div className="space-y-4">
                                {accountData.billing.invoices.map((inv: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-sm font-bold text-gray-900">{inv.invoiceNumber}</span>
                                                <span className="text-xs text-gray-500 block">{formatDate(inv.date)}</span>
                                                {inv.status !== 'Paid' && (
                                                    <span className="text-xs text-red-500 block mt-1">
                                                        Due: {formatDate(inv.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-red-600">{formatCurrency(inv.amount)}</div>
                                        {inv.items && inv.items.length > 0 && (
                                            <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
                                                {inv.items.map((item: any, itemIndex: number) => (
                                                    <div key={itemIndex} className="flex justify-between text-sm text-gray-700">
                                                        <span>{item.description}</span>
                                                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                                <h2 className="text-xl font-bold text-gray-800">Support Tickets</h2>
                                <span className="text-sm text-gray-500">
                                    {accountData.support?.tickets?.length || 0} ticket(s)
                                </span>
                            </div>
                            <div className="space-y-4">
                                {accountData.support?.tickets && accountData.support.tickets.length > 0 ? (
                                    accountData.support.tickets.map((ticket: any, i: number) => {
                                        const statusColors = {
                                            resolved: 'bg-green-100 text-green-800 border-green-200',
                                            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                            escalated: 'bg-red-100 text-red-800 border-red-200',
                                            open: 'bg-blue-100 text-blue-800 border-blue-200',
                                            closed: 'bg-gray-100 text-gray-800 border-gray-200'
                                        };
                                        const statusColor = statusColors[ticket.status?.toLowerCase() as keyof typeof statusColors] || statusColors.open;
                                        
                                        // Find related logs for this ticket
                                        const relatedLogs = accountData.support?.logs?.filter((log: any) => 
                                            log.relatedTickets === ticket.id
                                        ) || [];

                                        return (
                                            <div key={i} id={`ticket-${ticket.id}`} className="p-5 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-mono text-gray-500">#{ticket.id}</span>
                                                            <h3 className="font-bold text-gray-900 text-lg">{ticket.title}</h3>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{ticket.summary}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor} uppercase ml-4 whitespace-nowrap`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Category</span>
                                                        <p className="text-sm font-medium text-gray-900 capitalize">{ticket.category || 'General'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
                                                        <p className="text-sm font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                                                    </div>
                                                    {ticket.updatedAt && (
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
                                                            <p className="text-sm font-medium text-gray-900">{formatDate(ticket.updatedAt)}</p>
                                                        </div>
                                                    )}
                                                    {ticket.pendingFor && (
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Pending For</span>
                                                            <p className="text-sm font-medium text-gray-900">{ticket.pendingFor}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {ticket.nextAction && (
                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                        <span className="text-xs text-blue-600 uppercase tracking-wide font-semibold">Next Action</span>
                                                        <p className="text-sm text-blue-900 mt-1">{ticket.nextAction}</p>
                                                    </div>
                                                )}

                                                {relatedLogs.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                                                                Related Logs ({relatedLogs.length})
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {relatedLogs.map((log: any, logIdx: number) => (
                                                                <a 
                                                                    key={logIdx}
                                                                    href={`#log-${log.id}`}
                                                                    className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors font-mono"
                                                                >
                                                                    Log #{log.id}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        No support tickets available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                                <h2 className="text-xl font-bold text-gray-800">Customer Service Logs</h2>
                                <span className="text-sm text-gray-500">
                                    {accountData.support?.logs?.length || 0} log(s)
                                </span>
                            </div>
                            <div className="space-y-4">
                                {accountData.support?.logs && accountData.support.logs.length > 0 ? (
                                    accountData.support.logs.map((log: any, i: number) => {
                                        const categoryColors = {
                                            network: 'bg-purple-100 text-purple-800 border-purple-200',
                                            billing: 'bg-orange-100 text-orange-800 border-orange-200',
                                            service: 'bg-blue-100 text-blue-800 border-blue-200',
                                            technical: 'bg-red-100 text-red-800 border-red-200',
                                            general: 'bg-gray-100 text-gray-800 border-gray-200'
                                        };
                                        const categoryColor = categoryColors[log.category?.toLowerCase() as keyof typeof categoryColors] || categoryColors.general;

                                        return (
                                            <div key={i} id={`log-${log.id}`} className="p-5 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-mono text-gray-500">Log #{log.id}</span>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColor} uppercase`}>
                                                                {log.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">{log.summary}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                                                    {log.agent && (
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Agent</span>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <p className="text-sm font-medium text-gray-900">{log.agent}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {log.duration && (
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-sm font-medium text-gray-900">{log.duration} min</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Timestamp</span>
                                                        <p className="text-sm font-medium text-gray-900">{formatDate(log.timestamp)}</p>
                                                    </div>
                                                </div>

                                                {log.actions && log.actions.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Actions Taken</span>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {log.actions.map((action: string, actionIdx: number) => (
                                                                <span key={actionIdx} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                                                                    {action}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {log.followUpRequired && (
                                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            <span className="text-xs text-amber-800 font-semibold uppercase tracking-wide">Follow-up Required</span>
                                                        </div>
                                                        {log.followUpDate && (
                                                            <p className="text-sm text-amber-900 mt-1">Due: {formatDate(log.followUpDate)}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {log.relatedTickets && (
                                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Related Ticket</span>
                                                        </div>
                                                        <a 
                                                            href={`#ticket-${log.relatedTickets}`}
                                                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors font-mono"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Ticket #{log.relatedTickets}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        No customer service logs available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AccountDetailsPage;
