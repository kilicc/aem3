-- Tool Assignments Tablosu Güncelleme
-- Zimmetten bırakma isteği ve onay/red sistemi için

-- Mevcut tabloyu güncelle
ALTER TABLE tool_assignments 
  ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS return_notes TEXT,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Status değerlerini güncelle
ALTER TABLE tool_assignments 
  DROP CONSTRAINT IF EXISTS tool_assignments_status_check;

ALTER TABLE tool_assignments 
  ADD CONSTRAINT tool_assignments_status_check 
  CHECK (status IN ('assigned', 'return_requested', 'returned', 'rejected'));

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_tool_assignments_return_requested ON tool_assignments(return_requested_at) 
  WHERE status = 'return_requested';
CREATE INDEX IF NOT EXISTS idx_tool_assignments_assigned_to ON tool_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tool_assignments_status ON tool_assignments(status);

