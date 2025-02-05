import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: "87.180.137.208",
    port: 8080,
    user: "leon",
    password: "Leon231207",
    database: "krautundrueben",
    waitForConnections: true,
})

export async function query(query: string, values?: any[]) {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query(query, values);
        connection.release();
        return results;
    } catch {
        connection.release();
    }
}
