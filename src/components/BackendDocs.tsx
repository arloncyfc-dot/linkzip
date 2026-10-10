import { useState } from 'react';
import { Database, Server, Code, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface BackendDocsProps {
  setCurrentPage: (page: string) => void;
}

export default function BackendDocs({ setCurrentPage }: BackendDocsProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('database');

  const handleCopy = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const dbSchema = `-- Database: linkzip_db
CREATE DATABASE IF NOT EXISTS linkzip_db;
USE linkzip_db;

-- Tabel Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    plan ENUM('free','basic','pro','enterprise') DEFAULT 'free',
    api_key VARCHAR(64) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel URLs
CREATE TABLE urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    custom_alias VARCHAR(50) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    clicks INT DEFAULT 0,
    expires_at DATETIME DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id)
);

-- Tabel Clicks/Analytics
CREATE TABLE url_clicks (
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
);

-- Tabel Subscriptions
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan ENUM('free','basic','pro','enterprise') NOT NULL,
    status ENUM('active','cancelled','expired') DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Plans
CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    url_limit INT DEFAULT -1,
    click_limit INT DEFAULT -1,
    custom_alias BOOLEAN DEFAULT FALSE,
    analytics BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    custom_domain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO plans (name, price, url_limit, click_limit, custom_alias, analytics, api_access, custom_domain) VALUES
('Free', 0, 50, 1000, FALSE, FALSE, FALSE, FALSE),
('Basic', 29000, 500, 50000, TRUE, TRUE, FALSE, FALSE),
('Pro', 79000, -1, -1, TRUE, TRUE, TRUE, TRUE),
('Enterprise', 199000, -1, -1, TRUE, TRUE, TRUE, TRUE);`;

  const configPHP = `<?php
// config/database.php
class Database {
    private $host = "localhost";
    private $db_name = "linkzip_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        return $this->conn;
    }
}
?>`;

  const authPHP = `<?php
// api/auth.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'POST' && $action === 'register') {
    $data = json_decode(file_get_contents("php://input"));
    
    $name = $data->name ?? '';
    $email = $data->email ?? '';
    $password = $data->password ?? '';
    
    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Semua field harus diisi"]);
        exit;
    }
    
    // Check existing email
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email sudah terdaftar"]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user
    $stmt = $db->prepare("INSERT INTO users (name, email, password, plan) VALUES (?, ?, ?, 'free')");
    $stmt->execute([$name, $email, $hashedPassword]);
    
    $userId = $db->lastInsertId();
    
    // Generate JWT token
    $token = bin2hex(random_bytes(32));
    
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "plan" => "free",
            "token" => $token
        ]
    ]);
}

if ($method === 'POST' && $action === 'login') {
    $data = json_decode(file_get_contents("php://input"));
    
    $email = $data->email ?? '';
    $password = $data->password ?? '';
    
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
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "plan" => $user['plan'],
            "token" => $token
        ]
    ]);
}
?>`;

  const urlPHP = `<?php
// api/urls.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Generate short code
function generateShortCode($length = 6) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

// CREATE - Shorten URL
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $userId = $data->user_id ?? null;
    $originalUrl = $data->url ?? '';
    $customAlias = $data->custom_alias ?? null;
    
    if (empty($originalUrl)) {
        http_response_code(400);
        echo json_encode(["error" => "URL harus diisi"]);
        exit;
    }
    
    // Validate URL
    if (!filter_var($originalUrl, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(["error" => "Format URL tidak valid"]);
        exit;
    }
    
    // Check user plan limits
    if ($userId) {
        $stmt = $db->prepare("SELECT plan FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        $stmt = $db->prepare("SELECT url_limit FROM plans WHERE name = ?");
        $stmt->execute([$user['plan']]);
        $plan = $stmt->fetch();
        
        if ($plan['url_limit'] > 0) {
            $stmt = $db->prepare("SELECT COUNT(*) as total FROM urls WHERE user_id = ? AND DATE(created_at) = CURDATE()");
            $stmt->execute([$userId]);
            $count = $stmt->fetch();
            
            if ($count['total'] >= $plan['url_limit']) {
                http_response_code(429);
                echo json_encode(["error" => "Batas URL harian tercapai"]);
                exit;
            }
        }
    }
    
    // Generate or validate short code
    if ($customAlias) {
        $stmt = $db->prepare("SELECT id FROM urls WHERE short_code = ?");
        $stmt->execute([$customAlias]);
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Alias sudah digunakan"]);
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
    
    // Insert URL
    $stmt = $db->prepare("INSERT INTO urls (user_id, original_url, short_code, title) VALUES (?, ?, ?, ?)");
    $title = parse_url($originalUrl, PHP_URL_HOST);
    $stmt->execute([$userId, $originalUrl, $shortCode, $title]);
    
    echo json_encode([
        "success" => true,
        "data" => [
            "short_code" => $shortCode,
            "short_url" => "https://lnk.zip/" . $shortCode,
            "original_url" => $originalUrl
        ]
    ]);
}

// READ - Get all URLs for user
if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    
    $stmt = $db->prepare("SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $urls = $stmt->fetchAll();
    
    echo json_encode(["data" => $urls]);
}

// DELETE - Remove URL
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    $urlId = $data->id ?? null;
    $userId = $data->user_id ?? null;
    
    $stmt = $db->prepare("DELETE FROM urls WHERE id = ? AND user_id = ?");
    $stmt->execute([$urlId, $userId]);
    
    echo json_encode(["success" => true]);
}
?>`;

  const redirectPHP = `<?php
// redirect.php - Handle short URL redirects
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get short code from URL
$request = $_SERVER['REQUEST_URI'];
$shortCode = trim(str_replace('/', '', $request));

if (empty($shortCode)) {
    header("Location: /");
    exit;
}

// Find URL
$stmt = $db->prepare("SELECT * FROM urls WHERE short_code = ? AND is_active = TRUE");
$stmt->execute([$shortCode]);
$url = $stmt->fetch();

if (!$url) {
    http_response_code(404);
    include '404.html';
    exit;
}

// Check expiration
if ($url['expires_at'] && strtotime($url['expires_at']) < time()) {
    http_response_code(410);
    echo json_encode(["error" => "Link sudah kedaluwarsa"]);
    exit;
}

// Log click
$stmt = $db->prepare("INSERT INTO url_clicks (url_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)");
$stmt->execute([
    $url['id'],
    $_SERVER['REMOTE_ADDR'],
    $_SERVER['HTTP_USER_AGENT'],
    $_SERVER['HTTP_REFERER'] ?? null
]);

// Update click count
$stmt = $db->prepare("UPDATE urls SET clicks = clicks + 1 WHERE id = ?");
$stmt->execute([$url['id']]);

// Redirect
header("Location: " . $url['original_url'], true, 301);
exit;
?>`;

  const htaccess = `# .htaccess - URL Rewriting
RewriteEngine On
RewriteBase /

# Redirect short URLs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([a-zA-Z0-9]{4,20})$ redirect.php?code=$1 [L,QSA]

# API routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1.php [L,QSA]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>`;

  const sections = [
    {
      id: 'database',
      title: '1. Database Schema (MySQL)',
      icon: <Database className="w-5 h-5" />,
      code: dbSchema,
      lang: 'sql',
    },
    {
      id: 'config',
      title: '2. Database Config (PHP)',
      icon: <Server className="w-5 h-5" />,
      code: configPHP,
      lang: 'php',
    },
    {
      id: 'auth',
      title: '3. Authentication API',
      icon: <Code className="w-5 h-5" />,
      code: authPHP,
      lang: 'php',
    },
    {
      id: 'urls',
      title: '4. URL Management API',
      icon: <Code className="w-5 h-5" />,
      code: urlPHP,
      lang: 'php',
    },
    {
      id: 'redirect',
      title: '5. Redirect Handler',
      icon: <Code className="w-5 h-5" />,
      code: redirectPHP,
      lang: 'php',
    },
    {
      id: 'htaccess',
      title: '6. .htaccess (URL Rewriting)',
      icon: <Server className="w-5 h-5" />,
      code: htaccess,
      lang: 'apache',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-blue-600 text-sm font-medium mb-4 hover:underline"
          >
            ← Kembali ke Beranda
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            📦 Backend Setup Guide
          </h1>
          <p className="text-gray-600">
            Panduan lengkap setup backend PHP & MySQL untuk LinkZip URL Shortener.
            Copy kode berikut untuk deploy ke server hosting Anda.
          </p>
        </div>

        {/* Server Requirements */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Server Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'PHP 7.4 atau lebih baru',
              'MySQL 5.7+ / MariaDB 10.3+',
              'Apache dengan mod_rewrite',
              'SSL Certificate (Let\'s Encrypt)',
              'PDO Extension enabled',
              'Min. 512MB RAM',
            ].map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {req}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              💡 <strong>Rekomendasi Hosting:</strong> Niagahoster, Hostinger, atau DigitalOcean.
              Pastikan memilih paket yang mendukung PHP & MySQL.
            </p>
          </div>
        </div>

        {/* File Structure */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📁 Struktur File</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`linkzip/
├── config/
│   └── database.php
├── api/
│   ├── auth.php
│   ├── urls.php
│   └── analytics.php
├── redirect.php
├── .htaccess
├── index.html (frontend)
└── 404.html`}
          </pre>
        </div>

        {/* Code Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">{section.icon}</div>
                  <span className="font-medium text-gray-900">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(section.code, section.id); }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy code"
                  >
                    {copiedSection === section.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === section.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSection === section.id && (
                <div className="border-t border-gray-100">
                  <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed max-h-96 overflow-y-auto">
                    <code>{section.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Deployment Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Langkah Deploy</h2>
          <ol className="space-y-3">
            {[
              'Upload semua file ke server hosting via FTP/cPanel',
              'Buat database MySQL di phpMyAdmin',
              'Import database schema (jalankan SQL di atas)',
              'Edit config/database.php dengan kredensial database Anda',
              'Pastikan .htaccess aktif (mod_rewrite enabled)',
              'Setup SSL certificate (bisa pakai Let\'s Encrypt gratis)',
              'Upload file frontend (hasil build) ke root directory',
              'Test akses ke domain Anda',
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Payment Integration Note */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-5 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">💳 Integrasi Pembayaran</h2>
          <p className="text-sm text-gray-600 mb-3">
            Untuk fitur langganan, Anda bisa mengintegrasikan payment gateway Indonesia:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Midtrans', 'Xendit', 'Tripay', 'DOKU', 'iPaymu'].map((gw) => (
              <span key={gw} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                {gw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
