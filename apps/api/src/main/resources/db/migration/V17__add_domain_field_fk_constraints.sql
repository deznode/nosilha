-- V17: Add FK constraints on domain user reference fields (now UUID type from V16)
-- Deferred from original V15 (Wave 1) to Wave 2

-- Gallery Media
ALTER TABLE gallery_media ADD CONSTRAINT fk_gallery_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE gallery_media ADD CONSTRAINT fk_gallery_media_curated_by FOREIGN KEY (curated_by) REFERENCES users(id);

-- Directory Entries
ALTER TABLE directory_entries ADD CONSTRAINT fk_directory_entries_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id);
ALTER TABLE directory_entries ADD CONSTRAINT fk_directory_entries_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id);

-- Story Submissions
ALTER TABLE story_submissions ADD CONSTRAINT fk_story_submissions_author_id FOREIGN KEY (author_id) REFERENCES users(id);
ALTER TABLE story_submissions ADD CONSTRAINT fk_story_submissions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id);
ALTER TABLE story_submissions ADD CONSTRAINT fk_story_submissions_archived_by FOREIGN KEY (archived_by) REFERENCES users(id);

-- Suggestions
ALTER TABLE suggestions ADD CONSTRAINT fk_suggestions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id);

-- User Profiles
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- Bookmarks
ALTER TABLE bookmarks ADD CONSTRAINT fk_bookmarks_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- Reactions
ALTER TABLE reactions ADD CONSTRAINT fk_reactions_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- Former standalone entities (columns renamed to created_by in V16)
ALTER TABLE media_moderation_audit ADD CONSTRAINT fk_media_moderation_audit_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE mdx_archives ADD CONSTRAINT fk_mdx_archives_created_by FOREIGN KEY (created_by) REFERENCES users(id);
