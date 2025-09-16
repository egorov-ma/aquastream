package org.aquastream.crew.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aquastream.crew.dto.CrewAssignmentDto;
import org.aquastream.crew.dto.CreateAssignmentDto;
import org.aquastream.crew.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@Validated
@Slf4j
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<CrewAssignmentDto> createAssignment(
            @Valid @RequestBody CreateAssignmentDto createAssignmentDto) {
        
        log.info("Creating assignment for user: {} to crew: {}", 
                createAssignmentDto.getUserId(), createAssignmentDto.getCrewId());
        
        CrewAssignmentDto assignment = assignmentService.createAssignment(createAssignmentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> removeAssignment(@PathVariable UUID assignmentId) {
        
        log.info("Removing assignment: {}", assignmentId);
        
        assignmentService.removeAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/crews/{crewId}")
    public ResponseEntity<List<CrewAssignmentDto>> getCrewAssignments(@PathVariable UUID crewId) {
        
        log.info("Getting assignments for crew: {}", crewId);
        
        List<CrewAssignmentDto> assignments = assignmentService.getCrewAssignments(crewId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<CrewAssignmentDto>> getUserAssignments(@PathVariable UUID userId) {
        
        log.info("Getting assignments for user: {}", userId);
        
        List<CrewAssignmentDto> assignments = assignmentService.getUserAssignments(userId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/events/{eventId}/users/{userId}")
    public ResponseEntity<CrewAssignmentDto> getUserEventAssignment(
            @PathVariable UUID eventId,
            @PathVariable UUID userId) {
        
        log.info("Getting assignment for user: {} in event: {}", userId, eventId);
        
        CrewAssignmentDto assignment = assignmentService.getUserEventAssignment(eventId, userId);
        return ResponseEntity.ok(assignment);
    }
}