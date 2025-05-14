const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Facebook API responses
const mockFacebookAPI = async (uid) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
    
    // Simulate different account states
    const status = Math.random();
    let accountStatus;
    
    if (status < 0.7) {
        // 70% chance of active account
        accountStatus = {
            isActive: true,
            isSuspended: false,
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            name: `User${Math.floor(Math.random() * 1000)}`,
            profilePic: `https://i.pravatar.cc/150?u=${uid}`,
            friendsCount: Math.floor(Math.random() * 5000)
        };
    } else if (status < 0.9) {
        // 20% chance of suspended account
        accountStatus = {
            isActive: false,
            isSuspended: true,
            suspensionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            name: `User${Math.floor(Math.random() * 1000)}`,
            profilePic: null,
            friendsCount: 0
        };
    } else {
        // 10% chance of not found (treated as suspended)
        accountStatus = {
            isActive: false,
            isSuspended: true,
            error: "Account not found"
        };
    }
    
    return accountStatus;
};

// Track duplicate UIDs
const findDuplicates = (uids) => {
    const frequency = {};
    const duplicates = [];
    
    uids.forEach(uid => {
        frequency[uid] = (frequency[uid] || 0) + 1;
    });
    
    for (const uid in frequency) {
        if (frequency[uid] > 1) {
            duplicates.push({
                uid,
                count: frequency[uid]
            });
        }
    }
    
    return duplicates;
};

app.post('/check-account-status', async (req, res) => {
    try {
        const { uids } = req.body;
        if (!uids || !Array.isArray(uids)) {
            return res.status(400).json({ error: 'Invalid UIDs provided' });
        }

        // Check for duplicates first
        const duplicates = findDuplicates(uids);
        
        // Process all UIDs (including duplicates)
        const results = await Promise.all(
            uids.map(async (uid) => {
                try {
                    const accountData = await mockFacebookAPI(uid);
                    return {
                        uid,
                        ...accountData,
                        isDuplicate: false // Will be updated later
                    };
                } catch (err) {
                    return {
                        uid,
                        error: err.message,
                        isActive: false,
                        isSuspended: true
                    };
                }
            })
        );
        
        // Mark duplicates in results
        const duplicateUids = duplicates.map(d => d.uid);
        results.forEach(result => {
            if (duplicateUids.includes(result.uid)) {
                result.isDuplicate = true;
            }
        });

        res.json({ 
            success: true, 
            results,
            duplicates,
            stats: {
                total: results.length,
                active: results.filter(r => r.isActive).length,
                suspended: results.filter(r => r.isSuspended).length,
                duplicates: duplicates.length
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

