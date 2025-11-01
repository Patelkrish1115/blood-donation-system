<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all donors or search
        if (isset($_GET['search'])) {
            $blood_group = $_GET['blood_group'] ?? '';
            $city = $_GET['city'] ?? '';
            
            $sql = "SELECT * FROM donors WHERE 1=1";
            
            if (!empty($blood_group)) {
                $sql .= " AND blood_group = '" . $conn->real_escape_string($blood_group) . "'";
            }
            
            if (!empty($city)) {
                $sql .= " AND city LIKE '%" . $conn->real_escape_string($city) . "%'";
            }
            
            $sql .= " ORDER BY created_at DESC";
        } else {
            $sql = "SELECT * FROM donors ORDER BY created_at DESC";
        }
        
        $result = $conn->query($sql);
        $donors = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $donors[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $donors,
            'count' => count($donors)
        ]);
        break;
    
    case 'POST':
        // Add new donor
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (empty($data['full_name']) || empty($data['email']) || empty($data['blood_group'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Missing required fields'
            ]);
            exit;
        }
        
        // Check if email already exists
        $check_email = $conn->prepare("SELECT id FROM donors WHERE email = ?");
        $check_email->bind_param("s", $data['email']);
        $check_email->execute();
        $check_result = $check_email->get_result();
        
        if ($check_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Email already registered'
            ]);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO donors (full_name, email, phone, blood_group, gender, age, city, state, pincode, address, availability, last_donation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sssssissssss", 
            $data['full_name'], 
            $data['email'], 
            $data['phone'], 
            $data['blood_group'],
            $data['gender'],
            $data['age'],
            $data['city'],
            $data['state'],
            $data['pincode'],
            $data['address'],
            $data['availability'],
            $data['last_donation_date']
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Donor registered successfully',
                'donor_id' => $conn->insert_id
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => $stmt->error
            ]);
        }
        
        $stmt->close();
        break;
    
    case 'DELETE':
        // Delete donor
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $sql = "DELETE FROM donors WHERE id = $id";
            
            if ($conn->query($sql)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Donor deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => $conn->error
                ]);
            }
        }
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        break;
}

$conn->close();
?>
