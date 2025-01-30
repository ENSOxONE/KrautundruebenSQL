import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: "mc.wagnerraid.com",
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
        return results;
    } catch {
        connection.release();
    }
}
