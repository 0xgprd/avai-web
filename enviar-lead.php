<?php
// Proxy del formulario de contacto -> AVAI (lead-intake -> Airtable).
// El secreto vive en el SERVIDOR como variable de entorno (se inyecta en EasyPanel),
// NUNCA en el codigo ni en el repositorio ni en el HTML publico.
header('Content-Type: application/json; charset=utf-8');

$SECRET   = getenv('WEBHOOK_SECRET') ?: ($_SERVER['WEBHOOK_SECRET'] ?? ($_ENV['WEBHOOK_SECRET'] ?? ''));
$ENDPOINT = getenv('LEAD_ENDPOINT')  ?: ($_SERVER['LEAD_ENDPOINT']  ?? ($_ENV['LEAD_ENDPOINT']  ?? 'https://app.avai-labs.com/api/lead-intake'));

if ($SECRET === '') { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'servidor sin WEBHOOK_SECRET']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false]); exit; }

$name     = trim($_POST['name']     ?? '');
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$empresa  = trim($_POST['empresa']  ?? '');
$servicio = trim($_POST['servicio'] ?? '');
$msg      = trim($_POST['message']  ?? '');
$origen   = trim($_POST['origen']   ?? 'web-formulario');

// Mapeo a los nombres de campo que ENTIENDE el SaaS (lead-intake):
//   interes  -> columna "negocio" del CRM
//   mensaje  -> columna de notas
// La EMPRESA aun no tiene columna propia en el SaaS, asi que la anteponemos al mensaje (visible en notas).
$mensaje = ($empresa !== '' ? 'Empresa: ' . $empresa . "\n\n" : '') . $msg;

$payload = [
  'nombre'   => $name,
  'email'    => $email,
  'telefono' => $phone,
  'interes'  => $servicio,   // -> columna "negocio" del CRM
  'empresa'  => $empresa,    // por si el SaaS mapea 'empresa' como columna en el futuro
  'mensaje'  => $mensaje,    // -> columna de notas (incluye la empresa al principio)
  'origen'   => $origen,
];

// JSON_INVALID_UTF8_SUBSTITUTE: nunca falla por bytes UTF-8 invalidos (evita enviar cuerpo vacio).
// JSON_UNESCAPED_UNICODE: los acentos llegan legibles al CRM (no como \u00xx).
$body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
if ($body === false) { $body = json_encode($payload, JSON_PARTIAL_OUTPUT_ON_ERROR); }

$ch = curl_init($ENDPOINT);
curl_setopt_array($ch, [
  CURLOPT_POST           => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'x-webhook-secret: ' . $SECRET],
  CURLOPT_POSTFIELDS     => $body,
  CURLOPT_TIMEOUT        => 15,
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($code ?: 502);
echo $res ?: json_encode(['ok'=>false, 'error'=>'sin respuesta']);
