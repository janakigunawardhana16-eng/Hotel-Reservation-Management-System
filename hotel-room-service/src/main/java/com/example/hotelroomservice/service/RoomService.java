package com.example.hotelroomservice.service;

import com.example.hotelroomservice.model.Room;
import com.example.hotelroomservice.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(String id) {
        return roomRepository.findById(id);
    }

    public Room updateRoom(String id, Room updatedRoom) {
        return roomRepository.findById(id)
                .map(existingRoom -> {

                    existingRoom.setHotelId(updatedRoom.getHotelId());
                    existingRoom.setRoomNumber(updatedRoom.getRoomNumber());
                    existingRoom.setRoomType(updatedRoom.getRoomType());
                    existingRoom.setPrice(updatedRoom.getPrice());
                    existingRoom.setCapacity(updatedRoom.getCapacity());
                    existingRoom.setAvailable(updatedRoom.isAvailable());

                    return roomRepository.save(existingRoom);
                })
                .orElse(null);
    }

    public void deleteRoom(String id) {
        roomRepository.deleteById(id);
    }
}