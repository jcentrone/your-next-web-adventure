-- Fix corrupted media records that are missing the 'type' field
-- Since we can see from the error that there are blob URLs ending in .png, we can infer these are images

-- First, let's update any media objects that have missing or null type fields
-- We'll infer the type from the URL/filename extension
UPDATE reports 
SET sections = (
  SELECT jsonb_agg(
    CASE 
      WHEN jsonb_typeof(section) = 'object' THEN
        section || jsonb_build_object(
          'findings', 
          COALESCE(
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN jsonb_typeof(finding) = 'object' THEN
                    finding || jsonb_build_object(
                      'media',
                      COALESCE(
                        (
                          SELECT jsonb_agg(
                            CASE 
                              WHEN jsonb_typeof(media_item) = 'object' THEN
                                CASE 
                                  -- If type is missing or null, infer from URL
                                  WHEN media_item->>'type' IS NULL OR media_item->>'type' = '' THEN
                                    media_item || jsonb_build_object(
                                      'type', 
                                      CASE 
                                        WHEN media_item->>'url' LIKE '%.png' OR media_item->>'url' LIKE '%.jpg' OR media_item->>'url' LIKE '%.jpeg' OR media_item->>'url' LIKE '%.gif' OR media_item->>'url' LIKE '%.webp' OR media_item->>'url' LIKE 'blob:%' THEN 'image'
                                        WHEN media_item->>'url' LIKE '%.mp4' OR media_item->>'url' LIKE '%.webm' OR media_item->>'url' LIKE '%.mov' THEN 'video'
                                        WHEN media_item->>'url' LIKE '%.mp3' OR media_item->>'url' LIKE '%.wav' OR media_item->>'url' LIKE '%.ogg' THEN 'audio'
                                        ELSE 'image'  -- Default to image if we can't determine
                                      END
                                    )
                                  ELSE media_item
                                END
                              ELSE media_item
                            END
                          )
                          FROM jsonb_array_elements(finding->'media') AS media_item
                        ),
                        '[]'::jsonb
                      )
                    )
                  ELSE finding
                END
              )
              FROM jsonb_array_elements(section->'findings') AS finding
            ),
            '[]'::jsonb
          )
        )
      ELSE section
    END
  )
  FROM jsonb_array_elements(sections) AS section
)
WHERE sections IS NOT NULL
AND jsonb_typeof(sections) = 'array'
AND EXISTS (
  SELECT 1 
  FROM jsonb_array_elements(sections) AS section,
       jsonb_array_elements(section->'findings') AS finding,
       jsonb_array_elements(finding->'media') AS media_item
  WHERE jsonb_typeof(media_item) = 'object' 
  AND (media_item->>'type' IS NULL OR media_item->>'type' = '')
);