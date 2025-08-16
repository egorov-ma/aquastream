package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.event.dto.*;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.FaqItemEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.entity.TeamMemberEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.FaqItemRepository;
import org.aquastream.event.db.repository.OrganizerRepository;
import org.aquastream.event.db.repository.TeamMemberRepository;
import org.aquastream.event.mapper.EventMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicEventService {

    private final OrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final FaqItemRepository faqItemRepository;
    private final EventMapper eventMapper;

    public PagedResponse<OrganizerDto> getOrganizers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<OrganizerEntity> organizersPage = organizerRepository.findBySearchTerm(search, pageable);
        
        Page<OrganizerDto> dtoPage = organizersPage.map(organizer -> {
            Long eventCount = eventRepository.countByOrganizerSlug(organizer.getSlug());
            return eventMapper.toOrganizerDto(organizer, eventCount);
        });
        
        return eventMapper.toPagedResponse(dtoPage);
    }

    public OrganizerDetailDto getOrganizerBySlug(String slug) {
        OrganizerEntity organizer = organizerRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Organizer not found: " + slug));

        // Получаем связанные данные
        List<EventEntity> events = eventRepository.findByOrganizerSlug(
                slug, 
                PageRequest.of(0, 20, Sort.by("dateStart").descending())
        ).getContent();
        
        List<TeamMemberEntity> teamMembers = teamMemberRepository.findByOrganizerSlugOrderBySortOrder(slug);
        List<FaqItemEntity> faqItems = faqItemRepository.findByOrganizerSlugOrderBySortOrder(slug);

        return eventMapper.toOrganizerDetailDto(organizer, events, teamMembers, faqItems);
    }

    public PagedResponse<EventDto> getOrganizerEvents(String organizerSlug, 
                                                      String status, 
                                                      String type,
                                                      BigDecimal minPrice,
                                                      BigDecimal maxPrice,
                                                      Instant dateFrom,
                                                      Instant dateTo,
                                                      int page, 
                                                      int size) {
        
        // Проверяем существование организатора
        if (!organizerRepository.existsBySlug(organizerSlug)) {
            throw new RuntimeException("Organizer not found: " + organizerSlug);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("dateStart").ascending());
        Page<EventEntity> eventsPage = eventRepository.findByOrganizerSlugWithFilters(
                organizerSlug, status, type, minPrice, maxPrice, dateFrom, dateTo, pageable
        );

        Page<EventDto> dtoPage = eventsPage.map(eventMapper::toEventDto);
        return eventMapper.toPagedResponse(dtoPage);
    }

    public EventDto getEventById(UUID eventId) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        return eventMapper.toEventDtoWithOrganizer(event);
    }

    public PagedResponse<EventDto> getEvents(String status,
                                             String type,
                                             BigDecimal minPrice,
                                             BigDecimal maxPrice,
                                             Instant dateFrom,
                                             Instant dateTo,
                                             String search,
                                             int page,
                                             int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateStart").ascending());
        Page<EventEntity> eventsPage = eventRepository.findWithFilters(
                status, type, minPrice, maxPrice, dateFrom, dateTo, search, pageable
        );

        Page<EventDto> dtoPage = eventsPage.map(eventMapper::toEventDtoWithOrganizer);
        return eventMapper.toPagedResponse(dtoPage);
    }
}