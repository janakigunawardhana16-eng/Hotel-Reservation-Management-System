package com.example.hotelroomservice.repository;

import com.example.hotelroomservice.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {
}