package com.nosilha.core.stories.services

import com.nosilha.core.stories.api.StoriesQueryService
import com.nosilha.core.stories.domain.StoryStatus
import com.nosilha.core.stories.repository.StorySubmissionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional(readOnly = true)
class StoriesQueryServiceImpl(
    private val storySubmissionRepository: StorySubmissionRepository,
) : StoriesQueryService {
    override fun countByStatus(status: StoryStatus): Long = storySubmissionRepository.countByStatus(status)

    override fun countDistinctAuthorsByCreatedAtAfter(since: Instant): Long =
        storySubmissionRepository.countDistinctAuthorsByCreatedAtAfter(since)

    override fun countByCreatedAtBetween(
        start: Instant,
        end: Instant,
    ): Long = storySubmissionRepository.countByCreatedAtBetween(start, end)

    override fun findTopContributorsByStoryCount(): List<Array<Any>> = storySubmissionRepository.findTopContributorsByStoryCount()
}
