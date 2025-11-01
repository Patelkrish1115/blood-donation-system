<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all contacts
        $sql = "SELECT * FROM contacts ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $contacts = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $contacts[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $contacts
        ]);
        break;
    
    case 'POST':
        // Add new contact
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)");
        
        $status = 'Pending';
        
        $stmt->bind_param("ssssss", 
            $data['name'], 
            $data['email'], 
            $data['phone'], 
            $data['subject'],
            $data['message'],
            $status
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Message sent successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $stmt->error
            ]);
        }
        
        $stmt->close();
        break;
}

$conn->close();
?>
