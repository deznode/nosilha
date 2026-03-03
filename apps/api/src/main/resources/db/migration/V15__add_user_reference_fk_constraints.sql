-- V15: Add FK constraints on new audit columns -> users(id)
-- FK constraints on domain fields (uploaded_by, submitted_by, etc.) are deferred
-- to V17 (Wave 2) when those columns are converted from VARCHAR to UUID

-- ============================================================
-- New audit columns (created_by/updated_by)
-- ============================================================

ALTER TABLE towns ADD CONSTRAINT fk_towns_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE towns ADD CONSTRAINT fk_towns_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE directory_entries ADD CONSTRAINT fk_directory_entries_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE directory_entries ADD CONSTRAINT fk_directory_entries_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE gallery_media ADD CONSTRAINT fk_gallery_media_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE gallery_media ADD CONSTRAINT fk_gallery_media_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE contact_messages ADD CONSTRAINT fk_contact_messages_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE contact_messages ADD CONSTRAINT fk_contact_messages_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE ai_analysis_log ADD CONSTRAINT fk_ai_analysis_log_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ai_analysis_log ADD CONSTRAINT fk_ai_analysis_log_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE ai_analysis_batch ADD CONSTRAINT fk_ai_analysis_batch_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ai_analysis_batch ADD CONSTRAINT fk_ai_analysis_batch_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE ai_api_usage ADD CONSTRAINT fk_ai_api_usage_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE ai_api_usage ADD CONSTRAINT fk_ai_api_usage_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE content ADD CONSTRAINT fk_content_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE content ADD CONSTRAINT fk_content_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE story_submissions ADD CONSTRAINT fk_story_submissions_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE story_submissions ADD CONSTRAINT fk_story_submissions_updated_by FOREIGN KEY (updated_by) REFERENCES users(id);
ALTER TABLE reactions ADD CONSTRAINT fk_reactions_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE bookmarks ADD CONSTRAINT fk_bookmarks_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE suggestions ADD CONSTRAINT fk_suggestions_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id);
