<?php
//copyright@abirxdhack
//git profile https://github.com/abirxdhack
//repo url https://github.com/abirxdhack/SmartEduResource
error_reporting(E_ALL); ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const ADMIN_USER = 'username';
const ADMIN_HASH = 'generateyourownhash';
const MAX_COVER  = 3145728;

$ROOT = __DIR__; $PRIV = $ROOT . '/storage';
foreach ([$ROOT . '/data', $PRIV, $PRIV . '/tmp', $ROOT . '/covers', $ROOT . '/r'] as $d) { if (!is_dir($d)) { @mkdir($d, 0755, true); } }
if (!is_file($PRIV . '/.htaccess')) { @file_put_contents($PRIV . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n"); }

function out($a, $code = 200) { http_response_code($code); echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fail($m, $code = 400) { out(['ok' => false, 'error' => $m], $code); }
function lower($s) { return function_exists('mb_strtolower') ? mb_strtolower((string)$s, 'UTF-8') : strtolower((string)$s); }
function clip($s, $n) { $s = trim((string)$s); if (preg_match('/^.{0,' . (int)$n . '}/su', $s, $m)) { return $m[0]; } return substr($s, 0, $n); }
function slugify($s) { $s = lower(trim((string)$s)); $s = preg_replace('/[^\p{L}\p{N}]+/u', '-', $s); $s = trim($s, '-'); $s = clip($s, 90); $s = trim($s, '-'); return $s === '' ? 'resource' : $s; }
function origin() { $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'); return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'); }
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function drive_id($s) {
    $s = trim((string)$s); if ($s === '') { return null; }
    if (preg_match('~^[A-Za-z0-9_-]{20,}$~', $s)) { return $s; }
    if (stripos($s, 'http') !== 0) { return null; }
    $host = strtolower((string)parse_url($s, PHP_URL_HOST));
    if (!preg_match('~(^|\.)(google\.com|googleusercontent\.com|googleapis\.com)$~', $host)) { return null; }
    if (preg_match('~/folders/~', $s)) { return null; }
    if (preg_match('~/d/([A-Za-z0-9_-]{10,})~', $s, $m)) { return $m[1]; }
    if (preg_match('~[?&]id=([A-Za-z0-9_-]{10,})~', $s, $m)) { return $m[1]; }
    return null;
}
function drive_view($id) { return 'https://drive.google.com/file/d/' . $id . '/view'; }
function drive_thumb($id, $w = 800) { return 'https://drive.google.com/thumbnail?id=' . $id . '&sz=w' . (int)$w; }

function http_probe($url, $range = 'bytes=0-1023') {
    $hd = []; $body = ''; $code = 0; $err = '';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 5, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 9,
            CURLOPT_HTTPHEADER => ['Range: ' . $range], CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; A360-link-check)',
            CURLOPT_HEADERFUNCTION => function ($c, $l) use (&$hd) { $p = explode(':', $l, 2); if (count($p) === 2) { $hd[strtolower(trim($p[0]))] = trim($p[1]); } return strlen($l); },
            CURLOPT_WRITEFUNCTION => function ($c, $d) use (&$body) { $body .= $d; return strlen($body) > 4096 ? 0 : strlen($d); }]);
        curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); $en = curl_errno($ch); if ($en && $en !== 23) { $err = curl_error($ch); }
        return ['code' => $code, 'h' => $hd, 'body' => $body, 'err' => $err];
    }
    $ctx = stream_context_create(['http' => ['method' => 'GET', 'header' => "Range: $range\r\nUser-Agent: Mozilla/5.0 (compatible; A360-link-check)\r\n", 'timeout' => 9, 'follow_location' => 1, 'ignore_errors' => true]]);
    $body = (string)@file_get_contents($url, false, $ctx, 0, 4096);
    foreach (($http_response_header ?? []) as $l) { if (preg_match('~^HTTP/\S+\s+(\d+)~', $l, $m)) { $code = (int)$m[1]; $hd = []; } else { $p = explode(':', $l, 2); if (count($p) === 2) { $hd[strtolower(trim($p[0]))] = trim($p[1]); } } }
    if ($code === 0) { $err = 'no response'; }
    return ['code' => $code, 'h' => $hd, 'body' => $body, 'err' => $err];
}

function pread($file, $default) { if (!is_file($file)) { return $default; } $raw = (string)file_get_contents($file); $nl = strpos($raw, "\n"); $raw = $nl === false ? '' : substr($raw, $nl + 1); $d = json_decode($raw, true); return is_array($d) ? $d : $default; }
function pwrite($file, $data) { $tmp = $file . '.tmp'; file_put_contents($tmp, "<?php exit; ?>\n" . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)); @chmod($tmp, 0644); rename($tmp, $file); }
function secret() { global $PRIV; $f = $PRIV . '/secret.php'; if (!is_file($f)) { file_put_contents($f, "<?php return '" . bin2hex(random_bytes(32)) . "';\n"); } return include $f; }
function token() { return hash_hmac('sha256', 'a360-admin-v1', secret()); }
function hdr_token() { if (isset($_SERVER['HTTP_X_A360_TOKEN'])) { return $_SERVER['HTTP_X_A360_TOKEN']; } if (function_exists('getallheaders')) { foreach (getallheaders() as $k => $v) { if (strtolower($k) === 'x-a360-token') { return $v; } } } return $_REQUEST['t'] ?? ''; }
function require_admin() { if (!hash_equals(token(), (string)hdr_token())) { fail('Not authorised. Please log in again.', 401); } }

function default_db() {
    return ['site' => ['name' => 'Smart Educational Resource', 'tagline' => 'Knowledge, Organized. Learning, Unlimited.', 'contactEmail' => '', 'driveApiKey' => ''],
        'taxonomy' => [
            'categories' => [['name' => 'Exam Preparation', 'subs' => ['Question Bank', 'Model Test', 'Suggestion']], ['name' => 'Textbooks & Notes', 'subs' => ['Textbook', 'Lecture Notes']], ['name' => 'Reference', 'subs' => []]],
            'subjects' => ['English', 'Bangla', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'ICT', 'Accounting', 'Economics'],
            'levels' => ['Primary', 'Secondary (SSC)', 'Higher Secondary (HSC)', 'Undergraduate', 'Postgraduate', 'Professional / Admission'],
            'classes' => ['Class 6', 'Class 7', 'Class 8', 'Class 9-10', 'Class 11-12', 'Honours', 'Masters'],
            'boards' => ['Dhaka', 'Rajshahi', 'Chattogram', 'Cumilla', 'Jashore', 'Barishal', 'Sylhet', 'Dinajpur', 'Mymensingh', 'Madrasah', 'Technical', 'National University'],
            'types' => ['Textbook', 'Academic Notes', 'Lecture Notes', 'Question Bank', 'Model Test', 'Previous Examination Paper', 'Suggestion', 'Practical Guide', 'Reference Material', 'Study Guide', 'Other educational PDF']],
        'resources' => [], 'messages' => []];
}
function with_db($cb) {
    global $PRIV;
    $lock = fopen($PRIV . '/db.lock', 'c'); flock($lock, LOCK_EX);
    $db = pread($PRIV . '/db.json.php', default_db()); if (($db['site']['name'] ?? '') === 'Educational Resource') { $db['site']['name'] = 'Smart Educational Resource'; }
    $res = $cb($db);
    pwrite($PRIV . '/db.json.php', $db); publish($db);
    flock($lock, LOCK_UN); fclose($lock);
    return $res;
}
function read_db() { global $PRIV; $db = pread($PRIV . '/db.json.php', default_db()); if (($db['site']['name'] ?? '') === 'Educational Resource') { $db['site']['name'] = 'Smart Educational Resource'; } return $db; }

function cover_abs($r, $o) { $c = $r['cover'] ?? ''; if ($c === '') { return $o . '/assets/images/social-preview.png'; } return preg_match('~^https?://~', $c) ? $c : $o . '/' . $c; }
function publish($db) {
    global $ROOT;
    $pub = []; foreach ($db['resources'] as $r) { if (($r['status'] ?? '') === 'published') { $pub[] = $r; } }
    file_put_contents($ROOT . '/data/resources.json.tmp', json_encode(['site' => $db['site'], 'taxonomy' => $db['taxonomy'], 'resources' => $pub], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    rename($ROOT . '/data/resources.json.tmp', $ROOT . '/data/resources.json');
    $o = origin(); $keep = [];
    $urls = [$o . '/', $o . '/about.html', $o . '/contact.html'];
    foreach ($pub as $r) {
        $keep[$r['slug'] . '.html'] = 1; $u = $o . '/read.html?r=' . rawurlencode($r['slug']); $img = cover_abs($r, $o);
        $d = h(($r['seoDesc'] ?? '') !== '' ? $r['seoDesc'] : (($r['short'] ?? '') !== '' ? $r['short'] : 'Read ' . $r['title'] . ' on Smart Educational Resource'));
        $t = h(($r['seoTitle'] ?? '') !== '' ? $r['seoTitle'] : $r['title']); $self = $o . '/r/' . rawurlencode($r['slug']) . '.html';
        $html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . $t . ' · Smart Educational Resource</title><meta name="description" content="' . $d . '">'
            . '<link rel="canonical" href="' . h($self) . '"><meta property="og:type" content="article"><meta property="og:site_name" content="Smart Educational Resource"><meta property="og:title" content="' . $t . '">'
            . '<meta property="og:description" content="' . $d . '"><meta property="og:url" content="' . h($self) . '"><meta property="og:image" content="' . h($img) . '"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="' . h($img) . '">'
            . '<meta http-equiv="refresh" content="0;url=' . h($u) . '"><script>location.replace(' . json_encode($u) . ');</script></head><body><a href="' . h($u) . '">Open ' . $t . '</a></body></html>';
        file_put_contents($ROOT . '/r/' . $r['slug'] . '.html', $html);
        $urls[] = $self;
    }
    foreach (glob($ROOT . '/r/*.html') ?: [] as $f) { if (!isset($keep[basename($f)])) { @unlink($f); } }
    $sm = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($urls as $u) { $sm .= '<url><loc>' . h($u) . '</loc></url>' . "\n"; }
    file_put_contents($ROOT . '/sitemap.xml', $sm . '</urlset>' . "\n");
}

function del_local($rel) { global $ROOT; if (!$rel || strpos($rel, '..') !== false) { return; } if (preg_match('#^(covers|pdfs)/[A-Za-z0-9/_.-]+$#', $rel)) { @unlink($ROOT . '/' . $rel); } }
function is_local_cover($rel) { return is_string($rel) && preg_match('#^covers/[a-f0-9]{24}\.(jpg|png|webp)$#', $rel) === 1; }

$action = $_GET['action'] ?? '';
$body = []; if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && stripos((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== false) { $body = json_decode((string)file_get_contents('php://input'), true) ?: []; }

if ($action === 'ping') {
    $db = read_db();

    $pubj = json_decode((string)@file_get_contents($ROOT . '/data/resources.json'), true);
    if (count($db['resources']) > 0 && (!is_array($pubj) || empty($pubj['resources']))) { publish($db); }
    out(['ok' => true, 'php' => PHP_VERSION, 'curl' => function_exists('curl_init'), 'apiKey' => !empty($db['site']['driveApiKey']),
        'writable' => ['data' => is_writable($ROOT . '/data'), 'storage' => is_writable($PRIV), 'covers' => is_writable($ROOT . '/covers'), 'r' => is_writable($ROOT . '/r')]]);
}
if ($action === 'login') {
    $f = $PRIV . '/attempts.php'; $now = time(); $ip = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? '') . secret());
    $a = pread($f, []); foreach ($a as $k => $v) { if ($v['until'] < $now) { unset($a[$k]); } }
    if (isset($a[$ip]) && $a[$ip]['n'] >= 6 && $a[$ip]['until'] > $now) { fail('Too many attempts. Try again in a few minutes.', 429); }
    $u = lower(trim((string)($body['username'] ?? ''))); $p = (string)($body['password'] ?? '');
    if ($u === ADMIN_USER && hash_equals(ADMIN_HASH, hash('sha256', $u . ':' . $p))) { unset($a[$ip]); pwrite($f, $a); out(['ok' => true, 'token' => token()]); }
    $a[$ip] = ['n' => (isset($a[$ip]) ? $a[$ip]['n'] : 0) + 1, 'until' => $now + 600]; pwrite($f, $a); usleep(600000);
    fail('Invalid username or password.', 401);
}
if ($action === 'hit') {
    $type = (($_REQUEST['type'] ?? '') === 'd') ? 'd' : 'v'; $id = (string)($_REQUEST['id'] ?? '');
    if (!preg_match('/^[a-f0-9]{8,16}$/', $id)) { fail('bad id'); }
    $f = $ROOT . '/data/stats.json'; $fh = fopen($f, 'c+'); flock($fh, LOCK_EX);
    $s = json_decode((string)stream_get_contents($fh), true); if (!is_array($s)) { $s = []; }
    if (isset($s[$id]) || count($s) < 5000) { if (!isset($s[$id])) { $s[$id] = ['v' => 0, 'd' => 0]; } $s[$id][$type]++; }
    ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($s)); flock($fh, LOCK_UN); fclose($fh); out(['ok' => true]);
}
if ($action === 'contact') {
    if (!empty($body['website'])) { out(['ok' => true]); }
    $n = clip($body['name'] ?? '', 120); $e = clip($body['email'] ?? '', 190); $m = clip($body['message'] ?? '', 4000);
    if ($n === '' || !filter_var($e, FILTER_VALIDATE_EMAIL) || strlen($m) < 10) { fail('Please fill in all fields correctly.'); }
    with_db(function (&$db) use ($n, $e, $m) { array_unshift($db['messages'], ['id' => bin2hex(random_bytes(4)), 'name' => $n, 'email' => $e, 'message' => $m, 'at' => date('c'), 'read' => false]); $db['messages'] = array_slice($db['messages'], 0, 200); });
    out(['ok' => true]);
}

require_admin();

if ($action === 'admin_data') { $db = read_db(); $s = json_decode((string)@file_get_contents($ROOT . '/data/stats.json'), true); out(['ok' => true, 'db' => $db, 'stats' => is_array($s) ? $s : new stdClass()]); }

if ($action === 'inspect') {
    $id = drive_id($body['url'] ?? ''); if (!$id) { fail('That does not look like a Google Drive file link. Paste the "Copy link" URL of the PDF (not a folder).'); }
    $db = read_db(); $key = (string)($db['site']['driveApiKey'] ?? ''); $res = ['ok' => true, 'id' => $id, 'checked' => false, 'public' => null, 'isPdf' => null, 'name' => '', 'size' => 0, 'note' => ''];
    if ($key !== '') {
        $r = http_probe('https://www.googleapis.com/drive/v3/files/' . $id . '?supportsAllDrives=true&fields=name,size,mimeType&key=' . rawurlencode($key), 'bytes=0-');
        $j = json_decode($r['body'], true);
        if ($r['code'] === 200 && is_array($j)) { $res['checked'] = true; $res['public'] = true; $res['name'] = (string)($j['name'] ?? ''); $res['size'] = (int)($j['size'] ?? 0); $res['isPdf'] = (($j['mimeType'] ?? '') === 'application/pdf'); $res['note'] = $res['isPdf'] ? 'Public PDF found.' : 'This file is not a PDF (' . ($j['mimeType'] ?? 'unknown') . ').'; out($res); }
        if (in_array($r['code'], [403, 404], true)) { $res['checked'] = true; $res['public'] = false; $res['note'] = 'Google says this file is private or missing. Set sharing to "Anyone with the link".'; out($res); }
    }
    $r = http_probe('https://drive.usercontent.google.com/download?id=' . $id . '&export=download&confirm=t');
    if ($r['code'] === 0) { $res['note'] = 'This server could not reach Google to verify the link (' . ($r['err'] ?: 'no response') . '). The link format looks valid.'; out($res); }
    $res['checked'] = true; $ct = strtolower($r['h']['content-type'] ?? '');
    if (in_array($r['code'], [200, 206], true) && strncmp($r['body'], '%PDF-', 5) === 0) {
        $res['public'] = true; $res['isPdf'] = true; $res['note'] = 'Public PDF found.';
        if (preg_match('~/(\d+)\s*$~', $r['h']['content-range'] ?? '', $m)) { $res['size'] = (int)$m[1]; } elseif ($r['code'] === 200 && isset($r['h']['content-length'])) { $res['size'] = (int)$r['h']['content-length']; }
        $cd = $r['h']['content-disposition'] ?? '';
        if (preg_match("~filename\*=UTF-8''([^;]+)~i", $cd, $m)) { $res['name'] = rawurldecode($m[1]); } elseif (preg_match('~filename="?([^";]+)"?~i', $cd, $m)) { $res['name'] = $m[1]; }
        out($res);
    }
    if (in_array($r['code'], [200, 206], true) && strpos($ct, 'text/html') === false) { $res['public'] = true; $res['isPdf'] = false; $res['note'] = 'The link works but the file does not look like a PDF.'; out($res); }
    $res['public'] = false; $res['note'] = 'Google did not return the file. Open Drive → Share → General access → "Anyone with the link" (Viewer), then check again.'; out($res);
}
if ($action === 'cover') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) { fail('Image upload failed (' . (isset($_FILES['file']) ? $_FILES['file']['error'] : 'no data') . ').'); }
    $tmp = $_FILES['file']['tmp_name']; $size = (int)filesize($tmp); if ($size < 8 || $size > MAX_COVER) { fail('Cover image must be 3 MB or smaller.'); }
    $info = @getimagesize($tmp); $map = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!$info || !isset($map[$info[2]])) { fail('Cover must be a JPG, PNG or WebP image.'); }
    $rel = 'covers/' . bin2hex(random_bytes(12)) . '.' . $map[$info[2]];
    if (!@move_uploaded_file($tmp, $ROOT . '/' . $rel)) { if (!@copy($tmp, $ROOT . '/' . $rel)) { fail('Could not store the image (covers folder not writable).', 500); } }
    @chmod($ROOT . '/' . $rel, 0644); out(['ok' => true, 'path' => $rel]);
}
if ($action === 'save') {
    $in = $body['resource'] ?? []; $title = clip($in['title'] ?? '', 255); if ($title === '') { fail('Resource title is required.'); }
    $id = (string)($in['id'] ?? '');
    $driveIn = clip($in['driveUrl'] ?? '', 600); $did = drive_id($driveIn);
    if ($driveIn !== '' && !$did) { fail('The Google Drive link is not valid. Paste the PDF file\'s "Copy link" URL (not a folder).'); }
    $mode = in_array($in['coverMode'] ?? '', ['auto', 'drive', 'url', 'upload', 'none'], true) ? $in['coverMode'] : 'auto';
    $coverIn = clip($in['coverInput'] ?? '', 600); $coverId = null; $coverUrl = '';
    if ($mode === 'drive') { $coverId = drive_id($coverIn); if (!$coverId) { fail('The thumbnail Drive link is not valid.'); } }
    if ($mode === 'url') { if (!preg_match('~^https://~i', $coverIn) || !filter_var($coverIn, FILTER_VALIDATE_URL)) { fail('The thumbnail URL must start with https://'); } $coverUrl = $coverIn; }
    $res = with_db(function (&$db) use ($in, $title, $id, $did, $driveIn, $mode, $coverIn, $coverId, $coverUrl) {
        $idx = -1; foreach ($db['resources'] as $k => $r) { if ($r['id'] === $id) { $idx = $k; } }
        $old = $idx >= 0 ? $db['resources'][$idx] : null;
        if (!$old && !$did) { fail('Please paste the public Google Drive link of the PDF.'); }
        $r = $old ?: ['id' => bin2hex(random_bytes(5)), 'added' => date('c'), 'file' => '', 'driveId' => '', 'driveUrl' => '', 'size' => 0, 'pages' => 0, 'cover' => '', 'coverMode' => 'auto', 'coverInput' => ''];
        if ($did) { $r['driveId'] = $did; $r['driveUrl'] = drive_view($did); $r['file'] = ''; }
        $r['size'] = max(0, min(5000000000, (int)($in['size'] ?? ($old['size'] ?? 0)))); $r['pages'] = max(0, min(10000, (int)($in['pages'] ?? ($old['pages'] ?? 0))));

        $oldLocal = ($old && is_local_cover($old['cover'] ?? '')) ? $old['cover'] : '';
        $cover = ''; $keepLocal = '';
        if ($mode === 'auto') { $cover = ($r['driveId'] ?? '') !== '' ? drive_thumb($r['driveId']) : ''; }
        elseif ($mode === 'drive') { $cover = drive_thumb($coverId); }
        elseif ($mode === 'url') { $cover = $coverUrl; }
        elseif ($mode === 'upload') {
            $up = (string)($in['coverUpload'] ?? '');
            if (is_local_cover($up) && is_file(__DIR__ . '/' . $up)) { $cover = $up; $keepLocal = $up; }
            elseif ($oldLocal !== '') { $cover = $oldLocal; $keepLocal = $oldLocal; }
            else { fail('Please choose a thumbnail image to upload.'); }
        }
        if ($oldLocal !== '' && $oldLocal !== $keepLocal) { del_local($oldLocal); }
        $r['cover'] = $cover; $r['coverMode'] = $mode; $r['coverInput'] = ($mode === 'drive' || $mode === 'url') ? $coverIn : '';
        $slug = slugify(($in['slug'] ?? '') !== '' ? $in['slug'] : $title); $base = $slug; $n = 1;
        for (;;) { $dup = false; foreach ($db['resources'] as $x) { if ($x['slug'] === $slug && $x['id'] !== $r['id']) { $dup = true; } } if (!$dup) { break; } $slug = $base . '-' . (++$n); }
        $tags = []; if (isset($in['tags']) && is_array($in['tags'])) { foreach ($in['tags'] as $t) { $t = clip($t, 60); if ($t !== '') { $tags[$t] = $t; } } }
        $f = ['short' => 500, 'language' => 40, 'author' => 190, 'publisher' => 190, 'pubDate' => 10, 'isbn' => 30, 'edition' => 60, 'level' => 120, 'class' => 120, 'subject' => 120, 'board' => 120, 'category' => 120, 'subcategory' => 120,
            'year' => 20, 'term' => 40, 'chapter' => 20, 'topic' => 255, 'type' => 120, 'difficulty' => 20, 'audience' => 190, 'seoTitle' => 190, 'seoDesc' => 300, 'keywords' => 500];
        foreach ($f as $k => $max) { $r[$k] = clip($in[$k] ?? '', $max); }
        $r['title'] = $title; $r['slug'] = $slug; $r['desc'] = clip($in['desc'] ?? '', 20000); $r['tags'] = array_values($tags);
        $r['featured'] = !empty($in['featured']); $r['allowDownload'] = !isset($in['allowDownload']) || !empty($in['allowDownload']);
        $r['status'] = (($in['status'] ?? '') === 'published') ? 'published' : 'draft'; $r['updated'] = date('c');
        if ($idx >= 0) { $db['resources'][$idx] = $r; } else { $db['resources'][] = $r; }
        return $r;
    });
    out(['ok' => true, 'resource' => $res]);
}
if ($action === 'toggle') {
    $id = (string)($body['id'] ?? ''); $field = (string)($body['field'] ?? '');
    with_db(function (&$db) use ($id, $field) { foreach ($db['resources'] as $k => $r) { if ($r['id'] === $id) {
        if ($field === 'status') { $db['resources'][$k]['status'] = $r['status'] === 'published' ? 'draft' : 'published'; } elseif ($field === 'featured') { $db['resources'][$k]['featured'] = empty($r['featured']); } } } });
    out(['ok' => true]);
}
if ($action === 'delete') {
    $id = (string)($body['id'] ?? '');
    with_db(function (&$db) use ($id) { $keep = []; foreach ($db['resources'] as $r) { if ($r['id'] === $id) { del_local($r['file'] ?? ''); if (is_local_cover($r['cover'] ?? '')) { del_local($r['cover']); } } else { $keep[] = $r; } } $db['resources'] = $keep; });
    out(['ok' => true]);
}
if ($action === 'taxonomy') {
    $tx = $body['taxonomy'] ?? null; $site = $body['site'] ?? null; $ren = isset($body['renames']) && is_array($body['renames']) ? $body['renames'] : [];
    with_db(function (&$db) use ($tx, $site, $ren) {
        if (is_array($tx)) { $clean = [];
            foreach (['subjects', 'levels', 'classes', 'boards', 'types'] as $k) { $clean[$k] = []; foreach (isset($tx[$k]) && is_array($tx[$k]) ? $tx[$k] : [] as $v) { $v = clip($v, 120); if ($v !== '') { $clean[$k][] = $v; } } $clean[$k] = array_values(array_unique($clean[$k])); }
            $clean['categories'] = []; foreach (isset($tx['categories']) && is_array($tx['categories']) ? $tx['categories'] : [] as $c) { $nm = clip($c['name'] ?? '', 120); if ($nm === '') { continue; } $subs = []; foreach (isset($c['subs']) && is_array($c['subs']) ? $c['subs'] : [] as $s) { $s = clip($s, 120); if ($s !== '') { $subs[] = $s; } } $clean['categories'][] = ['name' => $nm, 'subs' => array_values(array_unique($subs))]; }
            $db['taxonomy'] = $clean; }
        $fields = ['subject', 'level', 'class', 'board', 'type', 'category', 'subcategory'];
        foreach ($ren as $rn) { $fld = $rn['field'] ?? ''; if (!in_array($fld, $fields, true)) { continue; } foreach ($db['resources'] as $k => $r) { if (($r[$fld] ?? null) === ($rn['from'] ?? null)) { $db['resources'][$k][$fld] = clip($rn['to'] ?? '', 120); } } }
        if (is_array($site)) { $key = preg_replace('/[^A-Za-z0-9_-]/', '', (string)($site['driveApiKey'] ?? '')); $db['site'] = ['name' => clip($site['name'] ?? '', 80) ?: 'Smart Educational Resource', 'tagline' => clip($site['tagline'] ?? '', 160), 'contactEmail' => clip($site['contactEmail'] ?? '', 190), 'driveApiKey' => clip($key, 80)]; }
    });
    out(['ok' => true]);
}
if ($action === 'message') {
    $id = (string)($body['id'] ?? ''); $op = (string)($body['op'] ?? '');
    with_db(function (&$db) use ($id, $op) { $keep = []; foreach ($db['messages'] as $m) { if ($m['id'] === $id) { if ($op === 'read') { $m['read'] = true; $keep[] = $m; } } else { $keep[] = $m; } } $db['messages'] = $keep; });
    out(['ok' => true]);
}
fail('Unknown action.', 404);
