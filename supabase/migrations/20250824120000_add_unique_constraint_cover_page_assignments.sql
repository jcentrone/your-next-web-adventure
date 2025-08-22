DO $$ BEGIN
    ALTER TABLE public.cover_page_assignments
        ADD CONSTRAINT cover_page_assignments_user_id_report_type_key
        UNIQUE (user_id, report_type);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
