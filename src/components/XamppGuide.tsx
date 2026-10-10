import { useState } from 'react';
import { 
  Database, Server, Code, Copy, Check, ChevronDown, ChevronUp, 
  Download, Folder, FileText, AlertCircle, CheckCircle2, Terminal
} from 'lucide-react';

interface XamppGuideProps {
  setCurrentPage: (page: string) => void;
}

export default function XamppGuide({ setCurrentPage }: XamppGuideProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>('step1');

  const handleCopy = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleStep = (step: string) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  // === FILE KODE PHP ===

  const databaseConfig = `<?php
// ============================================
// File: C:/xampp/htdocs/linkzip/config/database.php
// ============================================
class Database {
    private $host = "localhost";
    private $db_name = "linkzip_db";
    private $username = "root";
    private $password = "";  // Default XAMPP password kosong
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Koneksi database gagal: " . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>`;

  const sqlSchema = `-- ============================================
-- File: linkzip_db.sql
-- Jalankan di phpMyAdmin (http://localhost/phpmyadmin)
-- ============================================

CREATE DATABASE IF NOT EXISTS linkzip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE linkzip_db;

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    plan ENUM('free','basic','pro','enterprise') DEFAULT 'free',
    api_key VARCHAR(64) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Tabel URLs
CREATE TABLE IF NOT EXISTS urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    custom_alias VARCHAR(50) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    clicks INT DEFAULT 0,
    expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Tabel Clicks/Analytics
CREATE TABLE IF NOT EXISTS url_clicks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(50),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    INDEX idx_url_id (url_id),
    INDEX idx_clicked_at (clicked_at)
) ENGINE=InnoDB;

-- Tabel Plans
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    url_limit INT DEFAULT -1,
    click_limit INT DEFAULT -1,
    custom_alias TINYINT(1) DEFAULT 0,
    analytics TINYINT(1) DEFAULT 0,
    api_access TINYINT(1) DEFAULT 0,
    custom_domain TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan ENUM('free','basic','pro','enterprise') NOT NULL,
    status ENUM('active','cancelled','expired') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert default plans
INSERT INTO plans (name, price, url_limit, click_limit, custom_alias, analytics, api_access, custom_domain) VALUES
('Free', 0, 50, 1000, 0, 0, 0, 0),
('Basic', 29000, 500, 50000, 1, 1, 0, 0),
('Pro', 79000, -1, -1, 1, 1, 1, 1),
('Enterprise', 199000, -1, -1, 1, 1, 1, 1);

-- Insert demo user (password: demo123)
INSERT INTO users (name, email, password, plan) VALUES
('Demo User', 'demo@linkzip.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2u8jN4g6yWi', 'pro');`;

  const authApi = `<?php
// ============================================
// File: C:/xampp/htdocs/linkzip/api/auth.php
// ============================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ============ REGISTER ============
if ($method === 'POST' && $action === 'register') {
    $data = json_decode(file_get_contents("php://input"));
    
    $name = trim($data->name ?? '');
    $email = trim($data->email ?? '');
    $password = $data->password ?? '';
    
    // Validasi
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Semua field harus diisi"]);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Format email tidak valid"]);
        exit;
    }
    
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["error" => "Password minimal 6 karakter"]);
        exit;
    }
    
    // Cek email sudah terdaftar
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email sudah terdaftar"]);
        exit;
    }
    
    // Hash password & insert
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $apiKey = bin2hex(random_bytes(32));
    
    $stmt = $db->prepare("INSERT INTO users (name, email, password, api_key, plan) VALUES (?, ?, ?, ?, 'free')");
    $stmt->execute([$name, $email, $hashedPassword, $apiKey]);
    
    $userId = $db->lastInsertId();
    $token = bin2hex(random_bytes(32));
    
    echo json_encode([
        "success" => true,
        "message" => "Registrasi berhasil",
        "user" => [
            "id" => (int)$userId,
            "name" => $name,
            "email" => $email,
            "plan" => "free",
            "api_key" => $apiKey,
            "token" => $token
        ]
    ]);
}

// ============ LOGIN ============
if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    
    $email = trim($data->email ?? '');
    $password = $data->password ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email dan password harus diisi"]);
        exit;
    }
    
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Email atau password salah"]);
        exit;
    }
    
    $token = bin2hex(random_bytes(32));
    
    echo json_encode([
        "success" => true,
        "message" => "Login berhasil",
        "user" => [
            "id" => (int)$user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "plan" => $user['plan'],
            "api_key" => $user['api_key'],
            "token" => $token
        ]
    ]);
}

// ============ GET PROFILE ============
if ($method === 'GET' && $action === 'profile') {
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(["error" => "User ID diperlukan"]);
        exit;
    }
    
    $stmt = $db->prepare("SELECT id, name, email, plan, api_key, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(["error" => "User tidak ditemukan"]);
        exit;
    }
    
    echo json_encode(["success" => true, "user" => $user]);
}
?>`;

  const urlsApi = `<?php
// ============================================
// File: C:/xampp/htdocs/linkzip/api/urls.php
// ============================================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Generate random short code
function generateShortCode($length = 6) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

// ============ CREATE - Perpendek URL ============
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $userId = $data->user_id ?? null;
    $originalUrl = trim($data->url ?? '');
    $customAlias = trim($data->custom_alias ?? '');
    $title = trim($data->title ?? '');
    
    if (empty($originalUrl)) {
        http_response_code(400);
        echo json_encode(["error" => "URL harus diisi"]);
        exit;
    }
    
    if (!filter_var($originalUrl, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(["error" => "Format URL tidak valid"]);
        exit;
    }
    
    // Cek limit user
    if ($userId) {
        $stmt = $db->prepare("SELECT plan FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            $stmt = $db->prepare("SELECT url_limit FROM plans WHERE name = ?");
            $stmt->execute([$user['plan']]);
            $plan = $stmt->fetch();
            
            if ($plan && $plan['url_limit'] > 0) {
                $stmt = $db->prepare("SELECT COUNT(*) as total FROM urls WHERE user_id = ?");
                $stmt->execute([$userId]);
                $count = $stmt->fetch();
                
                if ($count['total'] >= $plan['url_limit']) {
                    http_response_code(429);
                    echo json_encode(["error" => "Batas URL tercapai ({$plan['url_limit']}). Upgrade paket untuk menambah limit."]);
                    exit;
                }
            }
            
            // Cek custom alias butuh plan basic+
            if (!empty($customAlias)) {
                $stmt = $db->prepare("SELECT custom_alias FROM plans WHERE name = ?");
                $stmt->execute([$user['plan']]);
                $planInfo = $stmt->fetch();
                if (!$planInfo['custom_alias']) {
                    http_response_code(403);
                    echo json_encode(["error" => "Custom alias hanya tersedia untuk paket Basic ke atas"]);
                    exit;
                }
            }
        }
    }
    
    // Generate atau validasi short code
    if (!empty($customAlias)) {
        // Validasi custom alias
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $customAlias)) {
            http_response_code(400);
            echo json_encode(["error" => "Alias hanya boleh huruf, angka, dash, dan underscore"]);
            exit;
        }
        
        $stmt = $db->prepare("SELECT id FROM urls WHERE short_code = ?");
        $stmt->execute([$customAlias]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Alias sudah digunakan, coba yang lain"]);
            exit;
        }
        $shortCode = $customAlias;
    } else {
        do {
            $shortCode = generateShortCode();
            $stmt = $db->prepare("SELECT id FROM urls WHERE short_code = ?");
            $stmt->execute([$shortCode]);
        } while ($stmt->rowCount() > 0);
    }
    
    // Extract title dari URL jika kosong
    if (empty($title)) {
        $parsed = parse_url($originalUrl);
        $title = $parsed['host'] ?? $originalUrl;
    }
    
    // Insert ke database
    $stmt = $db->prepare("INSERT INTO urls (user_id, original_url, short_code, custom_alias, title) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $originalUrl, $shortCode, $customAlias ?: null, $title]);
    
    $baseUrl = "http://" . $_SERVER['HTTP_HOST'] . "/linkzip";
    
    echo json_encode([
        "success" => true,
        "data" => [
            "id" => (int)$db->lastInsertId(),
            "short_code" => $shortCode,
            "short_url" => $baseUrl . "/" . $shortCode,
            "original_url" => $originalUrl,
            "title" => $title,
            "created_at" => date('Y-m-d H:i:s')
        ]
    ]);
}

// ============ READ - Daftar URL user ============
if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;
    
    $stmt = $db->prepare("SELECT * FROM urls WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->execute([$userId, $limit, $offset]);
    $urls = $stmt->fetchAll();
    
    // Total count
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM urls WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$userId]);
    $total = $stmt->fetch()['total'];
    
    $baseUrl = "http://" . $_SERVER['HTTP_HOST'] . "/linkzip";
    
    // Tambah short_url ke setiap record
    foreach ($urls as &$url) {
        $url['short_url'] = $baseUrl . "/" . $url['short_code'];
        $url['id'] = (int)$url['id'];
        $url['clicks'] = (int)$url['clicks'];
    }
    
    echo json_encode([
        "success" => true,
        "data" => $urls,
        "pagination" => [
            "total" => (int)$total,
            "page" => $page,
            "limit" => $limit,
            "total_pages" => ceil($total / $limit)
        ]
    ]);
}

// ============ DELETE - Hapus URL ============
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    $urlId = $data->id ?? null;
    $userId = $data->user_id ?? null;
    
    if (!$urlId || !$userId) {
        http_response_code(400);
        echo json_encode(["error" => "ID URL dan User ID diperlukan"]);
        exit;
    }
    
    $stmt = $db->prepare("DELETE FROM urls WHERE id = ? AND user_id = ?");
    $stmt->execute([$urlId, $userId]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "URL berhasil dihapus"]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "URL tidak ditemukan"]);
    }
}
?>`;

  const redirectHandler = `<?php
// ============================================
// File: C:/xampp/htdocs/linkzip/redirect.php
// ============================================
require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Ambil short code dari URL
$shortCode = $_GET['code'] ?? '';

if (empty($shortCode)) {
    header("Location: /linkzip/");
    exit;
}

// Cari URL di database
$stmt = $db->prepare("SELECT * FROM urls WHERE short_code = ? AND is_active = 1");
$stmt->execute([$shortCode]);
$url = $stmt->fetch();

if (!$url) {
    http_response_code(404);
    ?>
    <!DOCTYPE html>
    <html>
    <head><title>404 - Link tidak ditemukan</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f3f4f6; }
        .container { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #ef4444; font-size: 48px; margin: 0; }
        p { color: #6b7280; margin-top: 10px; }
        a { color: #3b82f6; text-decoration: none; }
    </style>
    </head>
    <body>
        <div class="container">
            <h1>404</h1>
            <p>Link yang Anda cari tidak ditemukan atau sudah dihapus.</p>
            <p><a href="/linkzip/">← Kembali ke Beranda</a></p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Cek masa berlaku
if ($url['expires_at'] && strtotime($url['expires_at']) < time()) {
    http_response_code(410);
    echo "Link sudah kedaluwarsa.";
    exit;
}

// Deteksi device
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$deviceType = 'desktop';
if (preg_match('/Mobile|Android|iPhone/i', $userAgent)) {
    $deviceType = 'mobile';
} elseif (preg_match('/Tablet|iPad/i', $userAgent)) {
    $deviceType = 'tablet';
}

// Deteksi browser sederhana
$browser = 'Unknown';
if (preg_match('/Chrome/i', $userAgent)) $browser = 'Chrome';
elseif (preg_match('/Firefox/i', $userAgent)) $browser = 'Firefox';
elseif (preg_match('/Safari/i', $userAgent)) $browser = 'Safari';
elseif (preg_match('/Edge/i', $userAgent)) $browser = 'Edge';

// Deteksi OS
$os = 'Unknown';
if (preg_match('/Windows/i', $userAgent)) $os = 'Windows';
elseif (preg_match('/Mac/i', $userAgent)) $os = 'macOS';
elseif (preg_match('/Linux/i', $userAgent)) $os = 'Linux';
elseif (preg_match('/Android/i', $userAgent)) $os = 'Android';
elseif (preg_match('/iPhone|iPad/i', $userAgent)) $os = 'iOS';

// Catat klik
$stmt = $db->prepare("INSERT INTO url_clicks (url_id, ip_address, user_agent, referrer, device_type, browser, os) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $url['id'],
    $_SERVER['REMOTE_ADDR'],
    $userAgent,
    $_SERVER['HTTP_REFERER'] ?? null,
    $deviceType,
    $browser,
    $os
]);

// Update jumlah klik
$stmt = $db->prepare("UPDATE urls SET clicks = clicks + 1 WHERE id = ?");
$stmt->execute([$url['id']]);

// Redirect ke URL asli
header("Location: " . $url['original_url'], true, 301);
exit;
?>`;

  const htaccessCode = `# ============================================
# File: C:/xampp/htdocs/linkzip/.htaccess
# ============================================
RewriteEngine On
RewriteBase /linkzip/

# Jika file/folder ada, serve langsung
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Redirect short URLs ke redirect.php
RewriteRule ^([a-zA-Z0-9_-]{3,20})$ redirect.php?code=$1 [L,QSA]

# API routes
RewriteRule ^api/auth$ api/auth.php [L,QSA]
RewriteRule ^api/urls$ api/urls.php [L,QSA]

# Security
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>`;

  const indexPhp = `<?php
// ============================================
// File: C:/xampp/htdocs/linkzip/index.php
// ============================================
// Frontend akan di-serve dari sini
// File HTML/CSS/JS hasil build React di folder ini
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkZip - URL Shortener</title>
    <meta name="description" content="Perpendek URL Anda dengan mudah. Platform URL shortener terpercaya.">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .form { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .input-group { display: flex; gap: 10px; margin-bottom: 15px; }
        input { flex: 1; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 15px; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #3b82f6; }
        button { padding: 14px 24px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s; white-space: nowrap; }
        button:hover { transform: scale(1.02); }
        .result { margin-top: 15px; padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; display: none; }
        .result a { color: #2563eb; font-weight: 600; font-size: 18px; word-break: break-all; }
        .error { color: #ef4444; font-size: 14px; margin-top: 10px; display: none; }
        .api-info { margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; text-align: left; }
        .api-info h3 { color: #1e40af; margin-bottom: 10px; }
        .api-info code { background: #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        @media (max-width: 480px) { .input-group { flex-direction: column; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔗 LinkZip</div>
        <p class="subtitle">Perpendek URL Anda secara instan</p>
        
        <div class="form">
            <div class="input-group">
                <input type="url" id="urlInput" placeholder="Tempel URL panjang Anda di sini...">
                <button onclick="shortenUrl()">Perpendek</button>
            </div>
            <div class="error" id="error"></div>
            <div class="result" id="result">
                <p style="font-size:12px;color:#16a34a;margin-bottom:5px;">✅ URL berhasil diperpendek!</p>
                <a id="shortUrl" href="#" target="_blank"></a>
                <br><br>
                <button onclick="copyUrl()" style="font-size:13px;padding:8px 16px;">📋 Salin Link</button>
            </div>
        </div>

        <div class="api-info">
            <h3>🔧 API Endpoint (XAMPP)</h3>
            <p style="margin-bottom:8px;">• Shorten: <code>POST http://localhost/linkzip/api/urls</code></p>
            <p style="margin-bottom:8px;">• List URLs: <code>GET http://localhost/linkzip/api/urls?user_id=1</code></p>
            <p style="margin-bottom:8px;">• Register: <code>POST http://localhost/linkzip/api/auth?action=register</code></p>
            <p>• Login: <code>POST http://localhost/linkzip/api/auth?action=login</code></p>
        </div>
    </div>

    <script>
    function shortenUrl() {
        const url = document.getElementById('urlInput').value;
        const errorEl = document.getElementById('error');
        const resultEl = document.getElementById('result');
        
        errorEl.style.display = 'none';
        resultEl.style.display = 'none';
        
        if (!url) { errorEl.textContent = 'Masukkan URL terlebih dahulu'; errorEl.style.display = 'block'; return; }
        
        try { new URL(url); } catch(e) { errorEl.textContent = 'Format URL tidak valid'; errorEl.style.display = 'block'; return; }
        
        fetch('api/urls', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ url: url, user_id: 1 })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                document.getElementById('shortUrl').href = data.data.short_url;
                document.getElementById('shortUrl').textContent = data.data.short_url;
                resultEl.style.display = 'block';
                document.getElementById('urlInput').value = '';
            } else {
                errorEl.textContent = data.error || 'Terjadi kesalahan';
                errorEl.style.display = 'block';
            }
        })
        .catch(err => { errorEl.textContent = 'Error: ' + err.message; errorEl.style.display = 'block'; });
    }
    
    function copyUrl() {
        const url = document.getElementById('shortUrl').textContent;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link berhasil disalin!');
        });
    }
    
    document.getElementById('urlInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') shortenUrl();
    });
    </script>
</body>
</html>`;

  const steps = [
    {
      id: 'step1',
      title: 'Persiapan XAMPP',
      icon: <Download className="w-5 h-5" />,
      content: null,
      description: 'Download dan install XAMPP di komputer Anda',
    },
    {
      id: 'step2',
      title: 'Buat Struktur Folder',
      icon: <Folder className="w-5 h-5" />,
      content: null,
      description: 'Buat folder project di htdocs',
    },
    {
      id: 'step3',
      title: 'Setup Database MySQL',
      icon: <Database className="w-5 h-5" />,
      content: null,
      description: 'Buat database dan import schema',
    },
    {
      id: 'step4',
      title: 'File Config Database',
      icon: <FileText className="w-5 h-5" />,
      content: databaseConfig,
      description: 'Konfigurasi koneksi database PHP',
    },
    {
      id: 'step5',
      title: 'File API Auth (Login/Register)',
      icon: <Code className="w-5 h-5" />,
      content: authApi,
      description: 'API untuk registrasi dan login user',
    },
    {
      id: 'step6',
      title: 'File API URLs (Shortener)',
      icon: <Code className="w-5 h-5" />,
      content: urlsApi,
      description: 'API untuk memperpendek dan mengelola URL',
    },
    {
      id: 'step7',
      title: 'File Redirect Handler',
      icon: <Code className="w-5 h-5" />,
      content: redirectHandler,
      description: 'Handle redirect dari short URL ke URL asli',
    },
    {
      id: 'step8',
      title: 'File .htaccess',
      icon: <Server className="w-5 h-5" />,
      content: htaccessCode,
      description: 'Konfigurasi URL rewriting Apache',
    },
    {
      id: 'step9',
      title: 'File index.php (Frontend)',
      icon: <FileText className="w-5 h-5" />,
      content: indexPhp,
      description: 'Halaman frontend sederhana (bisa diganti dengan React build)',
    },
    {
      id: 'step10',
      title: 'Testing & Verifikasi',
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: null,
      description: 'Test semua endpoint API',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-600 text-sm font-medium mb-4 hover:underline inline-flex items-center gap-1"
          >
            ← Kembali ke Beranda
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Install di XAMPP
              </h1>
              <p className="text-gray-500 text-sm">Panduan lengkap step-by-step</p>
            </div>
          </div>
        </div>

        {/* Quick Start Info */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Sebelum Mulai</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pastikan XAMPP sudah terinstall di komputer Anda</li>
                <li>• Download XAMPP di <a href="https://www.apachefriends.org/" target="_blank" className="text-blue-600 underline">apachefriends.org</a></li>
                <li>• Aktifkan Apache dan MySQL di XAMPP Control Panel</li>
                <li>• Akses phpMyAdmin di <code className="bg-orange-100 px-1 rounded">http://localhost/phpmyadmin</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Folder Structure */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-500" />
            Struktur Folder di XAMPP
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`C:/xampp/htdocs/linkzip/
├── config/
│   └── database.php          ← Koneksi database
├── api/
│   ├── auth.php              ← Login & Register API
│   └── urls.php              ← URL Shortener API
├── redirect.php              ← Handler redirect short URL
├── .htaccess                 ← URL rewriting rules
└── index.php                 ← Frontend halaman utama`}
          </pre>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              💡 <strong>Path lengkap:</strong> <code className="bg-blue-100 px-1 rounded">C:\xampp\htdocs\linkzip\</code>
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-900 block">{step.title}</span>
                    <span className="text-xs text-gray-500">{step.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step.content && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(step.content!, step.id); }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copy code"
                    >
                      {copiedSection === step.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  {expandedStep === step.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedStep === step.id && (
                <div className="border-t border-gray-100 p-4">
                  {step.id === 'step1' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">1. Download XAMPP dari <a href="https://www.apachefriends.org/" target="_blank" className="text-blue-600 underline">apachefriends.org</a></p>
                      <p className="text-sm text-gray-700">2. Install XAMPP (pilih Apache, MySQL, dan phpMyAdmin)</p>
                      <p className="text-sm text-gray-700">3. Buka <strong>XAMPP Control Panel</strong></p>
                      <p className="text-sm text-gray-700">4. Klik <strong>Start</strong> pada Apache dan MySQL</p>
                      <div className="bg-gray-100 rounded-lg p-3 mt-2">
                        <p className="text-xs text-gray-600 font-mono">
                          ✅ Apache - Running<br/>
                          ✅ MySQL - Running
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">5. Buka browser, akses <code className="bg-gray-100 px-1 rounded">http://localhost</code> untuk memastikan Apache berjalan</p>
                    </div>
                  )}

                  {step.id === 'step2' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">Buat folder project di lokasi berikut:</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono">
                        C:\xampp\htdocs\linkzip\<br/>
                        C:\xampp\htdocs\linkzip\config\<br/>
                        C:\xampp\htdocs\linkzip\api\
                      </div>
                      <p className="text-sm text-gray-700">Atau via Command Prompt:</p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono">
                        <Terminal className="w-3 h-3 inline mr-1" />
                        mkdir C:\xampp\htdocs\linkzip\config<br/>
                        mkdir C:\xampp\htdocs\linkzip\api
                      </div>
                    </div>
                  )}

                  {step.id === 'step3' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">1. Buka <code className="bg-gray-100 px-1 rounded">http://localhost/phpmyadmin</code></p>
                      <p className="text-sm text-gray-700">2. Klik tab <strong>"SQL"</strong> di menu atas</p>
                      <p className="text-sm text-gray-700">3. Copy & paste kode SQL di bawah, lalu klik <strong>"Go"</strong></p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto mt-2">
                        <pre><code>{sqlSchema}</code></pre>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">4. Verifikasi database <strong>"linkzip_db"</strong> sudah terbuat di sidebar kiri phpMyAdmin</p>
                    </div>
                  )}

                  {step.id === 'step10' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 font-medium">Test semua endpoint di browser atau Postman:</p>
                      
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800 mb-1">✅ Test 1: Buka Frontend</p>
                          <code className="text-xs bg-green-100 px-2 py-1 rounded">http://localhost/linkzip/</code>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800 mb-1">✅ Test 2: Register User (via Postman/cURL)</p>
                          <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
                            POST http://localhost/linkzip/api/auth?action=register
                          </code>
                          <pre className="text-xs mt-2 bg-blue-100 p-2 rounded overflow-x-auto">
{`{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}`}
                          </pre>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-purple-800 mb-1">✅ Test 3: Shorten URL</p>
                          <code className="text-xs bg-purple-100 px-2 py-1 rounded block">
                            POST http://localhost/linkzip/api/urls
                          </code>
                          <pre className="text-xs mt-2 bg-purple-100 p-2 rounded overflow-x-auto">
{`{
  "url": "https://www.google.com",
  "user_id": 1
}`}
                          </pre>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-orange-800 mb-1">✅ Test 4: Redirect</p>
                          <p className="text-xs text-gray-600 mb-1">Buka URL short di browser, contoh:</p>
                          <code className="text-xs bg-orange-100 px-2 py-1 rounded">
                            http://localhost/linkzip/abc123
                          </code>
                          <p className="text-xs text-gray-500 mt-1">Harus redirect ke URL asli</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">✅ Test 5: List URLs</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            GET http://localhost/linkzip/api/urls?user_id=1
                          </code>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>Troubleshooting:</strong>
                        </p>
                        <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                          <li>• Jika error "database not found" → Pastikan sudah import SQL di phpMyAdmin</li>
                          <li>• Jika error 404 pada short URL → Pastikan mod_rewrite aktif di httpd.conf</li>
                          <li>• Jika error 500 → Cek error log di C:\xampp\apache\logs\error.log</li>
                          <li>• Jika API tidak bisa diakses → Pastikan Apache sudah running</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {step.content && (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap"><code>{step.content}</code></pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">🔑 Demo Credentials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-mono text-sm font-medium">demo@linkzip.com</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Password</p>
              <p className="font-mono text-sm font-medium">demo123</p>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">⚡ Quick Test dengan cURL</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Register:</p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`curl -X POST http://localhost/linkzip/api/auth?action=register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'`}
              </pre>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Shorten URL:</p>
              <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`curl -X POST http://localhost/linkzip/api/urls \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://google.com","user_id":1}'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
