package com.parking.dao;

import com.parking.model.ParkingSlot;
import com.parking.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ParkingSlotDAO {

    public List<ParkingSlot> getAllSlots() throws SQLException {
        List<ParkingSlot> slots = new ArrayList<>();
        String sql = "SELECT * FROM parking_slots ORDER BY slot_number";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                slots.add(mapRow(rs));
            }
        }
        return slots;
    }

    public ParkingSlot getSlotById(int id) throws SQLException {
        String sql = "SELECT * FROM parking_slots WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    public boolean checkIn(int slotId, String carNumber, String carOwner, String carType, String qrBase64) throws SQLException {
        String sql = "UPDATE parking_slots SET status='occupied', car_number=?, car_owner=?, car_type=?, check_in_time=NOW(), qr_code=? WHERE id=? AND status='empty'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, carNumber);
            ps.setString(2, carOwner);
            ps.setString(3, carType);
            ps.setString(4, qrBase64);
            ps.setInt(5, slotId);
            return ps.executeUpdate() > 0;
        }
    }

    public CheckoutResult checkOut(int slotId) throws SQLException {
        // Fetch slot details first
        ParkingSlot slot = getSlotById(slotId);
        if (slot == null || !"occupied".equals(slot.getStatus())) return null;

        // Calculate fare
        String calcSql = "SELECT TIMESTAMPDIFF(MINUTE, check_in_time, NOW()) AS minutes FROM parking_slots WHERE id=?";
        long minutes = 0;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(calcSql)) {
            ps.setInt(1, slotId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) minutes = rs.getLong("minutes");
            }
        }

        // Fare: ₹100 for first hour, ₹50 for each subsequent hour (minimum ₹100)
        long hours = (long) Math.ceil(minutes / 60.0);
        if (hours < 1) hours = 1;
        long fare = 100 + (hours - 1) * 50;

        // Clear slot
        String updateSql = "UPDATE parking_slots SET status='empty', car_number=NULL, car_owner=NULL, car_type=NULL, check_in_time=NULL, qr_code=NULL WHERE id=?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(updateSql)) {
            ps.setInt(1, slotId);
            ps.executeUpdate();
        }

        CheckoutResult result = new CheckoutResult();
        result.setSlot(slot);
        result.setMinutesParked(minutes);
        result.setFare(fare);
        return result;
    }

    private ParkingSlot mapRow(ResultSet rs) throws SQLException {
        ParkingSlot s = new ParkingSlot();
        s.setId(rs.getInt("id"));
        s.setSlotNumber(rs.getString("slot_number"));
        s.setStatus(rs.getString("status"));
        s.setCarNumber(rs.getString("car_number"));
        s.setCarOwner(rs.getString("car_owner"));
        s.setCarType(rs.getString("car_type"));
        Timestamp ts = rs.getTimestamp("check_in_time");
        s.setCheckInTime(ts != null ? ts.toString() : null);
        s.setQrCode(rs.getString("qr_code"));
        return s;
    }

    public static class CheckoutResult {
        private ParkingSlot slot;
        private long minutesParked;
        private long fare;

        public ParkingSlot getSlot() { return slot; }
        public void setSlot(ParkingSlot slot) { this.slot = slot; }
        public long getMinutesParked() { return minutesParked; }
        public void setMinutesParked(long minutesParked) { this.minutesParked = minutesParked; }
        public long getFare() { return fare; }
        public void setFare(long fare) { this.fare = fare; }
    }
}
