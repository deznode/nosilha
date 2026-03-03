package com.nosilha.core.gallery.services

import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class MediaQueryServiceImpl(
    private val mediaRepository: GalleryMediaRepository
) : MediaQueryService {
    override fun countByStatus(status: GalleryMediaStatus): Long = mediaRepository.countByStatus(status)
}
