async function checkUIDs() {
    const uids = getUids();
    if (uids.length === 0) {
        alert("Please enter at least one UID");
        return;
    }
    
    const resultItems = document.getElementById('resultItems');
    resultItems.innerHTML = '';
    
    const checkId = ++currentCheckId;
    let completed = 0;
    
    document.getElementById('progressBar').style.width = '0%';
    
    // Create placeholder items
    uids.forEach((uid, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <div>${index + 1}</div>
            <div>${uid}</div>
            <div class="status loading">Checking...</div>
        `;
        resultItems.appendChild(item);
    });
    
    try {
        const response = await fetch('check_multi.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `uids=${encodeURIComponent(JSON.stringify(uids))}`
        });
        
        const data = await response.json();
        
        if(data.error) {
            alert(data.error);
            return;
        }
        
        // Update results
        data.results.forEach((result, index) => {
            const statusElement = resultItems.children[index].querySelector('.status');
            statusElement.textContent = result.status.charAt(0).toUpperCase() + result.status.slice(1);
            statusElement.className = `status ${result.status}`;
            
            completed++;
            const progress = (completed / uids.length) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;
            updateStats();
        });
        
    } catch (error) {
        alert("Error checking UIDs");
    }
}

