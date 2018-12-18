<?php

namespace Meteotest;

const DEBUG = false;

/**
 * PDO-compatible wrapper for functions operating on a pg_query() or pg_prepare() result
 */
class PDO_pgSQL_Statement {
    /**
     * Current result
     * @type {resource}
     */
    protected $_result;
    protected $_name = '';

    /**
     * @param {resource} $result
     * @param {string} $name
     *   Name of this statement.  Required for calling #execute().
     * @constructor
     */
    public function __construct (/* resource */ $result, string $name = null)
    {
        if ($result !== false)
        {
            $this->_result = $result;
        }

        if ($name !== null)
        {
            $this->_name = $name;
        }
    }

    /**
     * Returns the current result.
     * @return {resource}
     */
    public function getResult ()
    {
        return $this->_result;
    }

    /**
     * Executes a prepared statement
     * @param {array} $params
     * @return {bool}
     *   Returns <code>TRUE</code> on success or <code>FALSE</code> on failure.
     */
    public function execute (array $input_parameters = [])
    {
        return !!($this->_result = \pg_execute($this->_name, $input_parameters));
    }

    /**
     * Returns an array containing all of the result set rows
     * @return {array}
     *   An array containing all of the remaining rows in the result set.
     *   The array represents each row as either an array of column values
     *   or an object with properties corresponding to each column name.
     *   An empty array is returned if there are zero results to fetch,
     *   or FALSE on failure.
     *
     *   Using this method to fetch large result sets will result in a heavy demand
     *   on system and possibly network resources. Rather than retrieving
     *   all of the data and manipulating it in PHP, consider using
     *   the database server to manipulate the result sets. For example,
     *   use the WHERE and ORDER BY clauses in SQL to restrict results before
     *   retrieving and processing them with PHP.
     */
    public function fetchAll (
        int $fetch_style = \PDO::ATTR_DEFAULT_FETCH_MODE,
        /* mixed */ $fetch_argument = null,
        array $ctor_args = [])
    {
        $pdo_to_pgsql = [
            \PDO::FETCH_ASSOC => PGSQL_ASSOC,
            \PDO::FETCH_BOTH  => PGSQL_BOTH,
            \PDO::FETCH_NUM   => PGSQL_NUM
        ];

        return \pg_fetch_all($this->_result, @$pdo_to_pgsql[$fetch_style] ?: PGSQL_BOTH);
    }
}

/**
 * PDO-compatible wrapper for pg_connect() results
 */
class PDO_pgSQL {
    /**
     * Current connection
     * @type {resource}
     */
    protected $_connection;

    /**
     * ID of the next statement (required for postgreSQL prepared statements)
     * @type {int}
     */
    protected $_nextStatementId = 1;

    public function __construct (string $dsn, string $username = null, string $passwd = null, array $options = [])
    {
        $conn = $this->_connection = \pg_connect("{$dsn} user={$username} password={$passwd}");
        if (!$conn)
        {
            throw new \PDOException("Cannot connect.\n");
        }
    }

    /**
     * Returns the current connection.
     * @return {resource}
     */
    public function getConnection ()
    {
        return $this->_connection;
    }

    /**
     * Fetch extended error information associated with the last operation on the database handle
     * @return [type] [description]
     */
    public function errorInfo ()
    {
        return [
            0 => null,
            1 => null,
            2 => \pg_last_error($this->_connection)
        ];
    }

    /**
     * Ping database connection
     * @return {bool}
     *   Returns <code>TRUE</code> on success or <code>FALSE</code> on failure.
     */
    public function ping ()
    {
        return \pg_ping($this->_connection);
    }

    /**
     * Submits a request to create a prepared statement with the given parameters,
     * and waits for completion
     * @param  {string} $statement
     *   The parameterized SQL statement. Must contain only a single statement.
     *   (multiple statements separated by semi-colons are not allowed.)
     *   If any parameters are used, they are referred to as $1, $2, etc.
     * @param  {array} $driver_options
     * @return {PDO_pgSQL_Statement}
     *   whose result is a resource on success or <code>FALSE</code> on failure.
     */
    public function prepare (string $statement, array $driver_options = [])
    {
        $id =& $this->_nextStatementId;

        if (DEBUG) echo "$statement\n";

        $stmt = new PDO_pgSQL_Statement(
            \pg_prepare(
                $this->_connection,
                @$driver_options['name'] ?: $id,
                $statement
            ),
            $id
        );

        ++$id;

        return $stmt;
    }

    /**
     * Execute a query
     * @param  {string} $statement
     *   The SQL statement or statements to be executed. When multiple statements
     *   are passed to the function, they are automatically executed as one transaction,
     *   unless there are explicit BEGIN/COMMIT commands included in the query string.
     *   However, using multiple transactions in one function call is not recommended.
     * @return {PDO_pgSQL_Statement}
     *   whose result is a resource on success or <code>FALSE</code> on failure.
     */
    public function query (string $statement)
    {
        return new PDO_pgSQL_Statement(\pg_query($this->_connection, $statement));
    }
}
