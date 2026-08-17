package com.example.hotelroomservice.controller;

import com.example.hotelroomservice.model.Room;
import com.example.hotelroomservice.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // Create a new room
    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomService.createRoom(room);
    }

    // Get all rooms
    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    // Get room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update room
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable String id,
            @RequestBody Room room) {

        Room updatedRoom = roomService.updateRoom(id, room);

        if (updatedRoom == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedRoom);
    }

    // Delete room
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {

        if (roomService.getRoomById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}