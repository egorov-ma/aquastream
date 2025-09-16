package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.db.entity.FaqItemEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.entity.TeamMemberEntity;
import org.aquastream.event.db.repository.FaqItemRepository;
import org.aquastream.event.db.repository.OrganizerRepository;
import org.aquastream.event.db.repository.TeamMemberRepository;
import org.aquastream.event.dto.*;
import org.aquastream.event.exception.OrganizerNotFoundException;
import org.aquastream.event.exception.UnauthorizedEventAccessException;
import org.aquastream.event.mapper.EventMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrganizerManagementService {

    private final TeamMemberRepository teamMemberRepository;
    private final FaqItemRepository faqItemRepository;
    private final OrganizerRepository organizerRepository;
    private final EventMapper eventMapper;

    // Team Member Management

    @Transactional(readOnly = true)
    public List<TeamMemberDto> getOrganizerTeamMembers(UUID organizerId) {
        log.info("Getting team members for organizer {}", organizerId);
        List<TeamMemberEntity> teamMembers = teamMemberRepository.findByOrganizerIdOrderBySortOrderAscCreatedAtAsc(organizerId);
        return teamMembers.stream().map(eventMapper::toTeamMemberDto).toList();
    }

    public TeamMemberDto createTeamMember(UUID organizerId, CreateTeamMemberRequest request) {
        log.info("Creating team member for organizer {}: {}", organizerId, request.getName());
        
        OrganizerEntity organizer = findOrganizerById(organizerId);
        
        TeamMemberEntity teamMember = TeamMemberEntity.builder()
                .organizer(organizer)
                .name(request.getName())
                .role(request.getRole())
                .photoUrl(request.getPhotoUrl())
                .bio(request.getBio())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .createdAt(Instant.now())
                .build();

        teamMember = teamMemberRepository.save(teamMember);
        log.info("Created team member {} for organizer {}", teamMember.getId(), organizerId);
        
        return eventMapper.toTeamMemberDto(teamMember);
    }

    public TeamMemberDto updateTeamMember(UUID organizerId, UUID teamMemberId, UpdateTeamMemberRequest request) {
        log.info("Updating team member {} for organizer {}", teamMemberId, organizerId);
        
        TeamMemberEntity teamMember = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new RuntimeException("Team member not found: " + teamMemberId));
        
        // Verify ownership
        if (!teamMember.getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedEventAccessException("Not authorized to modify this team member");
        }
        
        teamMember.setName(request.getName());
        teamMember.setRole(request.getRole());
        teamMember.setPhotoUrl(request.getPhotoUrl());
        teamMember.setBio(request.getBio());
        teamMember.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : teamMember.getSortOrder());
        
        teamMember = teamMemberRepository.save(teamMember);
        log.info("Updated team member {} for organizer {}", teamMemberId, organizerId);
        
        return eventMapper.toTeamMemberDto(teamMember);
    }

    public void deleteTeamMember(UUID organizerId, UUID teamMemberId) {
        log.info("Deleting team member {} for organizer {}", teamMemberId, organizerId);
        
        TeamMemberEntity teamMember = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new RuntimeException("Team member not found: " + teamMemberId));
        
        // Verify ownership
        if (!teamMember.getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedEventAccessException("Not authorized to delete this team member");
        }
        
        teamMemberRepository.delete(teamMember);
        log.info("Deleted team member {} for organizer {}", teamMemberId, organizerId);
    }

    // FAQ Management

    @Transactional(readOnly = true)
    public List<FaqItemDto> getOrganizerFaqItems(UUID organizerId) {
        log.info("Getting FAQ items for organizer {}", organizerId);
        List<FaqItemEntity> faqItems = faqItemRepository.findByOrganizerIdOrderBySortOrderAscCreatedAtAsc(organizerId);
        return faqItems.stream().map(eventMapper::toFaqItemDto).toList();
    }

    public FaqItemDto createFaqItem(UUID organizerId, CreateFaqItemRequest request) {
        log.info("Creating FAQ item for organizer {}: {}", organizerId, request.getQuestion());
        
        OrganizerEntity organizer = findOrganizerById(organizerId);
        
        FaqItemEntity faqItem = FaqItemEntity.builder()
                .organizer(organizer)
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        faqItem = faqItemRepository.save(faqItem);
        log.info("Created FAQ item {} for organizer {}", faqItem.getId(), organizerId);
        
        return eventMapper.toFaqItemDto(faqItem);
    }

    public FaqItemDto updateFaqItem(UUID organizerId, UUID faqItemId, UpdateFaqItemRequest request) {
        log.info("Updating FAQ item {} for organizer {}", faqItemId, organizerId);
        
        FaqItemEntity faqItem = faqItemRepository.findById(faqItemId)
                .orElseThrow(() -> new RuntimeException("FAQ item not found: " + faqItemId));
        
        // Verify ownership
        if (!faqItem.getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedEventAccessException("Not authorized to modify this FAQ item");
        }
        
        faqItem.setQuestion(request.getQuestion());
        faqItem.setAnswer(request.getAnswer());
        faqItem.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : faqItem.getSortOrder());
        faqItem.setUpdatedAt(Instant.now());
        
        faqItem = faqItemRepository.save(faqItem);
        log.info("Updated FAQ item {} for organizer {}", faqItemId, organizerId);
        
        return eventMapper.toFaqItemDto(faqItem);
    }

    public void deleteFaqItem(UUID organizerId, UUID faqItemId) {
        log.info("Deleting FAQ item {} for organizer {}", faqItemId, organizerId);
        
        FaqItemEntity faqItem = faqItemRepository.findById(faqItemId)
                .orElseThrow(() -> new RuntimeException("FAQ item not found: " + faqItemId));
        
        // Verify ownership
        if (!faqItem.getOrganizer().getId().equals(organizerId)) {
            throw new UnauthorizedEventAccessException("Not authorized to delete this FAQ item");
        }
        
        faqItemRepository.delete(faqItem);
        log.info("Deleted FAQ item {} for organizer {}", faqItemId, organizerId);
    }

    // Helper methods

    private OrganizerEntity findOrganizerById(UUID organizerId) {
        return organizerRepository.findById(organizerId)
                .orElseThrow(() -> new OrganizerNotFoundException("Organizer not found: " + organizerId));
    }
}