package org.aquastream.crew.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.api.dto.CrewAssignmentDto;
import org.aquastream.crew.api.dto.CreateAssignmentDto;
import org.aquastream.crew.db.entity.CrewAssignmentEntity;
import org.aquastream.crew.db.entity.CrewEntity;
import org.aquastream.crew.db.repository.CrewAssignmentRepository;
import org.aquastream.crew.db.repository.CrewRepository;
import org.aquastream.crew.service.exception.AssignmentNotFoundException;
import org.aquastream.crew.service.exception.CrewCapacityExceededException;
import org.aquastream.crew.service.exception.CrewNotFoundException;
import org.aquastream.crew.service.mapper.CrewAssignmentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AssignmentService {

    private final CrewAssignmentRepository assignmentRepository;
    private final CrewRepository crewRepository;
    private final CrewAssignmentMapper assignmentMapper;
    private final CrewService crewService;

    public CrewAssignmentDto createAssignment(CreateAssignmentDto createAssignmentDto) {
        log.info("Creating assignment for user: {} to crew: {}", 
                createAssignmentDto.getUserId(), createAssignmentDto.getCrewId());

        // Validate crew capacity
        crewService.validateCrewCapacity(createAssignmentDto.getCrewId());

        CrewEntity crew = crewRepository.findById(createAssignmentDto.getCrewId())
                .orElseThrow(() -> new CrewNotFoundException("Crew not found: " + createAssignmentDto.getCrewId()));

        // Check if user is already assigned to a crew in this event
        assignmentRepository.findByEventIdAndUserIdAndStatus(
                crew.getEventId(), 
                createAssignmentDto.getUserId(), 
                CrewAssignmentEntity.AssignmentStatus.ACTIVE)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("User " + createAssignmentDto.getUserId() + 
                            " is already assigned to a crew in event " + crew.getEventId());
                });

        // Check if booking is already assigned
        assignmentRepository.findByBookingIdAndStatus(
                createAssignmentDto.getBookingId(), 
                CrewAssignmentEntity.AssignmentStatus.ACTIVE)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Booking " + createAssignmentDto.getBookingId() + 
                            " is already assigned to a crew");
                });

        // Check seat number availability if provided
        if (createAssignmentDto.getSeatNumber() != null) {
            assignmentRepository.findByCrewIdAndSeatNumberAndStatus(
                    createAssignmentDto.getCrewId(),
                    createAssignmentDto.getSeatNumber(),
                    CrewAssignmentEntity.AssignmentStatus.ACTIVE)
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Seat " + createAssignmentDto.getSeatNumber() + 
                                " is already occupied in crew " + createAssignmentDto.getCrewId());
                    });
        }

        // Create assignment
        CrewAssignmentEntity assignment = CrewAssignmentEntity.builder()
                .crew(crew)
                .userId(createAssignmentDto.getUserId())
                .bookingId(createAssignmentDto.getBookingId())
                .seatNumber(createAssignmentDto.getSeatNumber())
                .position(createAssignmentDto.getPosition())
                .assignedBy(createAssignmentDto.getUserId()) // For now, user assigns themselves
                .assignedAt(Instant.now())
                .status(CrewAssignmentEntity.AssignmentStatus.ACTIVE)
                .notes(createAssignmentDto.getNotes())
                .createdAt(Instant.now())
                .build();

        assignment = assignmentRepository.save(assignment);

        // Update crew current size
        crew.setCurrentSize(crew.getCurrentSize() + 1);
        crew.setUpdatedAt(Instant.now());
        crewRepository.save(crew);

        return assignmentMapper.toDto(assignment);
    }

    public void removeAssignment(UUID assignmentId) {
        log.info("Removing assignment: {}", assignmentId);

        CrewAssignmentEntity assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found: " + assignmentId));

        if (assignment.getStatus() != CrewAssignmentEntity.AssignmentStatus.ACTIVE) {
            throw new IllegalArgumentException("Assignment " + assignmentId + " is not active");
        }

        // Update assignment status
        assignment.setStatus(CrewAssignmentEntity.AssignmentStatus.REMOVED);
        assignment.setUnassignedAt(Instant.now());
        assignmentRepository.save(assignment);

        // Update crew current size
        CrewEntity crew = assignment.getCrew();
        crew.setCurrentSize(Math.max(0, crew.getCurrentSize() - 1));
        crew.setUpdatedAt(Instant.now());
        crewRepository.save(crew);
    }

    @Transactional(readOnly = true)
    public List<CrewAssignmentDto> getCrewAssignments(UUID crewId) {
        log.debug("Getting assignments for crew: {}", crewId);

        List<CrewAssignmentEntity> assignments = assignmentRepository
                .findByCrewIdAndStatusOrderByAssignedAt(crewId, CrewAssignmentEntity.AssignmentStatus.ACTIVE);

        return assignments.stream()
                .map(assignmentMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CrewAssignmentDto> getUserAssignments(UUID userId) {
        log.debug("Getting assignments for user: {}", userId);

        List<CrewAssignmentEntity> assignments = assignmentRepository
                .findByUserIdAndStatusOrderByAssignedAt(userId, CrewAssignmentEntity.AssignmentStatus.ACTIVE);

        return assignments.stream()
                .map(assignmentMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CrewAssignmentDto getUserEventAssignment(UUID eventId, UUID userId) {
        log.debug("Getting assignment for user: {} in event: {}", userId, eventId);

        CrewAssignmentEntity assignment = assignmentRepository
                .findByEventIdAndUserIdAndStatus(eventId, userId, CrewAssignmentEntity.AssignmentStatus.ACTIVE)
                .orElseThrow(() -> new AssignmentNotFoundException(
                        "No active assignment found for user " + userId + " in event " + eventId));

        return assignmentMapper.toDto(assignment);
    }
}