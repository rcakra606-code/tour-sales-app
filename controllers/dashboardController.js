import db from "../config/database.js";

export async function getDashboardSummary(req, res){
  try{
    const totalToursQ = await db.query("SELECT COUNT(*) as cnt FROM tours");
    const totalSalesQ = await db.query("SELECT COALESCE(SUM(sales_amount),0) as total FROM sales");
    const totalProfitQ = await db.query("SELECT COALESCE(SUM(profit_amount),0) as total FROM sales");
    const totalDocsQ = await db.query("SELECT COUNT(*) as cnt FROM documents");

    const targetsQ = await db.query("SELECT COALESCE(SUM(sales_target),0) as sales_target, COALESCE(SUM(profit_target),0) as profit_target FROM targets");

    res.json({
      total_tours: Number(totalToursQ.rows[0].cnt || 0),
      total_sales: Number(totalSalesQ.rows[0].total || 0),
      total_profit: Number(totalProfitQ.rows[0].total || 0),
      total_documents: Number(totalDocsQ.rows[0].cnt || 0),
      target_sales: Number(targetsQ.rows[0].sales_target || 0),
      target_profit: Number(targetsQ.rows[0].profit_target || 0)
    });
  }catch(err){
    console.error("Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat summary" });
  }
}
