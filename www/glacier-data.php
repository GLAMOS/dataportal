<?php

namespace Meteotest;

// \ini_set('display_errors', true);
// phpinfo();
// exit;

require_once \implode(DIRECTORY_SEPARATOR, [__DIR__, '..', 'modules', 'Meteotest', 'PDO_pgSQL.php']);

const DB_CONFIG = [
  'host'     => 'vawsrv01.ethz.ch',
  'port'     => 5432,
  'database' => 'glamos',
  'user'     => 'glporo',
  'password' => 'RmyWGsMp',
];

try
{
    // $conn = new PDO(
    //     vsprintf('pgsql:host=%s;port=%d;dbname=%s',[
    //         DB_CONFIG['host'],
    //         DB_CONFIG['port'],
    //         DB_CONFIG['database']
    //     ]
    //     DB_CONFIG['user'],
    //     DB_CONFIG['password']
    // );
    $conn = new PDO_pgSQL(
        vsprintf('host=%s port=%d dbname=%s', [
            DB_CONFIG['host'],
            DB_CONFIG['port'],
            DB_CONFIG['database']
        ]),
        DB_CONFIG['user'],
        DB_CONFIG['password']
    );
}
catch (\PDOException $e)
{
    echo $e->getMessage();
    var_dump($conn);
    var_dump($conn->errorInfo());
    exit;
}

// if (!$conn->ping())
// {
//     die("Connection is broken\n");
// }

$glacier_id = @$_GET['id'] ?: 'B90/04';

$res = $conn->prepare(<<<postgreSQL
    SELECT glacier_full_name, year_from, year_to, variation_cumulative
    FROM length_change.web_length_change
    WHERE pk_sgi=$1
    ORDER BY year_to
postgreSQL
);

$res->execute([$glacier_id]);

$data = $res->fetchAll(\PDO::FETCH_ASSOC);

/* Copy inner array, and modify */
$first = $data[0];
$first['year_to'] = $first['year_from'];
$first['variation_cumulative'] = 0;

/* Prepend modified copy */
\array_unshift($data, $first);

echo json_encode($data) . "\n";
