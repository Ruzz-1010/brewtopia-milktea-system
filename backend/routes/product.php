<?php
// backend/routes/product.php

header("Content-Type: application/json");

try {
    $productsCollection = $database->getCollection('products');
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $products = $productsCollection->find()->toArray();
            echo json_encode([
                "status" => "success",
                "data" => $products
            ]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $result = $productsCollection->insertOne($input);
            
            echo json_encode([
                "status" => "success",
                "message" => "Product created",
                "id" => (string)$result->getInsertedId()
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>