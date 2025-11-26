<?php
// backend/public/index.php

// CORS headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Load dependencies
    require_once __DIR__ . '/../vendor/autoload.php';
    require_once __DIR__ . '/../config/database.php';
    
    // Get request details
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Simple router
    $routes = [
        'GET:/api/products' => '../routes/product.php',
        'POST:/api/products' => '../routes/product.php',
        'GET:/api/orders' => '../routes/order.php',
        'POST:/api/orders' => '../routes/order.php',
        'GET:/api/inventory' => '../routes/inventory.php',
        // Add more routes as needed
    ];
    
    $route_key = $method . ':' . $path;
    
    if (isset($routes[$route_key])) {
        require_once __DIR__ . '/' . $routes[$route_key];
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Route not found: " . $path,
            "method" => $method
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>