-- Enable unaccent extension (strips accent marks for comparison)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Search books by title or author name, accent- and case-insensitive
CREATE OR REPLACE FUNCTION search_books_unaccent(q text)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT DISTINCT b.id
  FROM book b
  JOIN "user" u ON u.id = b.author_id
  WHERE b.status IN ('published', 'presale')
    AND (
      unaccent(lower(b.title))      LIKE '%' || unaccent(lower(q)) || '%'
      OR unaccent(lower(u.full_name)) LIKE '%' || unaccent(lower(q)) || '%'
    )
$$;
