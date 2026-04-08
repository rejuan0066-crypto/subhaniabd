
-- Update roll numbers for all students: class-based serial like 101, 102... for class 1, 201, 202... for class 2
-- Classes are ordered globally by division sort_order then class sort_order

DO $$
DECLARE
  class_rec RECORD;
  student_rec RECORD;
  class_index INT := 0;
  student_index INT;
  new_roll TEXT;
BEGIN
  FOR class_rec IN 
    SELECT c.id 
    FROM classes c 
    JOIN divisions d ON c.division_id = d.id 
    WHERE c.is_active = true 
    ORDER BY d.sort_order, c.sort_order
  LOOP
    class_index := class_index + 1;
    student_index := 0;
    
    FOR student_rec IN 
      SELECT id FROM students 
      WHERE class_id = class_rec.id 
      ORDER BY roll_number, created_at
    LOOP
      student_index := student_index + 1;
      new_roll := (class_index * 100 + student_index)::TEXT;
      UPDATE students SET roll_number = new_roll WHERE id = student_rec.id;
    END LOOP;
  END LOOP;
END $$;
