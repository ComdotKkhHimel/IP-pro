document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const uidInput = document.getElementById('uidInput');
    const spinner = document.getElementById('spinner');
    
    // Containers
    const allAccountsContainer = document.getElementById('allAccountsContainer');
    const activeAccountsContainer = document.getElementById('activeAccountsContainer');
    const suspendedAccountsContainer = document.getElementById('suspendedAccountsContainer');
    const duplicateAccountsContainer = document.getElementById('duplicateAccountsContainer');
    
    // Counters
    const allCount = document.getElementById('allCount');
    const activeCount = document.getElementById('activeCount');
    const suspendedCount = document.getElementById('suspendedCount');
    const duplicateCount = document.getElementById('duplicateCount');
    
    // Export buttons
    const exportCSV = document.getElementById('exportCSV');
    const exportJSON = document.getElementById('exportJSON');
    const exportTXT = document.getElementById('exportTXT');
    
    let currentResults = [];
    let currentDuplicates = [];
    let currentStats = {
        total: 0,
        active: 0,
        suspended: 0,
        duplicates: 0
    };
    
    // Event Listeners
    checkBtn.addEventListener('click', checkAccountStatus);
    clearBtn.addEventListener('click', clearAll);
    exportCSV.addEventListener('click', () => exportResults('csv'));
    exportJSON.addEventListener('click', () => exportResults('json'));
    exportTXT.addEventListener('click', () => exportResults('txt'));
    
    async function checkAccountStatus() {
        const uidsText = uidInput.value.trim();
        if (!uidsText) {
            alert('Please enter at least one UID');
            return;
        }
        
        // Parse UIDs
        const uids = uidsText.split(/[\n,]+/)
            .map(uid => uid.trim())
            .filter(uid => uid);
        
        // Show loading state
        checkBtn.disabled = true;
        spinner.classList.remove('d-none');
        
        try {
            const response = await fetch('/check-account-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uids })
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentResults = data.results;
                currentDuplicates = data.duplicates;
                currentStats = data.stats;
                
                updateAllDisplays();
                updateCounters();
            } else {
                showError('Error checking accounts: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error:', err);
            showError('Failed to check accounts. Please try again.');
        } finally {
            checkBtn.disabled = false;
            spinner.classList.add('d-none');
        }
    }
    
    function updateAllDisplays() {
        updateAllAccountsDisplay();
        updateActiveAccountsDisplay();
        updateSuspendedAccountsDisplay();
        updateDuplicateAccountsDisplay();
    }
    
    function updateAllAccountsDisplay() {
        allAccountsContainer.innerHTML = '';
        
        currentResults.forEach(result => {
            const card = createAccountCard(result);
            allAccountsContainer.appendChild(card);
        });
    }
    
    function updateActiveAccountsDisplay() {
        activeAccountsContainer.innerHTML = '';
        
        const activeAccounts = currentResults.filter(r => r.isActive && !r.isDuplicate);
        
        activeAccounts.forEach(account => {
            const card = createAccountCard(account);
            activeAccountsContainer.appendChild(card);
        });
    }
    
    function updateSuspendedAccountsDisplay() {
        suspendedAccountsContainer.innerHTML = '';
        
        const suspendedAccounts = currentResults.filter(r => r.isSuspended && !r.isDuplicate);
        
        suspendedAccounts.forEach(account => {
            const card = createAccountCard(account);
            suspendedAccountsContainer.appendChild(card);
        });
    }
    
    function updateDuplicateAccountsDisplay() {
        duplicateAccountsContainer.innerHTML = '';
        
        if (currentDuplicates.length === 0) {
            duplicateAccountsContainer.innerHTML = `
                <div class="alert alert-info">
                    No duplicate UIDs found
                </div>
            `;
            return;
        }
        
        currentDuplicates.forEach(dup => {
            const accounts = currentResults.filter(r => r.uid === dup.uid);
            
            const dupItem = document.createElement('div');
            dupItem.className = 'list-group-item';
            dupItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">UID: ${dup.uid}</h5>
                    <span class="badge duplicate-badge">${dup.count} duplicates</span>
                </div>
                <div class="mt-2">
                    ${accounts.map(acc => `
                        <div class="d-flex align-items-center mb-1">
                            <span class="badge ${acc.isActive ? 'active-badge' : 'suspended-badge'} me-2">
                                ${acc.isActive ? 'Active' : 'Suspended'}
                            </span>
                            ${acc.name || 'Unknown name'}
                        </div>
                    `).join('')}
                </div>
            `;
            
            duplicateAccountsContainer.appendChild(dupItem);
        });
    }
    
    function createAccountCard(account) {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6';
        
        let cardContent;
        
        if (account.error) {
            cardContent = `
                <div class="card account-card border-danger h-100">
                    <div class="card-body">
                        <h5 class="card-title text-danger">Error</h5>
                        <p class="card-text">UID: ${account.uid}</p>
                        <p class="card-text text-danger">${account.error}</p>
                    </div>
                </div>
            `;
        } else {
            const statusBadge = account.isActive 
                ? '<span class="badge active-badge">Active</span>'
                : '<span class="badge suspended-badge">Suspended</span>';
                
            const duplicateBadge = account.isDuplicate
                ? '<span class="badge duplicate-badge ms-2">Duplicate</span>'
                : '';
                
            const lastActive = account.isActive && account.lastActive
                ? `<p class="card-text"><small>Last active: ${new Date(account.lastActive).toLocaleString()}</small></p>`
                : '';
                
            const suspendedDate = account.isSuspended && account.suspensionDate
                ? `<p class="card-text"><small>Suspended since: ${new Date(account.suspensionDate).toLocaleString()}</small></p>`
                : '';
                
            const profileImg = account.profilePic
                ? `<img src="${account.profilePic}" class="card-img-top" alt="Profile" onerror="this.src='https://via.placeholder.com/150'">`
                : '<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 150px;">No photo</div>';
                
            cardContent = `
                <div class="card account-card h-100 ${account.isDuplicate ? 'border-warning' : account.isActive ? 'border-success' : 'border-danger'}">
                    ${profileImg}
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title mb-0">${account.name || 'Unknown'}</h5>
                            <div>${statusBadge}${duplicateBadge}</div>
                        </div>
                        <p class="card-text">UID: ${account.uid}</p>
                        ${account.isActive ? `<p class="card-text">Friends: ${account.friendsCount?.toLocaleString() || 'Unknown'}</p>` : ''}
                        ${lastActive}
                        ${suspendedDate}
                    </div>
                </div>
            `;
        }
        
        col.innerHTML = cardContent;
        return col;
    }
    
    function updateCounters() {
        allCount.textContent = currentStats.total;
        activeCount.textContent = currentStats.active;
        suspendedCount.textContent = currentStats.suspended;
        duplicateCount.textContent = currentStats.duplicates;
    }
    
    function clearAll() {
        uidInput.value = '';
        allAccountsContainer.innerHTML = '';
        activeAccountsContainer.innerHTML = '';
        suspendedAccountsContainer.innerHTML = '';
        duplicateAccountsContainer.innerHTML = '';
        currentResults = [];
        currentDuplicates = [];
        currentStats = { total: 0, active: 0, suspended: 0, duplicates: 0 };
        updateCounters();
    }
    
    function exportResults(format) {
        if (currentResults.length === 0) {
            showError('No results to export');
            return;
        }
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'csv':
                content = convertToCSV();
                filename = 'facebook_accounts_status.csv';
                mimeType = 'text/csv';
                break;
            case 'json':
                content = JSON.stringify({
                    results: currentResults,
                    duplicates: currentDuplicates,
                    stats: currentStats
                }, null, 2);
                filename = 'facebook_accounts_status.json';
                mimeType = 'application/json';
                break;
            case 'txt':
                content = convertToTXT();
                filename = 'facebook_accounts_status.txt';
                mimeType = 'text/plain';
                break;
        }
        
        downloadFile(content, filename, mimeType);
    }
    
    function convertToCSV() {
        let csv = 'UID,Name,Status,Duplicate,Last Active,Suspended Since,Friends Count\n';
        
        currentResults.forEach(account => {
            const status = account.isActive ? 'Active' : 'Suspended';
            const duplicate = account.isDuplicate ? 'Yes' : 'No';
            const name = account.name || '';
            const lastActive = account.lastActive ? new Date(account.lastActive).toISOString() : '';
            const suspendedDate = account.suspensionDate ? new Date(account.suspensionDate).toISOString() : '';
            const friendsCount = account.friendsCount || '';
            
            csv += `"${account.uid}","${name}","${status}","${duplicate}","${lastActive}","${suspendedDate}","${friendsCount}"\n`;
        });
        
        return csv;
    }
    
    function convertToTXT() {
        let txt = 'Facebook Account Status Report\n\n';
        txt += `Total Accounts: ${currentStats.total}\n`;
        txt += `Active: ${currentStats.active}\n`;
        txt += `Suspended: ${currentStats.suspended}\n`;
        txt += `Duplicates: ${currentStats.duplicates}\n\n`;
        
        txt += 'ACCOUNT DETAILS:\n';
        txt += '----------------------------------------\n';
        
        currentResults.forEach(account => {
            txt += `UID: ${account.uid}\n`;
            txt += `Name: ${account.name || 'Unknown'}\n`;
            txt += `Status: ${account.isActive ? 'Active' : 'Suspended'}\n`;
            txt += `Duplicate: ${account.isDuplicate ? 'Yes' : 'No'}\n`;
            
            if (account.isActive && account.lastActive) {
                txt += `Last Active: ${new Date(account.lastActive).toLocaleString()}\n`;
            }
            
            if (account.isSuspended && account.suspensionDate) {
                txt += `Suspended Since: ${new Date(account.suspensionDate).toLocaleString()}\n`;
            }
            
            if (account.isActive) {
                txt += `Friends Count: ${account.friendsCount?.toLocaleString() || 'Unknown'}\n`;
            }
            
            txt += '----------------------------------------\n';
        });
        
        if (currentDuplicates.length > 0) {
            txt += '\nDUPLICATE ACCOUNTS:\n';
            txt += '----------------------------------------\n';
            
            currentDuplicates.forEach(dup => {
                txt += `UID: ${dup.uid} (appears ${dup.count} times)\n`;
            });
        }
        
        return txt;
    }
    
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container').prepend(alert);
    }
});
