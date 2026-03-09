package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.YouTubeSyncConfigEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface YouTubeSyncConfigRepository : JpaRepository<YouTubeSyncConfigEntity, UUID>
