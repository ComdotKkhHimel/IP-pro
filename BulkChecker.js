export default function BulkChecker() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const processBulkCheck = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/bulk-check', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setResults(data);
    setIsLoading(false);
  };

  return (
    <div>
      <input type="file" accept=".csv,.txt" onChange={handleFileUpload} />
      <button onClick={processBulkCheck} disabled={!file || isLoading}>
        {isLoading ? 'Processing...' : 'Check UIDs'}
      </button>
      
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>UID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index}>
                <td>{item.uid}</td>
                <td className={item.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

