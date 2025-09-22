package org.aquastream.crew.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.dto.TentDto;
import org.aquastream.crew.db.entity.TentEntity;
import org.aquastream.crew.db.repository.TentRepository;
import org.aquastream.crew.service.exception.TentNotFoundException;
import org.aquastream.crew.service.mapper.TentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TentService {

    private final TentRepository tentRepository;
    private final TentMapper tentMapper;

    public List<TentDto> getTents(UUID eventId, String tentType, String seasonRating, String condition) {
        log.debug("Getting tents for event: {}, type: {}, season: {}, condition: {}", 
                eventId, tentType, seasonRating, condition);

        List<TentEntity> tents;

        if (tentType != null && seasonRating != null && condition != null) {
            TentEntity.SeasonRating seasonEnum = TentEntity.SeasonRating.valueOf(seasonRating.toUpperCase());
            TentEntity.Condition conditionEnum = TentEntity.Condition.valueOf(condition.toUpperCase());
            tents = tentRepository.findByEventIdAndTentTypeOrderByCreatedAt(eventId, tentType)
                    .stream()
                    .filter(tent -> tent.getSeasonRating() == seasonEnum && tent.getCondition() == conditionEnum)
                    .toList();
        } else if (tentType != null) {
            tents = tentRepository.findByEventIdAndTentTypeOrderByCreatedAt(eventId, tentType);
        } else if (seasonRating != null) {
            TentEntity.SeasonRating seasonEnum = TentEntity.SeasonRating.valueOf(seasonRating.toUpperCase());
            tents = tentRepository.findBySeasonRatingOrderByCreatedAt(seasonEnum)
                    .stream()
                    .filter(tent -> tent.getCrew().getEventId().equals(eventId))
                    .toList();
        } else if (condition != null) {
            TentEntity.Condition conditionEnum = TentEntity.Condition.valueOf(condition.toUpperCase());
            tents = tentRepository.findByConditionOrderByCreatedAt(conditionEnum)
                    .stream()
                    .filter(tent -> tent.getCrew().getEventId().equals(eventId))
                    .toList();
        } else {
            tents = tentRepository.findByEventIdOrderByCreatedAt(eventId);
        }

        return tents.stream()
                .map(tentMapper::toDto)
                .toList();
    }

    public TentDto getTent(UUID eventId, UUID tentId) {
        log.debug("Getting tent: {} for event: {}", tentId, eventId);

        TentEntity tent = tentRepository.findById(tentId)
                .orElseThrow(() -> new TentNotFoundException("Tent not found: " + tentId));

        if (!tent.getCrew().getEventId().equals(eventId)) {
            throw new TentNotFoundException("Tent " + tentId + " not found in event " + eventId);
        }

        return tentMapper.toDto(tent);
    }
}
