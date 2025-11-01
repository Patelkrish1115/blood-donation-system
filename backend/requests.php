<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['search'])) {
            $blood_group = $_GET['blood_group'] ?? '';
            $city = $_GET['city'] ?? '';
            
            $sql = "SELECT * FROM requests WHERE 1=1";
            if (!empty($blood_group)) $sql .= " AND blood_group = '" . $conn->real_escape_string($blood_group) . "'";
            if (!empty($city)) $sql .= " AND city LIKE '%" . $conn->real_escape_string($city) . "%'";
            $sql .= " ORDER BY created_at DESC";
        } else {
            $sql = "SELECT * FROM requests ORDER BY created_at DESC";
        }
        
        $result = $conn->query($sql);
        $requests = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $requests[] = $row;
            }
        }
        
        echo json_encode(['success' => true, 'data' => $requests, 'count' => count($requests)]);
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO requests (patient_name, phone, email, blood_group, units_required, required_date, hospital_name, city, state, urgency, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $status = 'Pending';
        
        $stmt->bind_param("ssssisssssss", 
            $data['patient_name'], 
            $data['phone'], 
            $data['email'], 
            $data['blood_group'],
            $data['units_required'],
            $data['required_date'],
            $data['hospital_name'],
            $data['city'],
            $data['state'],
            $data['urgency'],
            $data['message'],
            $status
        );
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Request submitted', 'request_id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['id']) && isset($data['status'])) {
            $stmt = $conn->prepare("UPDATE requests SET status = ? WHERE id = ?");
            $stmt->bind_param("si", $data['status'], $data['id']);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Status updated']);
            } else {
                echo json_encode(['success' => false, 'error' => $stmt->error]);
            }
            $stmt->close();
        }
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("DELETE FROM requests WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Request deleted']);
            } else {
                echo json_encode(['success' => false, 'error' => $stmt->error]);
            }
            $stmt->close();
        }
        break;
}

$conn->close();
?>
