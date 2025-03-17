-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 20 AND 60),
  email TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL CHECK (char_length(address) <= 400),
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
  password TEXT NOT NULL CHECK (char_length(password) BETWEEN 8 AND 16), 
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 3 AND 100),
  email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1), 
  address TEXT NOT NULL CHECK (char_length(address) <= 400),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  average_rating NUMERIC DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, store_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Stores policies
CREATE POLICY "Anyone can read stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Store owners can manage their stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- Ratings policies
CREATE POLICY "Users can read all ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create and update their own ratings"
  ON ratings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update store average rating
CREATE OR REPLACE FUNCTION update_store_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores
  SET average_rating = (
    SELECT ROUND(AVG(rating)::NUMERIC, 2)
    FROM ratings
    WHERE store_id = NEW.store_id
  )
  WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update store average rating
CREATE TRIGGER update_store_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_store_average_rating();

-- -- Policy to allow user registration
-- CREATE POLICY "Users can insert their own data during registration"
--   ON users
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = id);
