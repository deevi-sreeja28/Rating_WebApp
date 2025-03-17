/*
  # Add user registration policy

  1. Security
    - Add policy to allow new users to insert their own data during registration
    - This policy is essential for the registration process to work
*/

CREATE POLICY "Users can insert their own data during registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );