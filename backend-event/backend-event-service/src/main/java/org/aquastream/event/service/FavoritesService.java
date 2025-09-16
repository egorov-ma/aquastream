package org.aquastream.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.FavoritesEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.FavoritesRepository;
import org.aquastream.event.dto.FavoriteActionResult;
import org.aquastream.event.dto.FavoriteEventDto;
import org.aquastream.event.mapper.EventMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing user favorites.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FavoritesService {
    
    private final FavoritesRepository favoritesRepository;
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    
    /**
     * Add event to user's favorites.
     */
    @Transactional
    public FavoriteActionResult addToFavorites(UUID userId, UUID eventId) {
        log.debug("Adding event {} to favorites for user {}", eventId, userId);
        
        // Check if event exists
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        
        // Check if already favorited
        if (favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)) {
            log.debug("Event {} is already in favorites for user {}", eventId, userId);
            return FavoriteActionResult.alreadyExists(eventId);
        }
        
        // Create new favorite
        FavoritesEntity.FavoritesId id = new FavoritesEntity.FavoritesId(userId, eventId);
        FavoritesEntity favorite = FavoritesEntity.builder()
                .id(id)
                .build();
        
        favoritesRepository.save(favorite);
        
        log.info("user.favorite.added userId={} eventId={} eventTitle={}", 
                userId, eventId, event.getTitle());
        
        return FavoriteActionResult.added(eventId);
    }
    
    /**
     * Remove event from user's favorites.
     */
    @Transactional
    public FavoriteActionResult removeFromFavorites(UUID userId, UUID eventId) {
        log.debug("Removing event {} from favorites for user {}", eventId, userId);
        
        // Check if favorite exists
        if (!favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)) {
            log.debug("Event {} is not in favorites for user {}", eventId, userId);
            return FavoriteActionResult.notFound(eventId);
        }
        
        // Remove favorite
        int deletedCount = favoritesRepository.deleteByUserIdAndEventId(userId, eventId);
        
        if (deletedCount > 0) {
            log.info("user.favorite.removed userId={} eventId={}", userId, eventId);
            return FavoriteActionResult.removed(eventId);
        } else {
            log.warn("Failed to remove favorite userId={} eventId={}", userId, eventId);
            return FavoriteActionResult.notFound(eventId);
        }
    }
    
    /**
     * Get all favorite events for a user.
     */
    @Transactional(readOnly = true)
    public List<FavoriteEventDto> getUserFavorites(UUID userId) {
        log.debug("Getting favorites for user {}", userId);
        
        List<FavoritesEntity> favorites = favoritesRepository.findByUserIdWithEvents(userId);
        
        return favorites.stream()
                .map(this::toFavoriteEventDto)
                .toList();
    }
    
    /**
     * Check if user has favorited a specific event.
     */
    @Transactional(readOnly = true)
    public boolean isFavorited(UUID userId, UUID eventId) {
        return favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId);
    }
    
    /**
     * Get favorite count for an event.
     */
    @Transactional(readOnly = true)
    public Long getFavoriteCount(UUID eventId) {
        return favoritesRepository.countByEventId(eventId);
    }
    
    /**
     * Get favorite count for a user.
     */
    @Transactional(readOnly = true)
    public Long getUserFavoriteCount(UUID userId) {
        return favoritesRepository.countByUserId(userId);
    }
    
    /**
     * Get users who have favorited a specific event.
     * Useful for sending notifications about event changes.
     */
    @Transactional(readOnly = true)
    public List<UUID> getUsersWhoFavorited(UUID eventId) {
        return favoritesRepository.findUserIdsByEventId(eventId);
    }
    
    /**
     * Clean up favorites for deleted user.
     * Called when user account is deleted.
     */
    @Transactional
    public int removeAllUserFavorites(UUID userId) {
        log.info("Removing all favorites for deleted user {}", userId);
        return favoritesRepository.deleteByUserId(userId);
    }
    
    /**
     * Clean up favorites for deleted event.
     * Called when event is deleted.
     */
    @Transactional
    public int removeAllEventFavorites(UUID eventId) {
        log.info("Removing all favorites for deleted event {}", eventId);
        return favoritesRepository.deleteByEventId(eventId);
    }
    
    /**
     * Convert FavoritesEntity to FavoriteEventDto.
     */
    private FavoriteEventDto toFavoriteEventDto(FavoritesEntity favorite) {
        EventEntity event = favorite.getEvent();
        OrganizerEntity organizer = event.getOrganizer();
        
        return new FavoriteEventDto(
                event.getId(),
                organizer.getId(),
                organizer.getSlug(),
                organizer.getName(),
                event.getType(),
                event.getTitle(),
                event.getDateStart(),
                event.getDateEnd(),
                event.getLocation(),
                event.getPrice() != null ? event.getPrice().doubleValue() : null,
                event.getCapacity(),
                event.getAvailable(),
                event.getStatus(),
                event.getTags(),
                favorite.getCreatedAt()
        );
    }
}