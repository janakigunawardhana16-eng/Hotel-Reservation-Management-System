package com.example.hotelroomservice.controller;

import com.example.hotelroomservice.model.Hotel;
import com.example.hotelroomservice.service.HotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    // Create a new hotel room
    @PostMapping
    public Hotel createHotel(@RequestBody Hotel hotel) {
        return hotelService.createHotel(hotel);
    }

    // Get all hotel rooms
    @GetMapping
    public List<Hotel> getAllHotels() {
        return hotelService.getAllHotels();
    }

    // Get hotel room by ID
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable String id) {
        return hotelService.getHotelById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update hotel room by ID
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(
            @PathVariable String id,
            @RequestBody Hotel hotel) {

        Hotel updatedHotel = hotelService.updateHotel(id, hotel);

        if (updatedHotel == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedHotel);
    }

    // Delete hotel room by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable String id) {

        if (hotelService.getHotelById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}