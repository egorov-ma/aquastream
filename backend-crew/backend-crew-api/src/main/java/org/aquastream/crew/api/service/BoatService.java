package org.aquastream.crew.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.api.dto.BoatDto;
import org.aquastream.crew.db.entity.BoatEntity;
import org.aquastream.crew.db.repository.BoatRepository;
import org.aquastream.crew.api.service.exception.BoatNotFoundException;
import org.aquastream.crew.api.service.mapper.BoatMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BoatService {

    private final BoatRepository boatRepository;
    private final BoatMapper boatMapper;

    public List<BoatDto> getBoats(UUID eventId, String boatType, String condition) {
        log.debug("Getting boats for event: {}, type: {}, condition: {}", 
                eventId, boatType, condition);

        List<BoatEntity> boats;

        if (boatType != null && condition != null) {
            boats = boatRepository.findByEventIdAndBoatTypeOrderByCreatedAt(eventId, boatType)
                    .stream()
                    .filter(boat -> boat.getCondition().name().equalsIgnoreCase(condition))
                    .toList();
        } else if (boatType != null) {
            boats = boatRepository.findByEventIdAndBoatTypeOrderByCreatedAt(eventId, boatType);
        } else if (condition != null) {
            BoatEntity.Condition conditionEnum = BoatEntity.Condition.valueOf(condition.toUpperCase());
            boats = boatRepository.findByConditionOrderByCreatedAt(conditionEnum)
                    .stream()
                    .filter(boat -> boat.getCrew().getEventId().equals(eventId))
                    .toList();
        } else {
            boats = boatRepository.findByEventIdOrderByCreatedAt(eventId);
        }

        return boats.stream()
                .map(boatMapper::toDto)
                .toList();
    }

    public BoatDto getBoat(UUID eventId, UUID boatId) {
        log.debug("Getting boat: {} for event: {}", boatId, eventId);

        BoatEntity boat = boatRepository.findById(boatId)
                .orElseThrow(() -> new BoatNotFoundException("Boat not found: " + boatId));

        if (!boat.getCrew().getEventId().equals(eventId)) {
            throw new BoatNotFoundException("Boat " + boatId + " not found in event " + eventId);
        }

        return boatMapper.toDto(boat);
    }
}