<?php
// backend/config/database.php

class Database {
    private $conn;
    private $db_name = "brewtopia_milktea";
    
    public function __construct() {
        $this->connect();
    }
    
    public function connect() {
        try {
            // For PRODUCTION (Render) - will use environment variables
            $mongo_url = getenv('MONGO_URL');
            
            if (!$mongo_url) {
                // For LOCAL development - USING YOUR ACTUAL CONNECTION STRING
                $mongo_url = "mongodb+srv://brewtopia_admin:BrewtopiaMilkTea@brewtopia.mznffmc.mongodb.net/?retryWrites=true&w=majority&appName=Brewtopia";
            }
            
            $this->conn = new MongoDB\Client($mongo_url);
            
            // Test connection
            $this->conn->listDatabases();
            error_log("✅ MongoDB Connected Successfully to: " . $this->db_name);
            
            return $this->conn;
            
        } catch (MongoDB\Driver\Exception\Exception $e) {
            error_log("❌ MongoDB Connection Failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getDatabase() {
        return $this->conn->selectDatabase($this->db_name);
    }
    
    public function getCollection($collection_name) {
        return $this->getDatabase()->selectCollection($collection_name);
    }
}

// Global database instance
$database = new Database();
?>