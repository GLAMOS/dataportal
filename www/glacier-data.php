<?php

namespace Meteotest;

\ini_set('display_errors', true);
// phpinfo();
// exit;

require_once \implode(DIRECTORY_SEPARATOR, [__DIR__, '..', 'modules', 'Meteotest', 'PDO_pgSQL.php']);

const MOCK_ENABLED = false;

$mock_data = [
    'files' => [
        'length_change' => \implode(DIRECTORY_SEPARATOR, [__DIR__, 'geo', 'griessgletscher_length_change.geojson']),
        'mass_balance'  => \implode(DIRECTORY_SEPARATOR, [__DIR__, 'geo' ,'griessgletscher_mass_change.geojson']),
    ],
    'keys' => [
        'length_change' => [
            'glacier_full_name' => 'glacier_short_name',
            'year_from'         => 'date_from_length',
            'year'              => 'date_to_length',
            'value'             => 'length_cum'
        ],
        'mass_balance'  => [
            'glacier_full_name' => 'glacier_short_name',
            'year_from'         => 'date_from_mass',
            'year'              => 'date_to_mass',
            'value'             => 'mass_cum'
        ]
    ]
];

const DB_CONFIG = [
    'host'     => 'vawsrv01.ethz.ch',
    'port'     => 5432,
    'database' => 'glamos',
    'user'     => 'glporo',
    'password' => 'RmyWGsMp',
];

$type = $_GET['type'];

function dump ($value)
{
    echo '<pre>';
    var_dump($value);
    echo '</pre>';
}

if (MOCK_ENABLED)
{
    $data =
     array_map(
        function (&$record) use ($mock_data, $type) {
            $properties = $record['properties'];
            // dump($record);
            // dump($mock_data['keys'][$type]);
            $keys = array_keys($mock_data['keys'][$type]);
            foreach ($keys as $index => $key)
            {
                $value = $properties[$mock_data['keys'][$type][$key]];
                if (strpos($key, 'year') === 0) $value = preg_replace('/^(\\d+).*/', '$1', $value);
                $properties[$key] = $value;
            }
            return $properties;
        },
        \json_decode(\file_get_contents($mock_data['files'][$type]), true, 512, JSON_OBJECT_AS_ARRAY)['features']
    );
}
else
{
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

    $queries = [
        'length_change' => <<<postgreSQL
            SELECT
                glacier_full_name,
                year_from,
                year_to AS year,
                variation_cumulative AS value
            FROM length_change.web_length_change
            WHERE pk_sgi=$1
            ORDER BY year_to
postgreSQL
        ,
        'mass_balance' => <<<postgreSQL
            SELECT
                glacier_full_name,
                year_from,
                year_to AS year,
                annual_mass_balance AS value
            FROM mass_balance.web_mass_balance
            WHERE pk_sgi=$1
            ORDER BY year_to
postgreSQL
    ];

    $res = $conn->prepare($queries[$type]);

    $res->execute([$glacier_id]);

    $data = $res->fetchAll(\PDO::FETCH_ASSOC);
}

/* If cumulative, copy inner array, and modify */
if (is_array($data) && $type === 'length_change')
{
    $first = $data[0];
    $first['year'] = $first['year_from'];
    $first['value'] = 0;

    /* Prepend modified copy */
    \array_unshift($data, $first);
}

echo json_encode($data) . "\n";
