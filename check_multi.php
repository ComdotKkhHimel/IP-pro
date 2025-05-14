<?php
header('Content-Type: application/json');

if(empty($_POST['uids'])) {
    echo json_encode(['error' => 'No UIDs provided']);
    exit;
}

$uids = json_decode($_POST['uids']);
$results = [];

foreach($uids as $uid) {
    // In a real implementation, you would check each UID against Facebook's API
    // This is a simulation with random results
    $results[] = [
        'uid' => $uid,
        'status' => (rand(0,100) > 30) ? 'active' : 'inactive',
        'timestamp' => time()
    ];
    
    // Simulate some processing time
    usleep(200000); // 0.2 seconds
}

echo json_encode(['results' => $results]);
?>