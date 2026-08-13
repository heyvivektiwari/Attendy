import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

// GET: Fetch list of absent lecture IDs for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentIdStr = searchParams.get("studentId")
    const rollNo = searchParams.get("rollNo")
    
    const db = getDb()
    
    let studentId: number | null = null
    if (rollNo && typeof rollNo === "string" && rollNo.trim()) {
      const studentRes = await db.query(
        "SELECT id FROM students WHERE LOWER(roll_no) = LOWER($1)",
        [rollNo.trim()]
      )
      if (studentRes.rows[0]) {
        studentId = studentRes.rows[0].id
      }
    }
    
    if (!studentId && studentIdStr && studentIdStr !== "undefined") {
      studentId = parseInt(studentIdStr)
    }
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student not found or missing credentials" },
        { status: 400 }
      )
    }
    
    const absencesRes = await db.query(
      "SELECT lecture_id FROM student_absences WHERE student_id = $1",
      [studentId]
    )
    const absences = absencesRes.rows.map((r) => r.lecture_id)
    
    return NextResponse.json({ success: true, absences })
  } catch (error: any) {
    console.error("GET /api/attendance error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST: Save list of absent lecture IDs for a student
export async function POST(request: NextRequest) {
  try {
    const { studentId, rollNo, absentLectureIds } = await request.json()
    
    const db = getDb()
    
    let targetStudentId: number | null = null
    if (rollNo && typeof rollNo === "string" && rollNo.trim()) {
      const studentRes = await db.query(
        "SELECT id FROM students WHERE LOWER(roll_no) = LOWER($1)",
        [rollNo.trim()]
      )
      if (studentRes.rows[0]) {
        targetStudentId = studentRes.rows[0].id
      }
    }
    
    if (!targetStudentId && studentId && studentId !== "undefined") {
      targetStudentId = parseInt(studentId)
    }
    
    if (!targetStudentId) {
      return NextResponse.json(
        { success: false, message: "Student not found or missing credentials" },
        { status: 400 }
      )
    }
    
    // Sync the list of absences:
    // Delete all current records for the student and re-insert the list in a single transaction.
    const client = await db.connect()
    try {
      await client.query("BEGIN")
      await client.query("DELETE FROM student_absences WHERE student_id = $1", [targetStudentId])
      
      if (absentLectureIds && absentLectureIds.length > 0) {
        const values: any[] = []
        const placeholders: string[] = []
        
        absentLectureIds.forEach((lectureId: string, idx: number) => {
          values.push(targetStudentId, lectureId)
          placeholders.push(`($${idx * 2 + 1}, $${idx * 2 + 2})`)
        })
        
        const insertQuery = `
          INSERT INTO student_absences (student_id, lecture_id) 
          VALUES ${placeholders.join(", ")}
          ON CONFLICT (student_id, lecture_id) DO NOTHING
        `
        await client.query(insertQuery, values)
      }
      await client.query("COMMIT")
    } catch (txError) {
      await client.query("ROLLBACK")
      throw txError;
    } finally {
      client.release()
    }
    
    return NextResponse.json({
      success: true,
      message: "Absences updated successfully on cloud",
    })
  } catch (error: any) {
    console.error("POST /api/attendance error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
