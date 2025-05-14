const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  checkSingleUid: async (uid) => {
    try {
      const response = await axios.get(`https://facebook.com/${uid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const $ = cheerio.load(response.data);
      
      // Check for suspension markers
      if ($('title').text().includes('Content Not Found') || 
          response.data.includes('account disabled')) {
        return 'suspended';
      }
      
      return 'active';
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return 'invalid';
      }
      return 'error';
    }
  },
  
  processBulkFile: async (file) => {
    // Parse CSV and check each UID
    const uids = parseCsv(file);
    const results = [];
    
    for (const uid of uids) {
      const status = await this.checkSingleUid(uid);
      results.push({ uid, status });
    }
    
    return results;
  }
};

