/**
 * Script to convert customerLog IDs from UUID to numeric format
 * Updates all references in relatedLogIds arrays in ticketHistories
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');
const outputFile = path.join(__dirname, '../src/app/agentConfigs/chatSupervisor/fake.users.json');

console.log('Reading fake.users.json...');
const users = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Create a mapping from old UUID IDs to new numeric IDs
const idMapping = new Map();
let nextLogId = 5001; // Start from 5001 to avoid conflicts with ticket IDs (1000-1059)

let totalLogsConverted = 0;
let totalReferencesUpdated = 0;

// First pass: Convert all log IDs and create mapping
console.log('\nPhase 1: Converting log IDs from UUID to numeric...');
users.forEach((user) => {
    if (!user.customerLogs || user.customerLogs.length === 0) {
        return;
    }

    user.customerLogs.forEach((log) => {
        const oldId = log.id;
        const newId = nextLogId++;
        
        // Store mapping
        idMapping.set(oldId, newId);
        
        // Update the log ID
        log.id = newId;
        totalLogsConverted++;
    });
});

console.log(`✓ Converted ${totalLogsConverted} log IDs (5001 - ${nextLogId - 1})`);

// Second pass: Update all relatedLogIds references in tickets
console.log('\nPhase 2: Updating relatedLogIds in tickets...');
users.forEach((user) => {
    if (!user.ticketHistories || user.ticketHistories.length === 0) {
        return;
    }

    user.ticketHistories.forEach((ticket) => {
        if (!ticket.relatedLogIds || ticket.relatedLogIds.length === 0) {
            return;
        }

        // Convert each UUID reference to numeric
        ticket.relatedLogIds = ticket.relatedLogIds.map(oldId => {
            const newId = idMapping.get(oldId);
            if (newId) {
                totalReferencesUpdated++;
                return newId;
            }
            return oldId; // Keep as-is if not found (shouldn't happen)
        });
    });
});

console.log(`✓ Updated ${totalReferencesUpdated} references in tickets`);

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Total log IDs converted: ${totalLogsConverted}`);
console.log(`  New ID range: 5001 - ${nextLogId - 1}`);
console.log(`  Total references updated: ${totalReferencesUpdated}`);
console.log('='.repeat(60));

// Write updated data back to file
console.log('\nWriting updated data to fake.users.json...');
fs.writeFileSync(outputFile, JSON.stringify(users, null, 2), 'utf8');
console.log('✓ Done! All log IDs are now numeric.');
console.log('\nID Format:');
console.log('  - Ticket IDs: 1000-1059 (numeric)');
console.log(`  - Log IDs: 5001-${nextLogId - 1} (numeric)`);
