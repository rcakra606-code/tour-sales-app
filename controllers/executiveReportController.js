import db from "../config/database.js";

export async function getExecutiveSummary(req,res){
  try{
    const summary = await db.query(`
      SELECT COALESCE(r.name,'(Unknown)') as region, COUNT(t.id) as tours, COALESCE(SUM(t.sales_amount),0) as sales, COALESCE(SUM(t.profit_amount),0) as profit
      FROM tours t
      LEFT JOIN regions r ON r.id = t.region_id
      GROUP BY r.name ORDER BY sales DESC
    `);
    res.json(summary.rows);
  }catch(err){
    console.error("Executive summary error:", err);
    res.status(500).json({ message: "Gagal memuat executive summary" });
  }
}

export async function getMonthlyPerformance(req,res){
  try{
    const year = Number(req.query.year) || (new Date()).getFullYear();
    const q = await db.query(`
      SELECT TO_CHAR(COALESCE(transaction_date, created_at), 'Mon') as month,
        COALESCE(SUM(sales_amount),0) as sales, COALESCE(SUM(profit_amount),0) as profit
      FROM sales
      WHERE EXTRACT(YEAR FROM COALESCE(transaction_date, created_at)) = $1
      GROUP BY 1 ORDER BY date_part('month', COALESCE(transaction_date, created_at))
    `, [year]);
    res.json(q.rows);
  }catch(err){
    console.error("Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat monthly performance" });
  }
}
