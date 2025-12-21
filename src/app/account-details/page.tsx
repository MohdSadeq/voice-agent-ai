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

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

        // Basic Information
        const basicInfoData = [
            ['Account ID', accountData.accountInfo?.accountId || 'N/A'],
            ['Master Account ID', accountData.accountInfo?.masterAccountId || 'N/A'],
            ['Registration Type', accountData.accountInfo?.registrationType || 'N/A'],
            ['Activation Source', accountData.accountInfo?.activationSource || 'N/A'],
            ['Status', accountData.accountInfo?.status || 'N/A'],
            ['Credit Limit', accountData.accountInfo?.creditLimit || 'N/A'],
            ['PUK', accountData.accountInfo?.puk || 'N/A'],
            ['Serial', accountData.accountInfo?.serial || 'N/A']
        ];
        addSection('Basic Information', basicInfoData);

        // Personal Information
        const personalInfoData = [
            ['Name', accountData.personalInfo?.name || 'N/A'],
            ['NRIC', accountData.personalInfo?.nric || 'N/A'],
            ['Email', accountData.personalInfo?.email || 'N/A'],
            ['Phone', accountData.personalInfo?.phone || 'N/A'],
            ['Phone Model', accountData.personalInfo?.phoneModel || 'N/A']
        ];
        addSection('Personal Information', personalInfoData);

        // Plan Information
        if (accountData.planInfo) {
            const planInfoData = [
                ['Plan Name', accountData.planInfo.planName || 'N/A'],
                ['Plan Amount', accountData.planInfo.planAmount || 'N/A'],
                ['Network Features', '']
            ];
            
            // Add network features
            if (accountData.planInfo.networkFeatures) {
                planInfoData.push(
                    ['• LTE', accountData.planInfo.networkFeatures.lte ? 'Enabled' : 'Disabled'],
                    ['• VoLTE', accountData.planInfo.networkFeatures.volte ? 'Enabled' : 'Disabled'],
                    ['• 5G', accountData.planInfo.networkFeatures.enable5g ? 'Enabled' : 'Disabled']
                );
            }
            
            addSection('Plan Information', planInfoData);
        }

        // Contract Information
        if (accountData.contractInfo) {
            const contractData = [
                ['Commencement Date', accountData.contractInfo.commencementDate || 'N/A'],
                ['Contract Start', accountData.contractInfo.contractStart || 'N/A'],
                ['Contract End', accountData.contractInfo.contractEnd || 'N/A'],
                ['Suspension Date', accountData.contractInfo.suspensionDate || 'N/A'],
                ['Barring Date', accountData.contractInfo.barringDate || 'N/A'],
                ['Days Remaining', accountData.contractInfo.daysRemaining || 'N/A']
            ];
            addSection('Contract Information', contractData);
        }

        // Service Status
        if (accountData.serviceStatus) {
            const serviceData = [
                ['Roaming', accountData.serviceStatus.roaming ? 'Enabled' : 'Disabled'],
                ['IDD Call', accountData.serviceStatus.iddCall ? 'Enabled' : 'Disabled'],
                ['All Divert', accountData.serviceStatus.allDivert ? 'Enabled' : 'Disabled'],
                ['Voice Mail', accountData.serviceStatus.voiceMail ? 'Enabled' : 'Disabled']
            ];
            
            // Add active services
            if (accountData.serviceStatus.activeServices?.length > 0) {
                serviceData.push(['Active Services', '']);
                accountData.serviceStatus.activeServices.forEach((service: string) => {
                    serviceData.push([`• ${service}`, '']);
                });
            }
            
            addSection('Service Status', serviceData);
        }

        // Billing Information
        if (accountData.billingInfo) {
            const billingData = [
                ['Last Bill Date', accountData.billingInfo.lastBillDate || 'N/A'],
                ['Last Bill Amount', accountData.billingInfo.lastBillAmount || 'N/A'],
                ['Next Bill Date', accountData.billingInfo.nextBillDate || 'N/A'],
                ['Outstanding Balance', accountData.billingInfo.outstandingBalance || 'N/A']
            ];
            addSection('Billing Information', billingData);
            
            // Invoices
            if (accountData.billingInfo.invoices?.length > 0) {
                // Add section header before the table
                doc.setFontSize(12);
                doc.setTextColor(15, 23, 42);
                doc.text('Invoices', 14, startY + 10);
                startY += 15;
                
                const invoiceData = accountData.billingInfo.invoices.map((invoice: any) => ({
                    invoiceNumber: invoice.invoiceNumber || 'N/A',
                    date: invoice.date || 'N/A',
                    status: invoice.status || 'N/A',
                    amount: invoice.amount || 'N/A'
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

        // Ticket History
        if (accountData.ticketHistory?.length > 0) {
            // Add section header
            doc.setFontSize(12);
            doc.setTextColor(15, 23, 42);
            doc.text('Ticket History', 14, startY + 10);
            startY += 15;
            
            // Process each ticket individually to handle page breaks
            accountData.ticketHistory.forEach((ticket: any, index: number) => {
                // Check if we need a new page before adding a ticket
                if (startY > doc.internal.pageSize.height - 80) {
                    doc.addPage();
                    startY = 20;
                }
                
                const ticketData = [
                    ['Title', ticket.title || 'N/A'],
                    ['Status', ticket.status || 'N/A'],
                    ['Created', ticket.createdAt || 'N/A'],
                    ['Summary', { content: ticket.summary || 'N/A', rowSpan: 3 }]
                ];
                
                // Add ticket as a mini-table
                autoTable(doc, {
                    startY: startY,
                    body: ticketData,
                    theme: 'plain',
                    styles: { 
                        fontSize: 9,
                        cellPadding: 4,
                        lineColor: [220, 220, 220],
                        lineWidth: 0.3,
                        valign: 'top'
                    },
                    headStyles: {
                        fillColor: [240, 240, 240],
                        textColor: [15, 23, 42],
                        fontStyle: 'bold',
                        lineWidth: 0.3
                    },
                    columnStyles: {
                        0: { 
                            cellWidth: 30,
                            fontStyle: 'bold',
                            fillColor: [240, 240, 240]
                        },
                        1: { 
                            cellWidth: 'auto',
                            minCellHeight: 10
                        }
                    },
                    margin: { left: 14, right: 14 },
                    didDrawPage: (data: any) => {
                        startY = data.cursor?.y || startY;
                    }
                });
                
                // Add some space between tickets
                startY += 10;
                
                // Add a separator line between tickets (except after the last one)
                if (index < accountData.ticketHistory.length - 1) {
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.2);
                    doc.line(14, startY, doc.internal.pageSize.width - 14, startY);
                    startY += 15;
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
                        <Section title="Basic Information">
                            <InfoItem label="Account ID" value={accountData.accountInfo.accountId} />
                            <InfoItem label="Master Account ID" value={accountData.accountInfo.masterAccountId} />
                            <InfoItem label="Registration Type" value={accountData.accountInfo.registrationType} />
                            <InfoItem label="Activation Source" value={accountData.accountInfo.activationSource} />
                            <InfoItem label="Status" value={accountData.accountInfo.status} />
                            <InfoItem label="Credit Limit" value={accountData.accountInfo.creditLimit} />
                            <InfoItem label="PUK" value={accountData.accountInfo.puk} />
                            <InfoItem label="Serial" value={accountData.accountInfo.serial} />
                        </Section>

                        <Section title="Personal Information">
                            <InfoItem label="Name" value={accountData.personalInfo.name} />
                            <InfoItem label="NRIC" value={accountData.personalInfo.nric} />
                            <InfoItem label="Email" value={accountData.personalInfo.email} />
                            <InfoItem label="Phone" value={accountData.personalInfo.phone} />
                            <InfoItem label="Phone Model" value={accountData.personalInfo.phoneModel} />
                        </Section>

                        <Section title="Plan Information">
                            <InfoItem label="Plan Name" value={accountData.planInfo.planName} />
                            <InfoItem label="Plan Amount" value={accountData.planInfo.planAmount} />
                            <div className="col-span-full">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">Network Features</span>
                                <div className="flex gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${accountData.planInfo.networkFeatures.lte ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>LTE</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${accountData.planInfo.networkFeatures.volte ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>VoLTE</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${accountData.planInfo.networkFeatures.enable5g ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>5G</span>
                                </div>
                            </div>
                            
                            <div className="col-span-full">
                                <div className="space-y-4">
                                    {/* Default Subscribed Services */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Default Services</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {accountData.planInfo.defaultServices?.length > 0 ? (
                                                accountData.planInfo.defaultServices.map((service: any, i: number) => (
                                                    <span key={`default-${i}`} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                                                        {service.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-500">No default subscriptions</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Services */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Available Services</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {accountData.planInfo.availableSubscribedServices?.length > 0 ? (
                                                accountData.planInfo.availableSubscribedServices.map((service: any, i: number) => (
                                                    <span key={`available-${i}`} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                                                        {service.name} (RM{service.amount})
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-500">No additional services available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Contract Information">
                            <InfoItem label="Commencement Date" value={accountData.contractInfo.commencementDate} />
                            <InfoItem label="Contract Start" value={accountData.contractInfo.contractStart} />
                            <InfoItem label="Contract End" value={accountData.contractInfo.contractEnd} />
                            <InfoItem label="Suspension Date" value={accountData.contractInfo.suspensionDate} />
                            <InfoItem label="Barring Date" value={accountData.contractInfo.barringDate} />
                            <InfoItem label="Days Remaining" value={accountData.contractInfo.daysRemaining} />
                        </Section>

                        <Section title="Service Status">
                            <InfoItem label="Roaming" value={accountData.serviceStatus.roaming} />
                            <InfoItem label="IDD Call" value={accountData.serviceStatus.iddCall} />
                            <InfoItem label="All Divert" value={accountData.serviceStatus.allDivert} />
                            <InfoItem label="Voice Mail" value={accountData.serviceStatus.voiceMail} />
                            <div className="col-span-full">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider block mb-2">Active Services</span>
                                <div className="flex flex-wrap gap-2">
                                    {accountData.serviceStatus.activeServices.map((service: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">{service}</span>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        <Section title="Billing Information">
                            <InfoItem label="Last Bill Date" value={accountData.billingInfo.lastBillDate} />
                            <InfoItem label="Last Bill Amount" value={accountData.billingInfo.lastBillAmount} />
                            <InfoItem label="Next Bill Date" value={accountData.billingInfo.nextBillDate} />
                            <InfoItem label="Outstanding Balance" value={accountData.billingInfo.outstandingBalance} />
                        </Section>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Recent Payments</h2>
                            <div className="space-y-3">
                                {accountData.billingInfo.paymentHistory && accountData.billingInfo.paymentHistory.length > 0 ? (
                                    accountData.billingInfo.paymentHistory.map((payment: any, i: number) => (
                                        <div key={i} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-gray-900">{payment.amount}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{payment.method}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">{payment.date}</div>
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
                                {accountData.billingInfo.barringHistory && accountData.billingInfo.barringHistory.length > 0 ? (
                                    accountData.billingInfo.barringHistory.map((barring: any, i: number) => (
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
                                                    <div className="text-sm font-medium text-gray-900">{barring.date}</div>
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
                                {accountData.billingInfo.invoices.map((inv: any, i: number) => (
                                    <><div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-sm font-bold text-gray-900">{inv.invoiceNumber}</span>
                                                <span className="text-xs text-gray-500 block">{inv.date}</span>
                                                {inv.status !== 'Paid' && (
                                                    <span className="text-xs text-red-500 block mt-1">
                                                        Due: {inv.dueDate}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-red-600">{inv.amount}</div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 space-y-2">
                                        {inv.items.map((item: any, itemIndex: number) => (
                                            <div
                                            key={itemIndex}
                                            className="flex justify-between text-sm text-gray-700"
                                            >
                                            <span>{item.description}</span>
                                            <span className="font-medium">{item.amount}</span>
                                            </div>
                                        ))}
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>

                        <Section title="Ticket History">
                            <div className="col-span-full space-y-4">
                                {accountData.ticketHistory.map((ticket: any, i: number) => (
                                    <div key={i} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-gray-800">{ticket.title}</h3>
                                            <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-700 uppercase">{ticket.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{ticket.summary}</p>
                                        <div className="text-xs text-gray-400">Created: {ticket.createdAt}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Customer Service Logs">
                            <div className="col-span-full space-y-4">
                                {accountData.customerLogs && accountData.customerLogs.length > 0 ? (
                                    accountData.customerLogs.map((log: any, i: number) => (
                                        <div key={i} className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 capitalize">{log.category}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{log.summary}</p>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">
                                                    {log.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        No customer service logs available
                                    </div>
                                )}
                            </div>
                        </Section>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default AccountDetailsPage;
