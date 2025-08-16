package org.aquastream.event.mapper;

import org.aquastream.event.dto.*;
import org.aquastream.event.db.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventMapper {

    public OrganizerDto toOrganizerDto(OrganizerEntity entity) {
        if (entity == null) return null;
        
        return OrganizerDto.builder()
                .id(entity.getId())
                .slug(entity.getSlug())
                .name(entity.getName())
                .logoUrl(entity.getLogoUrl())
                .description(entity.getDescription())
                .contacts(entity.getContacts())
                .brandColor(entity.getBrandColor())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public OrganizerDto toOrganizerDto(OrganizerEntity entity, Long eventCount) {
        OrganizerDto dto = toOrganizerDto(entity);
        if (dto != null) {
            dto.setEventCount(eventCount);
        }
        return dto;
    }

    public EventDto toEventDto(EventEntity entity) {
        if (entity == null) return null;
        
        return EventDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .dateStart(entity.getDateStart())
                .dateEnd(entity.getDateEnd())
                .location(entity.getLocation())
                .price(entity.getPrice())
                .capacity(entity.getCapacity())
                .available(entity.getAvailable())
                .status(entity.getStatus())
                .tags(entity.getTags())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public EventDto toEventDtoWithOrganizer(EventEntity entity) {
        EventDto dto = toEventDto(entity);
        if (dto != null && entity.getOrganizer() != null) {
            dto.setOrganizer(toOrganizerDto(entity.getOrganizer()));
        }
        return dto;
    }

    public TeamMemberDto toTeamMemberDto(TeamMemberEntity entity) {
        if (entity == null) return null;
        
        return TeamMemberDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .role(entity.getRole())
                .photoUrl(entity.getPhotoUrl())
                .bio(entity.getBio())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public FaqItemDto toFaqItemDto(FaqItemEntity entity) {
        if (entity == null) return null;
        
        return FaqItemDto.builder()
                .id(entity.getId())
                .question(entity.getQuestion())
                .answer(entity.getAnswer())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public OrganizerDetailDto toOrganizerDetailDto(OrganizerEntity entity, 
                                                   List<EventEntity> events,
                                                   List<TeamMemberEntity> teamMembers,
                                                   List<FaqItemEntity> faqItems) {
        if (entity == null) return null;
        
        return OrganizerDetailDto.builder()
                .id(entity.getId())
                .slug(entity.getSlug())
                .name(entity.getName())
                .logoUrl(entity.getLogoUrl())
                .description(entity.getDescription())
                .contacts(entity.getContacts())
                .brandColor(entity.getBrandColor())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .events(events != null ? events.stream().map(this::toEventDto).collect(Collectors.toList()) : null)
                .teamMembers(teamMembers != null ? teamMembers.stream().map(this::toTeamMemberDto).collect(Collectors.toList()) : null)
                .faqItems(faqItems != null ? faqItems.stream().map(this::toFaqItemDto).collect(Collectors.toList()) : null)
                .build();
    }

    public <T> PagedResponse<T> toPagedResponse(org.springframework.data.domain.Page<T> page) {
        return PagedResponse.<T>builder()
                .items(page.getContent())
                .total(page.getTotalElements())
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}