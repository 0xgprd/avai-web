<?php
// Proxy del formulario de contacto -> (1) AVAI lead-intake -> Airtable  y  (2) webhook de n8n.
// El secreto vive en el SERVIDOR como variable de entorno (se inyecta en EasyPanel),
// NUNCA en el codigo ni en el repositorio ni en el HTML publico.
header('Content-Type: application/json; charset=utf-8');

$SECRET   = getenv('WEBHOOK_SECRET') ?: ($_SERVER['WEBHOOK_SECRET'] ?? ($_ENV['WEBHOOK_SECRET'] ?? ''));
$ENDPOINT = getenv('LEAD_ENDPOINT')  ?: ($_SERVER['LEAD_ENDPOINT']  ?? ($_ENV['LEAD_ENDPOINT']  ?? 'https://app.avai-labs.com/api/lead-intake'));

// WEBHOOK DE n8n (4-sep-2026): recibe TODOS los campos del formulario de contacto, tal cual, y el
// mapeo (Airtable, email, agente...) se hace dentro de n8n. La URL se puede cambiar sin tocar codigo
// con la variable de entorno N8N_WEBHOOK_URL en EasyPanel. Es la URL de PRODUCCION del webhook: el
// workflow tiene que estar ACTIVO en n8n o devolvera 404 (y el lead solo llegara al CRM).
$N8N_URL  = getenv('N8N_WEBHOOK_URL') ?: ($_SERVER['N8N_WEBHOOK_URL'] ?? ($_ENV['N8N_WEBHOOK_URL'] ?? 'https://avai-legacy-n8n.ig2tl9.easypanel.host/webhook/019899f5-dd15-44a2-b6bc-b9fafb62f5ca'));

if ($SECRET === '') { http_response_code(500); echo json_encode(['ok'=>false,'error'=>'servidor sin WEBHOOK_SECRET']); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false]); exit; }

$name     = trim($_POST['name']     ?? '');
$email    = trim($_POST['email']    ?? '');
$phone    = trim($_POST['phone']    ?? '');
$empresa  = trim($_POST['empresa']  ?? '');
$servicio = trim($_POST['servicio'] ?? '');
$msg      = trim($_POST['message']  ?? '');
$origen   = trim($_POST['origen']   ?? 'web-formulario');
$rgpd     = isset($_POST['rgpd']);   // el checkbox solo viaja en el POST si esta marcado

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

// POST de un JSON a una URL. Devuelve [codigo HTTP (0 si no hubo respuesta), cuerpo de la respuesta].
// JSON_INVALID_UTF8_SUBSTITUTE: nunca falla por bytes UTF-8 invalidos (evita enviar cuerpo vacio).
// JSON_UNESCAPED_UNICODE: los acentos llegan legibles (no como \u00xx).
function postJson(string $url, array $data, array $headers, int $timeout): array {
  $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
  if ($body === false) { $body = json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR); }
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => array_merge(['Content-Type: application/json'], $headers),
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_TIMEOUT        => $timeout,
  ]);
  $res  = curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$code, is_string($res) ? $res : ''];
}

// (1) CRM de AVAI, como siempre. Un 2xx con {"ok":false} dentro tambien cuenta como fallo.
[$crmCode, $crmRes] = postJson($ENDPOINT, $payload, ['x-webhook-secret: ' . $SECRET], 15);
$crmOk   = $crmCode >= 200 && $crmCode < 300;
$crmJson = json_decode($crmRes, true);
if (is_array($crmJson) && (($crmJson['ok'] ?? null) === false)) { $crmOk = false; }

// (2) Webhook de n8n: SOLO el formulario de contacto. El chat de la web tambien pasa por este proxy
//     (origen 'chat-web', reenvia la conversacion tras cada respuesta) y eso NO se manda al webhook.
//     Van todos los campos del formulario, en plano y con nombres en castellano, para mapearlos en n8n.
$n8nCode = null;
if ($origen === 'web-formulario') {
  $formulario = [
    'origen'   => $origen,
    'fecha'    => (new DateTime('now', new DateTimeZone('Atlantic/Canary')))->format(DATE_ATOM),
    'nombre'   => $name,
    'email'    => $email,
    'telefono' => $phone,
    'empresa'  => $empresa,
    'servicio' => $servicio,
    'mensaje'  => $msg,       // el mensaje tal cual (la empresa ya va en su propio campo)
    'rgpd'     => $rgpd,      // true = acepto la politica de privacidad
    'pagina'   => $_SERVER['HTTP_REFERER'] ?? '',
  ];
  [$n8nCode] = postJson($N8N_URL, $formulario, [], 10);
}
$n8nOk = $n8nCode !== null && $n8nCode >= 200 && $n8nCode < 300;

// El envio cuenta como hecho si al menos UN destino lo ha recibido: una caida del CRM (p.ej. cuota de
// Airtable agotada) no debe hacer que el visitante vea "No se pudo enviar" cuando n8n si lo tiene.
$ok = $crmOk || $n8nOk;
http_response_code($ok ? 200 : ($crmCode ?: 502));
echo json_encode(['ok' => $ok, 'crm' => $crmCode, 'n8n' => $n8nCode], JSON_UNESCAPED_UNICODE);
