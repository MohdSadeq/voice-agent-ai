/**
 * Script to add ticketId field to customerLogs entries
 * Maps customer logs with ticket IDs from ticketHistories
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');
const outputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');

console.log('Reading fake.users.json...');
const users = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

let totalLogsUpdated = 0;
let logsWithTickets = 0;
let logsWithoutTickets = 0;

users.forEach((user, userIndex) => {
    if (!user.customerLogs || user.customerLogs.length === 0) {
        return;
    }

    console.log(`\nProcessing user ${user.id} (${user.name}):`);
    console.log(`  - ${user.customerLogs.length} customer logs`);
    console.log(`  - ${user.ticketHistories?.length || 0} tickets`);

    user.customerLogs.forEach((log, logIndex) => {
        // If ticketId already exists, skip
        if (log.ticketId !== undefined) {
            return;
        }

        totalLogsUpdated++;

        // Try to match log with a ticket based on:
        // 1. Similar timestamp (within 30 days)
        // 2. Related category/summary keywords
        let matchedTicket = null;

        if (user.ticketHistories && user.ticketHistories.length > 0) {
            const logDate = new Date(log.timestamp);
            
            // Find tickets with similar timestamps or related content
            const potentialMatches = user.ticketHistories.filter(ticket => {
                const ticketDate = new Date(ticket.createdAt);
                const daysDiff = Math.abs((logDate - ticketDate) / (1000 * 60 * 60 * 24));
                
                // Match if within 30 days
                if (daysDiff <= 30) {
                    return true;
                }
                
                // Or match if summary/title contains similar keywords
                const logKeywords = log.summary.toLowerCase();
                const ticketKeywords = (ticket.title + ' ' + ticket.summary).toLowerCase();
                
                const commonKeywords = ['network', 'billing', 'data', 'roaming', 'speed', 'connection', 'payment'];
                for (const keyword of commonKeywords) {
                    if (logKeywords.includes(keyword) && ticketKeywords.includes(keyword)) {
                        return true;
                    }
                }
                
                return false;
            });

            if (potentialMatches.length > 0) {
                // Pick the closest ticket by date
                matchedTicket = potentialMatches.reduce((closest, ticket) => {
                    const ticketDate = new Date(ticket.createdAt);
                    const closestDate = new Date(closest.createdAt);
                    const logDate = new Date(log.timestamp);
                    
                    const ticketDiff = Math.abs(logDate - ticketDate);
                    const closestDiff = Math.abs(logDate - closestDate);
                    
                    return ticketDiff < closestDiff ? ticket : closest;
                });
            }
        }

        // Add ticketId field
        if (matchedTicket) {
            log.ticketId = matchedTicket.id;
            logsWithTickets++;
            console.log(`  ✓ Log ${logIndex + 1}: Matched with ticket ${matchedTicket.id}`);
        } else {
            log.ticketId = null;
            logsWithoutTickets++;
            console.log(`  - Log ${logIndex + 1}: No matching ticket (set to null)`);
        }
    });
});

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Total logs updated: ${totalLogsUpdated}`);
console.log(`  Logs with ticket IDs: ${logsWithTickets}`);
console.log(`  Logs without ticket IDs: ${logsWithoutTickets}`);
console.log('='.repeat(60));

// Write updated data back to file
console.log('\nWriting updated data to fake.users.json...');
fs.writeFileSync(outputFile, JSON.stringify(users, null, 2), 'utf8');
console.log('✓ Done! All customerLogs now have ticketId field.');
