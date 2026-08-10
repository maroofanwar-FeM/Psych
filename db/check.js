import { pool, query } from "./client.js";

const MARKER = "DB CHECK - delete me";

async function main() {
  const tables = await query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
  );
  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

  const school = await query(
    'insert into "School" (name) values ($1) returning id, name, "createdAt"',
    [MARKER]
  );
  console.log("Inserted School:", school.rows[0]);

  const log = await query(
    'insert into "MessageLog" ("schoolId", body, status, "triggeredBy") values ($1, $2, $3, $4) returning id, "schoolId", body, status, "sentAt"',
    [school.rows[0].id, MARKER, "SENT", "send-now"]
  );
  console.log("Inserted MessageLog:", log.rows[0]);

  const joined = await query(
    `select s.id as school_id, s.name as school_name, m.id as message_log_id, m.body, m.status, m."sentAt"
     from "School" s
     join "MessageLog" m on m."schoolId" = s.id
     where s.id = $1`,
    [school.rows[0].id]
  );
  console.log("Joined read-back:", joined.rows[0]);
}

main()
  .catch((err) => {
    console.error("db:check FAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
