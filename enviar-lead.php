<?php
// Proxy del formulario de contacto -> AVAI (lead-intake -> Airtable).
// El secreto vive en el SERVIDOR como variable de entorno (se inyecta en EasyPanel),
// NUNCA en el codigo ni en el repositorio ni en el HTML publico.
header('Content-Type: application/json; charset=utf-8');

$SECRET   = getenv('WEBHOOK_SECRET') ?: ($_SERVER['WEBHOOK_SECRET'] ?? ($_ENV['WEBHOOK_SECRET'] ?? ''));
$ENDPOINT = getenv('LEAD_ENDPOINT')  ?: ($_SERVER['LEAD_ENDPOINT']  ?? ($_ENV['LEAD_ENDPOINT']  ?? 'https://avai-labs.vercel.app/api/lead-intake'));

if ($SECRET === '') { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'servidor sin WEBHOOK_SECRET']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false]); exit; }

$name     = trim($_POST['name']     ?? '');
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$empresa  = trim($_POST['empresa']  ?? '');
$servicio = trim($_POST['servicio'] ?? '');
$msg      = trim($_POST['message']  ?? '');
$origen   = trim($_POST['origen']   ?? 'web-formulario');

// Enriquecemos el mensaje para que EMPRESA y SERVICIO lleguen al CRM
// aunque el SaaS todavia no tenga esas columnas en Airtable.
$extra = [];
if ($servicio !== '') $extra[] = 'Interes: ' . $servicio;
if ($empresa  !== '') $extra[] = 'Empresa: ' . $empresa;
$fullMessage = trim(implode(' | ', $extra) . ($msg !== '' ? "\n\n" . $msg : ''));

$payload = [
  'name'     => $name,
  'email'    => $email,
  'phone'    => $phone,
  'empresa'  => $empresa,   // por si el SaaS los mapea en el futuro
  'servicio' => $servicio,
  'message'  => $fullMessage,
  'origen'   => $origen,
];

$ch = curl_init($ENDPOINT);
curl_setopt_array($ch, [
  CURLOPT_POST           => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'x-webhook-secret: ' . $SECRET],
  CURLOPT_POSTFIELDS     => json_encode($payload),
  CURLOPT_TIMEOUT        => 15,
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($code ?: 502);
echo $res ?: json_encode(['ok'=>false, 'error'=>'sin respuesta']);
