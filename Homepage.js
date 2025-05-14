import { useState } from 'react';
import BulkChecker from './BulkChecker';

export default function Home() {
  const [uid, setUid] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const checkSingleUid = async () => {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Facebook UID Checker</h1>
      
      <div className="tabs flex mb-6">
        <button onClick={() => setActiveTab('single')} className={`tab ${activeTab === 'single' ? 'active' : ''}`}>
          Single Check
        </button>
        <button onClick={() => setActiveTab('bulk')} className={`tab ${activeTab === 'bulk' ? 'active' : ''}`}>
          Bulk Check
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="single-checker">
          <div className="flex">
            <input
              type="text"
              placeholder="Enter Facebook UID"
              className="input input-bordered w-full max-w-xs"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
            <button onClick={checkSingleUid} className="btn btn-primary ml-2">
              Check
            </button>
          </div>
          
          {result && (
            <div className={`result mt-4 p-4 rounded ${result.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
              UID: {result.uid} | Status: {result.status}
            </div>
          )}
        </div>
      ) : (
        <BulkChecker />
      )}
    </div>
  );
}

