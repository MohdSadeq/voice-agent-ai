/**
 * Script to add relatedLogIds array to ticketHistories
 * Creates bidirectional references between tickets and customer logs
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');
const outputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');

console.log('Reading fake.users.json...');
const users = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

let totalTicketsUpdated = 0;
let ticketsWithLogs = 0;
let ticketsWithoutLogs = 0;

users.forEach((user, userIndex) => {
    if (!user.ticketHistories || user.ticketHistories.length === 0) {
        return;
    }

    console.log(`\nProcessing user ${user.id} (${user.name}):`);
    console.log(`  - ${user.ticketHistories.length} tickets`);
    console.log(`  - ${user.customerLogs?.length || 0} customer logs`);

    user.ticketHistories.forEach((ticket, ticketIndex) => {
        // If relatedLogIds already exists, skip
        if (ticket.relatedLogIds !== undefined) {
            return;
        }

        totalTicketsUpdated++;

        // Find all customer logs that reference this ticket
        const relatedLogs = [];
        
        if (user.customerLogs && user.customerLogs.length > 0) {
            user.customerLogs.forEach(log => {
                if (log.ticketId === ticket.id) {
                    relatedLogs.push(log.id);
                }
            });
        }

        // Add relatedLogIds array to ticket
        ticket.relatedLogIds = relatedLogs;

        if (relatedLogs.length > 0) {
            ticketsWithLogs++;
            console.log(`  ✓ Ticket ${ticket.id}: Linked with ${relatedLogs.length} log(s)`);
        } else {
            ticketsWithoutLogs++;
            console.log(`  - Ticket ${ticket.id}: No related logs (empty array)`);
        }
    });
});

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Total tickets updated: ${totalTicketsUpdated}`);
console.log(`  Tickets with related logs: ${ticketsWithLogs}`);
console.log(`  Tickets without related logs: ${ticketsWithoutLogs}`);
console.log('='.repeat(60));

// Write updated data back to file
console.log('\nWriting updated data to fake.users.json...');
fs.writeFileSync(outputFile, JSON.stringify(users, null, 2), 'utf8');
console.log('✓ Done! All tickets now have relatedLogIds field.');
console.log('\nBidirectional references complete:');
console.log('  - customerLogs have ticketId → ticket');
console.log('  - ticketHistories have relatedLogIds → [log IDs]');
