package org.aquastream.crew.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.api.dto.*;
import org.aquastream.crew.db.entity.BoatEntity;
import org.aquastream.crew.db.entity.CrewEntity;
import org.aquastream.crew.db.entity.TentEntity;
import org.aquastream.crew.db.repository.CrewRepository;
import org.aquastream.crew.service.exception.CrewCapacityExceededException;
import org.aquastream.crew.service.exception.CrewNotFoundException;
import org.aquastream.crew.service.mapper.CrewMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CrewService {

    private final CrewRepository crewRepository;
    private final CrewMapper crewMapper;

    @Transactional(readOnly = true)
    public List<CrewDto> getCrews(UUID eventId, String type, boolean availableOnly) {
        log.debug("Getting crews for event: {}, type: {}, availableOnly: {}", 
                eventId, type, availableOnly);

        List<CrewEntity> crews;
        
        if (availableOnly) {
            if (type != null) {
                CrewEntity.CrewType crewType = CrewEntity.CrewType.valueOf(type.toUpperCase());
                crews = crewRepository.findAvailableCrewsByType(eventId, crewType);
            } else {
                crews = crewRepository.findAvailableCrews(eventId);
            }
        } else {
            if (type != null) {
                CrewEntity.CrewType crewType = CrewEntity.CrewType.valueOf(type.toUpperCase());
                crews = crewRepository.findByEventIdAndTypeOrderByCreatedAt(eventId, crewType);
            } else {
                crews = crewRepository.findByEventIdOrderByCreatedAt(eventId);
            }
        }

        return crews.stream()
                .map(crewMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CrewDto getCrew(UUID eventId, UUID crewId) {
        log.debug("Getting crew: {} for event: {}", crewId, eventId);

        CrewEntity crew = crewRepository.findById(crewId)
                .orElseThrow(() -> new CrewNotFoundException("Crew not found: " + crewId));

        if (!crew.getEventId().equals(eventId)) {
            throw new CrewNotFoundException("Crew " + crewId + " not found in event " + eventId);
        }

        return crewMapper.toDto(crew);
    }

    public CrewDto createCrew(UUID eventId, CreateCrewDto createCrewDto) {
        log.info("Creating crew for event: {}: {}", eventId, createCrewDto.getName());

        // Check if crew with same name already exists
        crewRepository.findByEventIdAndName(eventId, createCrewDto.getName())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Crew with name '" + createCrewDto.getName() + 
                            "' already exists in event " + eventId);
                });

        CrewEntity crew = CrewEntity.builder()
                .eventId(eventId)
                .name(createCrewDto.getName())
                .type(CrewEntity.CrewType.valueOf(createCrewDto.getType().toUpperCase()))
                .capacity(createCrewDto.getCapacity())
                .currentSize(0)
                .description(createCrewDto.getDescription())
                .metadata(createCrewDto.getMetadata() != null ? createCrewDto.getMetadata() : Map.of())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        crew = crewRepository.save(crew);

        // Create boat if provided
        if (createCrewDto.getBoat() != null) {
            createBoatForCrew(crew, createCrewDto.getBoat());
        }

        // Create tent if provided
        if (createCrewDto.getTent() != null) {
            createTentForCrew(crew, createCrewDto.getTent());
        }

        return crewMapper.toDto(crew);
    }

    public CrewDto updateCrew(UUID eventId, UUID crewId, CreateCrewDto updateCrewDto) {
        log.info("Updating crew: {} for event: {}", crewId, eventId);

        CrewEntity crew = crewRepository.findById(crewId)
                .orElseThrow(() -> new CrewNotFoundException("Crew not found: " + crewId));

        if (!crew.getEventId().equals(eventId)) {
            throw new CrewNotFoundException("Crew " + crewId + " not found in event " + eventId);
        }

        // Check if new capacity is valid
        if (updateCrewDto.getCapacity() < crew.getCurrentSize()) {
            throw new CrewCapacityExceededException(
                    "Cannot reduce capacity to " + updateCrewDto.getCapacity() + 
                    " as current size is " + crew.getCurrentSize());
        }

        // Check name uniqueness if changed
        if (!crew.getName().equals(updateCrewDto.getName())) {
            crewRepository.findByEventIdAndName(eventId, updateCrewDto.getName())
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Crew with name '" + updateCrewDto.getName() + 
                                "' already exists in event " + eventId);
                    });
        }

        crew.setName(updateCrewDto.getName());
        crew.setType(CrewEntity.CrewType.valueOf(updateCrewDto.getType().toUpperCase()));
        crew.setCapacity(updateCrewDto.getCapacity());
        crew.setDescription(updateCrewDto.getDescription());
        crew.setMetadata(updateCrewDto.getMetadata() != null ? updateCrewDto.getMetadata() : Map.of());
        crew.setUpdatedAt(Instant.now());

        crew = crewRepository.save(crew);
        return crewMapper.toDto(crew);
    }

    public void deleteCrew(UUID eventId, UUID crewId) {
        log.info("Deleting crew: {} for event: {}", crewId, eventId);

        CrewEntity crew = crewRepository.findById(crewId)
                .orElseThrow(() -> new CrewNotFoundException("Crew not found: " + crewId));

        if (!crew.getEventId().equals(eventId)) {
            throw new CrewNotFoundException("Crew " + crewId + " not found in event " + eventId);
        }

        if (crew.getCurrentSize() > 0) {
            throw new IllegalArgumentException("Cannot delete crew with active assignments");
        }

        crewRepository.delete(crew);
    }

    public void validateCrewCapacity(UUID crewId) {
        CrewEntity crew = crewRepository.findById(crewId)
                .orElseThrow(() -> new CrewNotFoundException("Crew not found: " + crewId));

        if (crew.getCurrentSize() >= crew.getCapacity()) {
            throw new CrewCapacityExceededException(
                    "Crew capacity exceeded. Current: " + crew.getCurrentSize() + 
                    ", Capacity: " + crew.getCapacity());
        }
    }

    private void createBoatForCrew(CrewEntity crew, CreateBoatDto boatDto) {
        BoatEntity boat = BoatEntity.builder()
                .crew(crew)
                .boatNumber(boatDto.getBoatNumber())
                .boatType(boatDto.getBoatType())
                .brand(boatDto.getBrand())
                .model(boatDto.getModel())
                .yearManufactured(boatDto.getYearManufactured())
                .lengthMeters(boatDto.getLengthMeters())
                .maxWeightKg(boatDto.getMaxWeightKg())
                .condition(boatDto.getCondition() != null ? 
                        BoatEntity.Condition.valueOf(boatDto.getCondition().toUpperCase()) : 
                        BoatEntity.Condition.GOOD)
                .equipment(boatDto.getEquipment() != null ? boatDto.getEquipment() : Map.of())
                .maintenanceNotes(boatDto.getMaintenanceNotes())
                .lastInspection(boatDto.getLastInspection())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        crew.setBoat(boat);
    }

    private void createTentForCrew(CrewEntity crew, CreateTentDto tentDto) {
        TentEntity tent = TentEntity.builder()
                .crew(crew)
                .tentNumber(tentDto.getTentNumber())
                .tentType(tentDto.getTentType())
                .brand(tentDto.getBrand())
                .model(tentDto.getModel())
                .capacityPersons(tentDto.getCapacityPersons())
                .seasonRating(tentDto.getSeasonRating() != null ? 
                        TentEntity.SeasonRating.valueOf(tentDto.getSeasonRating().toUpperCase()) : null)
                .waterproofRating(tentDto.getWaterproofRating())
                .setupDifficulty(tentDto.getSetupDifficulty() != null ? 
                        TentEntity.SetupDifficulty.valueOf(tentDto.getSetupDifficulty().toUpperCase()) : 
                        TentEntity.SetupDifficulty.MEDIUM)
                .weightKg(tentDto.getWeightKg())
                .packedSizeCm(tentDto.getPackedSizeCm())
                .condition(tentDto.getCondition() != null ? 
                        TentEntity.Condition.valueOf(tentDto.getCondition().toUpperCase()) : 
                        TentEntity.Condition.GOOD)
                .equipment(tentDto.getEquipment() != null ? tentDto.getEquipment() : Map.of())
                .maintenanceNotes(tentDto.getMaintenanceNotes())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        crew.setTent(tent);
    }
}