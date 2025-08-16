package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.OrganizerRepository;
import org.aquastream.event.dto.CreateEventDto;
import org.aquastream.event.dto.EventDto;
import org.aquastream.event.dto.UpdateEventDto;
import org.aquastream.event.exception.EventConflictException;
import org.aquastream.event.exception.EventNotFoundException;
import org.aquastream.event.exception.OrganizerNotFoundException;
import org.aquastream.event.exception.UnauthorizedEventAccessException;
import org.aquastream.event.mapper.EventMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizerEventService {

    private final EventRepository eventRepository;
    private final OrganizerRepository organizerRepository;
    private final EventMapper eventMapper;

    public EventDto createEvent(CreateEventDto createEventDto, String organizerSlug) {
        // Проверяем существование организатора
        OrganizerEntity organizer = organizerRepository.findBySlug(organizerSlug)
                .orElseThrow(() -> new OrganizerNotFoundException("Organizer not found: " + organizerSlug));

        // Валидация дат
        validateDates(createEventDto.getDateStart(), createEventDto.getDateEnd());

        // Создаем новое событие
        EventEntity event = EventEntity.builder()
                .id(UUID.randomUUID())
                .organizerSlug(organizerSlug)
                .type(createEventDto.getType())
                .title(createEventDto.getTitle())
                .dateStart(createEventDto.getDateStart())
                .dateEnd(createEventDto.getDateEnd())
                .location(createEventDto.getLocation())
                .price(createEventDto.getPrice())
                .capacity(createEventDto.getCapacity())
                .available(createEventDto.getCapacity()) // Изначально доступно = capacity
                .status("draft") // Новые события создаются в статусе draft
                .tags(createEventDto.getTags())
                .description(createEventDto.getDescription())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        EventEntity savedEvent = eventRepository.save(event);
        return eventMapper.toEventDto(savedEvent);
    }

    public EventDto updateEvent(UUID eventId, UpdateEventDto updateEventDto, String organizerSlug) {
        // Проверяем существование события и права доступа
        EventEntity event = getEventWithOwnershipCheck(eventId, organizerSlug);

        // Проверяем, что событие в статусе draft (опубликованные события нельзя редактировать)
        if (!"draft".equals(event.getStatus())) {
            throw new EventConflictException("Cannot update published event");
        }

        // Обновляем поля, если они переданы
        if (updateEventDto.getTitle() != null) {
            event.setTitle(updateEventDto.getTitle());
        }
        if (updateEventDto.getDateStart() != null) {
            event.setDateStart(updateEventDto.getDateStart());
        }
        if (updateEventDto.getDateEnd() != null) {
            event.setDateEnd(updateEventDto.getDateEnd());
        }
        if (updateEventDto.getLocation() != null) {
            event.setLocation(updateEventDto.getLocation());
        }
        if (updateEventDto.getPrice() != null) {
            event.setPrice(updateEventDto.getPrice());
        }
        if (updateEventDto.getCapacity() != null) {
            event.setCapacity(updateEventDto.getCapacity());
            // При изменении capacity, также обновляем available
            event.setAvailable(updateEventDto.getCapacity());
        }
        if (updateEventDto.getTags() != null) {
            event.setTags(updateEventDto.getTags());
        }
        if (updateEventDto.getDescription() != null) {
            event.setDescription(updateEventDto.getDescription());
        }

        // Валидация дат если они изменились
        validateDates(event.getDateStart(), event.getDateEnd());

        event.setUpdatedAt(Instant.now());
        EventEntity savedEvent = eventRepository.save(event);
        return eventMapper.toEventDto(savedEvent);
    }

    public EventDto publishEvent(UUID eventId, String organizerSlug) {
        // Проверяем существование события и права доступа
        EventEntity event = getEventWithOwnershipCheck(eventId, organizerSlug);

        // Проверяем возможность публикации (только из draft в published)
        if (!"draft".equals(event.getStatus())) {
            throw new EventConflictException("Cannot publish event with status: " + event.getStatus());
        }

        // Дополнительная валидация перед публикацией
        validateEventForPublication(event);

        // Переводим в статус published
        event.setStatus("published");
        event.setUpdatedAt(Instant.now());

        EventEntity savedEvent = eventRepository.save(event);
        return eventMapper.toEventDto(savedEvent);
    }

    private EventEntity getEventWithOwnershipCheck(UUID eventId, String organizerSlug) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));

        // Проверяем права собственности
        if (!organizerSlug.equals(event.getOrganizerSlug())) {
            throw new UnauthorizedEventAccessException("You can only modify your own events");
        }

        return event;
    }

    private void validateDates(Instant dateStart, Instant dateEnd) {
        if (dateStart == null || dateEnd == null) {
            return; // Валидация @NotNull в DTO
        }
        
        if (dateStart.isAfter(dateEnd)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        if (dateStart.isBefore(Instant.now())) {
            throw new IllegalArgumentException("Start date must be in the future");
        }
    }

    private void validateEventForPublication(EventEntity event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Event title is required for publication");
        }
        if (event.getDateStart() == null || event.getDateEnd() == null) {
            throw new IllegalArgumentException("Event dates are required for publication");
        }
        if (event.getLocation() == null) {
            throw new IllegalArgumentException("Event location is required for publication");
        }
        if (event.getPrice() == null) {
            throw new IllegalArgumentException("Event price is required for publication");
        }
        if (event.getCapacity() == null || event.getCapacity() <= 0) {
            throw new IllegalArgumentException("Event capacity must be positive for publication");
        }
    }
}