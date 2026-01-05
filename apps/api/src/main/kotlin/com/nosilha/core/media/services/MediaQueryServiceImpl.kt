package com.nosilha.core.media.services

import com.nosilha.core.media.api.MediaQueryService
import com.nosilha.core.media.domain.MediaStatus
import com.nosilha.core.media.repository.MediaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class MediaQueryServiceImpl(
    private val mediaRepository: MediaRepository
) : MediaQueryService {
    override fun countByStatus(status: MediaStatus): Long = mediaRepository.countByStatus(status)
}
