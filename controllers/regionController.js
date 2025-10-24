import db from "../config/database.js";

export async function getRegions(req, res){
  try{
    const q = await db.query("SELECT id, name FROM regions ORDER BY name ASC");
    res.json(q.rows);
  }catch(err){
    console.error("GET regions error:", err);
    res.status(500).json({ message: "Gagal mengambil regions" });
  }
}

export async function createRegion(req, res){
  try{
    const { code, name } = req.body;
    const q = await db.query("INSERT INTO regions (code, name) VALUES ($1,$2) RETURNING *", [code || null, name]);
    res.json(q.rows[0]);
  }catch(err){
    console.error("Create region error:", err);
    res.status(500).json({ message: "Gagal membuat region" });
  }
}
